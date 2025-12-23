const { Server } = require('socket.io');
const axios = require('axios');
const mongoose = require('mongoose');
const config = require('../config');
const Emotion = require('../models/Emotion');
const confusionService = require('./confusionService');

/* ---------- In-memory state ---------- */
const studentMap = new Map();    // socketId -> { studentId, name, classId }
const preSnapshots = new Map();  // socketId -> [snapshots]
const processing = new Map();    // studentId -> boolean
const classAggregators = new Map(); // classId -> Map(studentId -> agg)
const detectionActive = new Map(); // classId -> boolean
const activeClasses = new Set(); // classId -> tracks classes with active teachers

/* ---------- Aggregation helpers ---------- */
function ensureStudentAgg(classId, studentId, name) {
    if (!classAggregators.has(classId)) classAggregators.set(classId, new Map());
    const classMap = classAggregators.get(classId);
    if (!classMap.has(studentId)) {
        classMap.set(studentId, { name: name || 'Unknown', events: [], counts: {}, totalEngagement: 0, samples: 0, avgEngagement: 0, lastSeen: null });
    }
    return classMap.get(studentId);
}

function pushEventToAgg(classId, studentId, name, ev) {
    const agg = ensureStudentAgg(classId, studentId, name);
    agg.events.push(ev);
    agg.counts[ev.emotion] = (agg.counts[ev.emotion] || 0) + 1;
    agg.totalEngagement += (ev.engagement || 0);
    agg.samples += 1;
    agg.avgEngagement = agg.samples ? (agg.totalEngagement / agg.samples) : 0;
    agg.lastSeen = ev.timestamp;
    if (agg.events.length > 200) agg.events.shift();
}

/* ---------- Engagement scoring ---------- */
function computeEngagement(emotion, confidence = 0) {
    const emo = (emotion || '').toLowerCase();
    const weights = {
        happy: 30, surprise: 20, neutral: 10,
        sad: -20, fear: -25, disgust: -30, angry: -35,
        no_face: -60, 'no face': -60, 'no_face': -60
    };
    const w = weights[emo] ?? 0;
    const conf = Math.max(0, Math.min(1, Number(confidence) || 0));
    const confidenceFactor = 0.7 + (conf * 0.5);
    const base = 50;
    let score = base + (w * confidenceFactor);
    return Math.max(0, Math.min(100, Math.round(score)));
}

/* ---------- Snapshot processing ---------- */
async function processSnapshot(io, data, socket) {
    const meta = studentMap.get(socket.id) || {};
    const studentId = data.studentId || meta.studentId;
    const name = data.name || meta.name;
    const classId = data.classId || meta.classId;
    const image = data.image;

    if (!image || !studentId || !classId) {
        socket.emit('snapshot_ack', { status: 'error', reason: 'missing fields' });
        return;
    }

    if (processing.get(studentId)) {
        socket.emit('snapshot_ack', { status: 'queued' });
        return;
    }
    processing.set(studentId, true);

    try {
        const resp = await axios.post(config.PY_API, { image, studentId, name, classId }, { timeout: 20000 });
        const result = resp.data || {};

        if (result.success === false) {
            console.error('[processSnapshot] AI server error:', result.error);
            socket.emit('snapshot_ack', { status: 'error', reason: result.error || 'AI server error' });
            return;
        }

        const sid = result.studentId || studentId;
        let emotion = (result.emotion || 'neutral').toLowerCase();

        // Normalize emotion
        const emotionMap = {
            'angry': 'angry', 'disgust': 'disgust', 'disgusted': 'disgust',
            'fear': 'fear', 'fearful': 'fear', 'happy': 'happy',
            'sad': 'sad', 'sadness': 'sad', 'surprise': 'surprise', 'surprised': 'surprise',
            'neutral': 'neutral', 'no_face': 'neutral', 'no face': 'neutral',
            'unknown': 'neutral', '': 'neutral'
        };
        emotion = emotionMap[emotion] || 'neutral';

        let confidence = parseFloat(result.confidence || 0);
        if (confidence > 1.0) confidence = confidence / 100.0;
        if (emotion !== 'no_face' && emotion !== 'neutral' && confidence < 0.1) confidence = 0.1;

        const engagement = computeEngagement(emotion, confidence);

        // Async DB save
        if (mongoose.connection.readyState === 1) {
            Emotion.create({ studentId: sid, name, classId, emotion, confidence, engagement })
                .catch(e => console.warn('[DB] write failed', e.message));
        }

        const nameToSend = result.name || name || 'Unknown';
        const ev = { emotion, confidence, engagement, timestamp: new Date().toISOString() };
        pushEventToAgg(classId, sid, nameToSend, ev);

        // Confusion Logic
        confusionService.updateConfusionData(sid, emotion, engagement, false, false);
        const confusionScore = confusionService.calculateConfusionScore(sid);
        const confusionLevel = confusionService.getConfusionLevel(confusionScore);

        if (confusionScore >= confusionService.CONFUSION_THRESHOLD) {
            io.to(classId).emit('confusion_alert', {
                studentId: sid,
                name: nameToSend,
                confusionScore,
                confusionLevel,
                reason: `Negative emotions (${emotion}) and low engagement detected`
            });
        }

        io.to(classId).emit('confusion_update', {
            studentId: sid,
            name: nameToSend,
            confusionScore,
            confusionLevel
        });

        io.to(classId).emit('emotion_update', {
            studentId: sid,
            name: nameToSend,
            emotion,
            confidence,
            engagement,
            confusionScore,
            confusionLevel,
            timestamp: new Date(),
            box: result.box || null,
            source: result.source || 'py-model'
        });

        socket.emit('snapshot_ack', { status: 'ok' });

    } catch (err) {
        console.error('[processSnapshot] error', err.message);
        socket.emit('snapshot_ack', { status: 'error', reason: err.message });
    } finally {
        processing.set(studentId, false);
    }
}

function init(server) {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling'],
        allowEIO3: true,
        pingTimeout: 60000,
        pingInterval: 25000
    });

    io.on('connection', (socket) => {
        console.log('[socket] connected', socket.id);

        // handle teacher_join
        socket.on('teacher_join', (payload) => {
            const { classId } = payload || {};
            if (!classId) return socket.emit('teacher_join_ack', { status: 'error', reason: 'missing classId' });

            socket.join(classId);
            activeClasses.add(classId);
            console.log(`[teacher_join] Teacher joined ${classId}`);
            socket.emit('teacher_join_ack', { status: 'ok', classId });

            for (const [sockId, meta] of studentMap.entries()) {
                if (meta && meta.classId === classId) {
                    socket.emit('student_joined', { studentId: meta.studentId, name: meta.name, socketId: sockId });
                }
            }
        });

        // handle join_class
        socket.on('join_class', (payload) => {
            const { studentId, name, classId } = payload || {};
            if (!classId || !studentId) return socket.emit('join_ack', { status: 'error', reason: 'missing fields' });

            if (!activeClasses.has(classId)) {
                // In Development mode, allow students to join even if teacher hasn't started class
                if (config.NODE_ENV === 'development') {
                    console.log(`[DEV] Auto-creating class ${classId} for student join`);
                    activeClasses.add(classId);
                } else {
                    return socket.emit('join_ack', {
                        status: 'error',
                        reason: 'class_not_found',
                        message: 'No class exists with this Class ID.'
                    });
                }
            }

            studentMap.set(socket.id, { studentId, name, classId });
            socket.join(classId);
            console.log(`[join_class] ${studentId} (${name}) joined ${classId}`);
            io.to(classId).emit('student_joined', { studentId, name, socketId: socket.id });
            socket.emit('join_ack', { status: 'ok', studentId, name, classId });

            const q = preSnapshots.get(socket.id) || [];
            if (q.length) {
                q.forEach(s => processSnapshot(io, s, socket));
                preSnapshots.delete(socket.id);
            }
        });

        // handle start/stop detection
        socket.on('start_detection', ({ classId }) => {
            if (classId) {
                detectionActive.set(classId, true);
                console.log(`[start_detection] Detection started for ${classId}`);
                io.to(classId).emit('detection_started', { classId });
            }
        });

        socket.on('stop_detection', ({ classId }) => {
            if (classId) {
                detectionActive.set(classId, false);
                console.log(`[stop_detection] Detection stopped for ${classId}`);
                io.to(classId).emit('detection_stopped', { classId });
            }
        });

        // handle camera state
        socket.on('camera_state', (data) => {
            const { studentId, name, classId, enabled } = data || {};
            if (classId && studentId !== undefined) {
                io.to(classId).emit('student_camera_state', { studentId, name, enabled: enabled === true });
            }
        });

        // handle video stream
        socket.on('video_stream', (data) => {
            const meta = studentMap.get(socket.id);
            if (meta && data.image) {
                io.to(meta.classId).emit('student_video_stream', {
                    studentId: meta.studentId,
                    name: meta.name,
                    image: data.image
                });
            }
        });

        // handle snapshot
        socket.on('snapshot', (data) => {
            const meta = studentMap.get(socket.id);
            if (!meta) {
                let q = preSnapshots.get(socket.id) || [];
                if (q.length < 3) q.push(data);
                preSnapshots.set(socket.id, q);
                return socket.emit('snapshot_ack', { status: 'queued_before_join' });
            }

            const isActive = detectionActive.get(meta.classId);
            if (isActive === false) return socket.emit('snapshot_ack', { status: 'detection_inactive' });

            processSnapshot(io, data, socket);
        });

        // Confusion events
        socket.on('raise_hand', (d) => {
            if (d && d.classId && d.studentId) {
                confusionService.updateConfusionData(d.studentId, null, null, false, true);
                const confusionScore = confusionService.calculateConfusionScore(d.studentId);
                const confusionLevel = confusionService.getConfusionLevel(confusionScore);

                if (confusionScore >= confusionService.CONFUSION_THRESHOLD) {
                    io.to(d.classId).emit('confusion_alert', {
                        studentId: d.studentId, name: d.name, confusionScore, confusionLevel, reason: 'Frequent raise hands detected'
                    });
                }
                io.to(d.classId).emit('confusion_update', {
                    studentId: d.studentId, name: d.name, confusionScore, confusionLevel
                });
                io.to(d.classId).emit('raise_hand', d);
            }
        });

        socket.on('lower_hand', (d) => {
            if (d && d.classId) io.to(d.classId).emit('lower_hand', d);
        });

        socket.on('ask_doubt', (d) => {
            if (d && d.classId && d.studentId) {
                confusionService.updateConfusionData(d.studentId, null, null, true, false);
                const confusionScore = confusionService.calculateConfusionScore(d.studentId);
                const confusionLevel = confusionService.getConfusionLevel(confusionScore);

                if (confusionScore >= confusionService.CONFUSION_THRESHOLD) {
                    io.to(d.classId).emit('confusion_alert', {
                        studentId: d.studentId, name: d.name, confusionScore, confusionLevel, reason: 'Doubt question asked'
                    });
                }
                io.to(d.classId).emit('confusion_update', {
                    studentId: d.studentId, name: d.name, confusionScore, confusionLevel
                });
                io.to(d.classId).emit('ask_doubt', d);
                console.log(`[ask_doubt] ${d.name} in ${d.classId}: ${d.doubt}`);
            }
        });

        // Teacher video
        socket.on('teacher_video', ({ classId, image }) => {
            if (classId && image) io.to(classId).emit('teacher_video', { image });
        });

        socket.on('teacher_video_stopped', ({ classId }) => {
            if (classId) io.to(classId).emit('teacher_video_stopped', { classId });
        });

        socket.on('disconnect', () => {
            const meta = studentMap.get(socket.id);
            if (meta) {
                io.to(meta.classId).emit('student_left', { studentId: meta.studentId, name: meta.name });
                confusionService.removeStudentData(meta.studentId);
                studentMap.delete(socket.id);
            }
            preSnapshots.delete(socket.id);
            console.log('[socket] disconnected', socket.id);
        });
    });

    return { studentMap, classAggregators, activeClasses };
}

module.exports = { init };
