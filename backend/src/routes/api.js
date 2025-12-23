const express = require('express');
const router = express.Router();

// We need access to the in-memory state exposed by socketService
let studentMap, classAggregators, activeClasses;

function initRoutes(sMap, cAgg, aClasses) {
    studentMap = sMap;
    classAggregators = cAgg;
    activeClasses = aClasses;
    return router;
}

router.get('/class/:classId/roster', (req, res) => {
    const classId = req.params.classId;
    const roster = [];
    if (studentMap) {
        for (const [sockId, meta] of studentMap.entries()) {
            if (meta && meta.classId === classId) roster.push({ studentId: meta.studentId, name: meta.name, socketId: sockId });
        }
    }
    res.json({ success: true, roster });
});

router.get('/class/:classId/summary', (req, res) => {
    const classId = req.params.classId;
    const classMap = classAggregators ? classAggregators.get(classId) : null;
    if (!classMap) return res.json({ success: true, summary: {} });
    const out = {};
    for (const [sid, agg] of classMap.entries()) {
        const dominant = Object.entries(agg.counts || {}).sort((a, b) => b[1] - a[1])[0];
        out[sid] = { studentId: sid, name: agg.name, totalSamples: agg.samples, avgEngagement: Number((agg.avgEngagement || 0).toFixed(2)), dominantEmotion: dominant ? dominant[0] : null, counts: agg.counts, lastSeen: agg.lastSeen, eventsSample: agg.events.slice(-10) };
    }
    res.json({ success: true, summary: out });
});

router.get('/class/:classId/check', (req, res) => {
    const classId = req.params.classId;
    // In development, say YES to everything so we can test easily
    const isDev = process.env.NODE_ENV === 'development';
    const exists = isDev || (activeClasses ? activeClasses.has(classId) : false);
    res.json({ success: true, exists, classId, isDev });
});

module.exports = { router, initRoutes };
