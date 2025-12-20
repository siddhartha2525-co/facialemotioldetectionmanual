const mongoose = require('mongoose');

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

module.exports = Emotion;
