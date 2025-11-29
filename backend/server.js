// backend/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const app = express();
app.use(express.json({ limit: '12mb' }));
// Enhanced CORS for Railway deployment
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

const server = http.createServer(app);
// Enhanced Socket.io configuration for Railway
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

const PORT = process.env.PORT || 5001;
const PY_API = process.env.PY_API || 'http://localhost:8000/analyze';
const MONGO_URI = process.env.MONGO_URI || '';

/* ---------- MongoDB Model ---------- */
let Emotion;
try {
  Emotion = mongoose.model('Emotion');
} catch (e) {
  const schema = new mongoose.Schema({
    studentId: String,
    name: String,
    classId: String,
    emotion: String,
    confidence: Number,
    engagement: Number,
    timestamp: { type: Date, default: Date.now }
  });
  Emotion = mongoose.model('Emotion', schema);
}

/* ---------- Mongoose connect (v7+) ---------- */
if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err.message));
} else {
  console.warn("⚠️ No MONGO_URI provided — Database disabled");
}

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
  // Normalize emotion to lowercase for consistent matching
  const emo = (emotion || '').toLowerCase();
  const weights = {
    happy: 30,
    surprise: 20,
    neutral: 10,
    sad: -20,
    fear: -25,
    disgust: -30,
    angry: -35,
    no_face: -60,
    // Handle variations
    'no face': -60,
    'no_face': -60
  };
  const w = weights[emo] ?? 0;
  
  // Confidence factor in [0.7, 1.2]
  const conf = Math.max(0, Math.min(1, Number(confidence) || 0));
  const confidenceFactor = 0.7 + (conf * 0.5);
  
  const base = 50;
  let score = base + (w * confidenceFactor);
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  return score;
}

/* ---------- Socket.io ---------- */
io.on('connection', (socket) => {
  console.log('[socket] connected', socket.id);

  // handle teacher_join
  socket.on('teacher_join', (payload) => {
    const { classId } = payload || {};
    if (!classId) {
      socket.emit('teacher_join_ack', { status: 'error', reason: 'missing classId' });
      return;
    }
    socket.join(classId);
    activeClasses.add(classId); // Mark class as active
    console.log(`[teacher_join] Teacher joined ${classId}`);
    socket.emit('teacher_join_ack', { status: 'ok', classId });
    
    // Send current roster to teacher
    const roster = [];
    for (const [sockId, meta] of studentMap.entries()) {
      if (meta && meta.classId === classId) {
        roster.push({ studentId: meta.studentId, name: meta.name, socketId: sockId });
        socket.emit('student_joined', { studentId: meta.studentId, name: meta.name, socketId: sockId });
      }
    }
  });

  // handle join_class
  socket.on('join_class', (payload) => {
    const { studentId, name, classId } = payload || {};
    if (!classId || !studentId) {
      socket.emit('join_ack', { status: 'error', reason: 'missing fields' });
      return;
    }
    
    // Check if class exists (has an active teacher)
    if (!activeClasses.has(classId)) {
      socket.emit('join_ack', { 
        status: 'error', 
        reason: 'class_not_found',
        message: 'No class exists with this Class ID. Please check the Class ID and try again.' 
      });
      console.log(`[join_class] Rejected: ${studentId} tried to join non-existent class ${classId}`);
      return;
    }
    
    studentMap.set(socket.id, { studentId, name, classId });
    socket.join(classId);
    console.log(`[join_class] ${studentId} (${name}) joined ${classId}`);
    io.to(classId).emit('student_joined', { studentId, name, socketId: socket.id });
    socket.emit('join_ack', { status: 'ok', studentId, name, classId });

    const q = preSnapshots.get(socket.id) || [];
    if (q.length) {
      q.forEach(s => processSnapshot(s, socket));
      preSnapshots.delete(socket.id);
    }
  });

  // handle start/stop detection
  socket.on('start_detection', (payload) => {
    const { classId } = payload || {};
    if (classId) {
      detectionActive.set(classId, true);
      console.log(`[start_detection] Detection started for ${classId}`);
      io.to(classId).emit('detection_started', { classId });
    }
  });

  socket.on('stop_detection', (payload) => {
    const { classId } = payload || {};
    if (classId) {
      detectionActive.set(classId, false);
      console.log(`[stop_detection] Detection stopped for ${classId}`);
      io.to(classId).emit('detection_stopped', { classId });
    }
  });

  // handle camera state changes
  socket.on('camera_state', (data) => {
    const { studentId, name, classId, enabled } = data || {};
    if (classId && studentId !== undefined) {
      io.to(classId).emit('student_camera_state', {
        studentId,
        name,
        enabled: enabled === true
      });
      console.log(`[camera_state] ${name} (${studentId}) camera ${enabled ? 'enabled' : 'disabled'}`);
    }
  });

  // handle video stream (for smooth display, not for detection)
  socket.on('video_stream', (data) => {
    const meta = studentMap.get(socket.id);
    if (!meta) return;
    
    // Forward video stream to teachers for smooth display
    if (data.image) {
      io.to(meta.classId).emit('student_video_stream', {
        studentId: meta.studentId,
        name: meta.name,
        image: data.image
      });
    }
  });

  // handle snapshots (for detection only, not for display)
  socket.on('snapshot', (data) => {
    const meta = studentMap.get(socket.id);
    if (!meta) {
      let q = preSnapshots.get(socket.id) || [];
      if (q.length < 3) q.push(data);
      preSnapshots.set(socket.id, q);
      socket.emit('snapshot_ack', { status: 'queued_before_join' });
      return;
    }
    
    // Check if detection is active for this class
    const isActive = detectionActive.get(meta.classId);
    if (isActive === false) {
      socket.emit('snapshot_ack', { status: 'detection_inactive' });
      return;
    }
    
    // Don't forward snapshot to teachers for display - only use for detection
    // Video stream handles the display
    
    processSnapshot(data, socket);
  });

  // raise hand / lower hand / ask doubt realtime events
  socket.on('raise_hand', (d) => {
    // pass to the class room so teacher(s) receive
    if (d && d.classId) {
      io.to(d.classId).emit('raise_hand', d);
      console.log(`[raise_hand] ${d.name} (${d.studentId}) in ${d.classId}`);
    }
  });

  socket.on('lower_hand', (d) => {
    if (d && d.classId) {
      io.to(d.classId).emit('lower_hand', d);
      console.log(`[lower_hand] ${d.name} (${d.studentId}) in ${d.classId}`);
    }
  });

  socket.on('ask_doubt', (d) => {
    if (d && d.classId) {
      io.to(d.classId).emit('ask_doubt', d);
      console.log(`[ask_doubt] ${d.name} (${d.studentId}) in ${d.classId}: ${d.doubt}`);
    }
  });

  // handle teacher video
  socket.on('teacher_video', (payload) => {
    const { classId, image } = payload || {};
    if (classId && image) {
      // Broadcast teacher video to all students in the class
      io.to(classId).emit('teacher_video', { image });
    }
  });

  socket.on('teacher_video_stopped', (payload) => {
    const { classId } = payload || {};
    if (classId) {
      io.to(classId).emit('teacher_video_stopped', { classId });
    }
  });

  socket.on('disconnect', () => {
    const meta = studentMap.get(socket.id);
    if (meta) {
      io.to(meta.classId).emit('student_left', { studentId: meta.studentId, name: meta.name });
      studentMap.delete(socket.id);
    }
    preSnapshots.delete(socket.id);
    
    // Check if any teachers are still in the class room
    // If no teachers remain, we could optionally remove the class from activeClasses
    // For now, we keep it active until server restart or explicit cleanup
    console.log('[socket] disconnected', socket.id);
  });
});

/* ---------- Snapshot processing ---------- */
async function processSnapshot(data, socket) {
  const meta = studentMap.get(socket.id) || {};
  const studentId = data.studentId || meta.studentId;
  const name = data.name || meta.name;
  const classId = data.classId || meta.classId;
  const image = data.image;
  if (!image || !studentId || !classId) {
    socket.emit('snapshot_ack', { status: 'error', reason: 'missing fields' });
    return;
  }
  // Skip if already processing (prevents queue buildup)
  if (processing.get(studentId)) { 
    socket.emit('snapshot_ack', { status: 'queued' }); 
    return; 
  }
  processing.set(studentId, true);
  try {
    // Reduced timeout for faster failure recovery (15s instead of 30s)
    const resp = await axios.post(PY_API, { image, studentId, name, classId }, { timeout: 15000 });
    const result = resp.data || {};
    
    // Check if API returned an error
    if (result.success === false) {
      console.error('[processSnapshot] AI server error:', result.error);
      socket.emit('snapshot_ack', { status: 'error', reason: result.error || 'AI server error' });
      return;
    }
    
    const sid = result.studentId || studentId;
    let emotion = (result.emotion || 'neutral').toLowerCase();  // Default to neutral instead of unknown
    
    // Map DeepFace emotions to standard set (comprehensive mapping)
    const emotionMap = {
      'angry': 'angry',
      'disgust': 'disgust',
      'disgusted': 'disgust',
      'fear': 'fear',
      'fearful': 'fear',
      'happy': 'happy',
      'sad': 'sad',
      'sadness': 'sad',
      'surprise': 'surprise',
      'surprised': 'surprise',
      'neutral': 'neutral',
      'no_face': 'neutral',  // Map no_face to neutral for better UX
      'no face': 'neutral',
      'unknown': 'neutral',  // Map unknown to neutral
      '': 'neutral'  // Empty string to neutral
    };
    
    emotion = emotionMap[emotion] || 'neutral';  // Always default to neutral if not in map
    
    // Confidence is returned as percentage (0-100) or decimal (0-1)
    let confidence = parseFloat(result.confidence || 0);
    // If confidence is > 1, it's already a percentage, convert to decimal
    if (confidence > 1.0) {
      confidence = confidence / 100.0; // Normalize to 0-1
    }
    // Ensure confidence is at least 0.1 if we have an emotion (avoid zero confidence)
    if (emotion !== 'no_face' && emotion !== 'neutral' && confidence < 0.1) {
      confidence = 0.1;
    }
    
    // Get source from result (openface or facenet512)
    const source = result.source || 'py-model';
    
    // Use confidence-weighted engagement calculation
    const engagement = computeEngagement(emotion, confidence);
    if (Emotion && mongoose.connection.readyState === 1) {
      try { await Emotion.create({ studentId: sid, name, classId, emotion, confidence, engagement }); } catch(e){ console.warn('[DB] write failed', e.message || e); }
    }
    const nameToSend = result.name || name || 'Unknown';
    const ev = { emotion, confidence, engagement, timestamp: new Date().toISOString() };
    pushEventToAgg(classId, sid, nameToSend, ev);
    // Don't include image in emotion_update - video stream handles display
    // Detection snapshots are for backend processing only
    io.to(classId).emit('emotion_update', { 
      studentId: sid, 
      name: nameToSend, 
      emotion, 
      confidence, 
      engagement, 
      timestamp: new Date(), 
      box: result.box || null,
      source: source  // Include source (openface or facenet512)
    });
    socket.emit('snapshot_ack', { status: 'ok' });
  } catch (err) {
    console.error('[processSnapshot] error', err.message || err);
    // Log more details for debugging
    if (err.response) {
      console.error('[processSnapshot] API response error:', err.response.status, err.response.data);
    }
    socket.emit('snapshot_ack', { status: 'error', reason: err.message || String(err) });
  } finally {
    processing.set(studentId, false);
  }
}

/* ---------- API Endpoints ---------- */
app.get('/api/health', (req, res) => res.json({ success: true, ts: Date.now() }));

app.get('/api/class/:classId/roster', (req, res) => {
  const classId = req.params.classId;
  const roster = [];
  for (const [sockId, meta] of studentMap.entries()) {
    if (meta && meta.classId === classId) roster.push({ studentId: meta.studentId, name: meta.name, socketId: sockId });
  }
  res.json({ success: true, roster });
});

app.get('/api/class/:classId/summary', (req, res) => {
  const classId = req.params.classId;
  const classMap = classAggregators.get(classId);
  if (!classMap) return res.json({ success: true, summary: {} });
  const out = {};
  for (const [sid, agg] of classMap.entries()) {
    const dominant = Object.entries(agg.counts || {}).sort((a,b)=>b[1]-a[1])[0];
    out[sid] = { studentId: sid, name: agg.name, totalSamples: agg.samples, avgEngagement: Number((agg.avgEngagement||0).toFixed(2)), dominantEmotion: dominant ? dominant[0] : null, counts: agg.counts, lastSeen: agg.lastSeen, eventsSample: agg.events.slice(-10) };
  }
  res.json({ success: true, summary: out });
});

// Check if class exists
app.get('/api/class/:classId/check', (req, res) => {
  const classId = req.params.classId;
  const exists = activeClasses.has(classId);
  res.json({ success: true, exists, classId });
});

/* ---------- Start server ---------- */
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));