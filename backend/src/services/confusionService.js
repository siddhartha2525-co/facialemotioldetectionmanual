/* ---------- Confusion Detection System ---------- */
const confusionData = new Map(); // studentId -> { emotions: [], engagements: [], doubts: [], raiseHands: [], lastUpdate: Date }
const CONFUSION_WINDOW = 30000; // 30 seconds window for analysis
const CONFUSION_THRESHOLD = 60; // Confusion score threshold (0-100)

// Track confusion signals for each student
function updateConfusionData(studentId, emotion, engagement, hasDoubt = false, hasRaiseHand = false) {
    if (!confusionData.has(studentId)) {
        confusionData.set(studentId, {
            emotions: [],
            engagements: [],
            doubts: [],
            raiseHands: [],
            lastUpdate: new Date()
        });
    }

    const data = confusionData.get(studentId);
    const now = new Date();

    // Clean old data (outside 30 second window)
    const cutoff = now.getTime() - CONFUSION_WINDOW;

    data.emotions = data.emotions.filter(e => e.timestamp > cutoff);
    data.engagements = data.engagements.filter(e => e.timestamp > cutoff);
    data.doubts = data.doubts.filter(e => e.timestamp > cutoff);
    data.raiseHands = data.raiseHands.filter(e => e.timestamp > cutoff);

    // Add new data
    if (emotion) data.emotions.push({ emotion, timestamp: now.getTime() });
    if (engagement !== null && engagement !== undefined) data.engagements.push({ engagement, timestamp: now.getTime() });

    if (hasDoubt) {
        data.doubts.push({ timestamp: now.getTime() });
    }
    if (hasRaiseHand) {
        data.raiseHands.push({ timestamp: now.getTime() });
    }

    data.lastUpdate = now;
}

// Calculate confusion score based on multiple signals
function calculateConfusionScore(studentId) {
    const data = confusionData.get(studentId);
    if (!data || data.emotions.length === 0) {
        return 0; // No data = no confusion
    }

    let score = 0;
    const weights = {
        negativeEmotions: 40,  // 40% weight
        engagementDrop: 30,     // 30% weight
        doubts: 20,             // 20% weight
        raiseHands: 10          // 10% weight
    };

    // 1. Negative Emotions Signal (SAD, FEAR, ANGRY)
    const negativeEmotions = data.emotions.filter(e =>
        ['sad', 'fear', 'angry', 'disgust'].includes(e.emotion.toLowerCase())
    );
    const negativeEmotionRatio = negativeEmotions.length / Math.max(data.emotions.length, 1);
    const negativeEmotionScore = Math.min(negativeEmotionRatio * 100, 100);
    score += (negativeEmotionScore * weights.negativeEmotions) / 100;

    // 2. Engagement Drop Signal
    if (data.engagements.length >= 2) {
        const recentEngagement = data.engagements.slice(-5).reduce((sum, e) => sum + e.engagement, 0) / Math.min(5, data.engagements.length);
        const earlierEngagement = data.engagements.slice(0, Math.max(1, data.engagements.length - 5)).reduce((sum, e) => sum + e.engagement, 0) / Math.max(1, data.engagements.length - 5);

        if (earlierEngagement > 0) {
            const engagementDrop = ((earlierEngagement - recentEngagement) / earlierEngagement) * 100;
            const engagementDropScore = Math.max(0, Math.min(engagementDrop, 100));
            score += (engagementDropScore * weights.engagementDrop) / 100;
        }
    }

    // 3. Doubts Signal (frequent doubts = confusion)
    const doubtCount = data.doubts.length;
    const doubtScore = Math.min((doubtCount / 3) * 100, 100); // 3+ doubts in 30s = high confusion
    score += (doubtScore * weights.doubts) / 100;

    // 4. Raise Hand Signal (frequent raise hands = confusion)
    const raiseHandCount = data.raiseHands.length;
    const raiseHandScore = Math.min((raiseHandCount / 5) * 100, 100); // 5+ raise hands in 30s = confusion
    score += (raiseHandScore * weights.raiseHands) / 100;

    // Normalize to 0-100
    score = Math.min(Math.max(score, 0), 100);

    return Math.round(score);
}

// Get confusion level (LOW, MEDIUM, HIGH, CRITICAL)
function getConfusionLevel(score) {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    if (score >= 20) return 'LOW';
    return 'NONE';
}

function removeStudentData(studentId) {
    confusionData.delete(studentId);
}

module.exports = {
    updateConfusionData,
    calculateConfusionScore,
    getConfusionLevel,
    removeStudentData,
    CONFUSION_THRESHOLD
};
