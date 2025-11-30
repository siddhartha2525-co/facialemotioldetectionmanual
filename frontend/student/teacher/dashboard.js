// Auto-detect backend URL based on current host (works for localhost, IP, and cloud deployment)
// Supports both HTTP and HTTPS, and handles Railway deployment where services are separate
const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
const hostname = window.location.hostname;
const port = window.location.port;

// For Railway: services are separate, so we need to construct backend URL
let BACKEND_URL;

// Priority 1: Check for meta tag (set by Railway or manually)
const backendUrlMeta = document.querySelector('meta[name="backend-url"]');
if (backendUrlMeta && backendUrlMeta.content && backendUrlMeta.content.trim()) {
    BACKEND_URL = backendUrlMeta.content.trim();
    console.log("✅ Using backend URL from meta tag:", BACKEND_URL);
}
// Priority 2: Check for window variable (set by Railway or manually)
else if (window.EMOTION_BACKEND_URL) {
    BACKEND_URL = window.EMOTION_BACKEND_URL;
    console.log("✅ Using backend URL from window variable:", BACKEND_URL);
}
// Priority 3: Local network detection
else if (hostname === 'localhost' || hostname.match(/^192\.168\.|^10\.|^172\./)) {
    // Local network - use explicit port
    const BACKEND_PORT = window.EMOTION_BACKEND_PORT || '5001';
    BACKEND_URL = `${protocol}//${hostname}:${BACKEND_PORT}`;
    console.log("✅ Using local network backend URL:", BACKEND_URL);
}
// Priority 4: Railway deployment - try to detect
else if (hostname.includes('railway.app')) {
    // Railway deployment - services are separate
    // Railway HTTPS URLs don't use port numbers (they use port 443 automatically)
    // Try common patterns:
    if (hostname.includes('emotion-frontend')) {
        // Pattern: emotion-frontend.railway.app -> emotion-backend.railway.app
        const backendHostname = hostname.replace('emotion-frontend', 'emotion-backend');
        BACKEND_URL = `${protocol}//${backendHostname}`;
        console.log("✅ Detected Railway backend URL (pattern match):", BACKEND_URL);
    } else if (hostname.includes('frontend')) {
        // Pattern: *-frontend.railway.app -> *-backend.railway.app
        const backendHostname = hostname.replace('frontend', 'backend');
        BACKEND_URL = `${protocol}//${backendHostname}`;
        console.log("✅ Detected Railway backend URL (frontend->backend):", BACKEND_URL);
    } else {
        // Custom Railway domain - cannot auto-detect
        // Show error and instructions
        console.error("❌ Cannot auto-detect backend URL for Railway domain:", hostname);
        console.error("📋 Please set backend URL manually:");
        console.error("   1. Get your backend URL from Railway dashboard");
        console.error("   2. Add meta tag: <meta name='backend-url' content='https://your-backend.railway.app'>");
        console.error("   3. Or set window.EMOTION_BACKEND_URL in HTML");
        
        // Try same hostname as fallback (might work if behind reverse proxy)
        const BACKEND_PORT = window.EMOTION_BACKEND_PORT || '5001';
        BACKEND_URL = `${protocol}//${hostname}${port ? ':' + port : ''}`;
        console.warn("⚠️ Using fallback backend URL (may not work):", BACKEND_URL);
    }
} else {
    // Other cloud deployments - try same domain with port
    const BACKEND_PORT = window.EMOTION_BACKEND_PORT || '5001';
    BACKEND_URL = `${protocol}//${hostname}:${BACKEND_PORT}`;
    console.log("✅ Using default backend URL:", BACKEND_URL);
}

// Log backend URL for debugging
console.log("🔗 Backend URL:", BACKEND_URL);

const WS_URL = BACKEND_URL.replace('http://', 'ws://').replace('https://', 'wss://');
console.log("🔌 WebSocket URL:", WS_URL);

const socket = io(WS_URL, { 
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10, // More attempts for mobile
    timeout: 20000, // 20 seconds timeout for mobile networks
    transports: ['websocket', 'polling'], // Try both transports
    upgrade: true,
    rememberUpgrade: true
});

let selectedStudentId = null;
let studentsData = new Map(); // studentId -> { name, emotion, engagement, confidence, studentId, timeline, avgEngagement, image, cameraEnabled }
let studentCards = new Map(); // studentId -> { cardElement, imageElement }
let recentEvents = [];
let detectionActive = false;
let teacherStream = null;
let teacherVideoInterval = null;

// Load user info
const user = JSON.parse(localStorage.getItem("user") || "{}");
if (!user.email || user.role !== "teacher") {
    window.location.href = "../../login.html";
}

document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("user");
    window.location.href = "../../login.html";
};

// Class-ID button - show/hide input
let classInputVisible = false;
document.getElementById("classIdBtn").onclick = () => {
    classInputVisible = !classInputVisible;
    const input = document.getElementById("classInput");
    if (classInputVisible) {
        input.style.display = "block";
        input.focus();
    } else {
        input.style.display = "none";
    }
};

// Start/Stop Teacher Video buttons
document.getElementById("startTeacherVideoBtn").onclick = async () => {
    try {
        teacherStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        const classId = document.getElementById("classInput").value.trim() || "CLASS1";
        
        // Create a hidden video element to capture frames
        const video = document.createElement("video");
        video.srcObject = teacherStream;
        video.autoplay = true;
        video.playsInline = true;
        video.style.display = "none";
        document.body.appendChild(video);
        
        // Wait for video to be ready
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                resolve();
            };
        });
        
        // Start sending teacher video frames to students (smooth video)
        teacherVideoInterval = setInterval(() => {
            if (teacherStream && video.readyState >= 2) {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth || 640;
                canvas.height = video.videoHeight || 480;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                // Lower quality for smooth streaming
                const image = canvas.toDataURL("image/jpeg", 0.6);
                
                socket.emit("teacher_video", { classId, image });
            }
        }, 150); // Send every 150ms for smooth video (was 500ms)
        
        document.getElementById("startTeacherVideoBtn").style.display = "none";
        document.getElementById("stopTeacherVideoBtn").style.display = "inline-block";
        console.log("Teacher video started for class:", classId);
    } catch (err) {
        alert("Failed to start camera: " + err.message);
    }
};

document.getElementById("stopTeacherVideoBtn").onclick = () => {
    const classId = document.getElementById("classInput").value.trim() || "CLASS1";
    
    if (teacherStream) {
        teacherStream.getTracks().forEach(track => track.stop());
        teacherStream = null;
    }
    
    if (teacherVideoInterval) {
        clearInterval(teacherVideoInterval);
        teacherVideoInterval = null;
    }
    
    // Remove hidden video element
    const hiddenVideo = document.querySelector("video[style*='display: none']");
    if (hiddenVideo) {
        hiddenVideo.srcObject = null;
        hiddenVideo.remove();
    }
    
    socket.emit("teacher_video_stopped", { classId });
    document.getElementById("startTeacherVideoBtn").style.display = "inline-block";
    document.getElementById("stopTeacherVideoBtn").style.display = "none";
    console.log("Teacher video stopped for class:", classId);
};

// Start/Stop Detection buttons
document.getElementById("startDetectionBtn").onclick = () => {
    const classId = document.getElementById("classInput").value.trim() || "CLASS1";
    detectionActive = true;
    socket.emit("start_detection", { classId });
    document.getElementById("startDetectionBtn").style.display = "none";
    document.getElementById("stopDetectionBtn").style.display = "inline-block";
    console.log("Detection started for class:", classId);
};

document.getElementById("stopDetectionBtn").onclick = () => {
    const classId = document.getElementById("classInput").value.trim() || "CLASS1";
    detectionActive = false;
    socket.emit("stop_detection", { classId });
    document.getElementById("startDetectionBtn").style.display = "inline-block";
    document.getElementById("stopDetectionBtn").style.display = "none";
    console.log("Detection stopped for class:", classId);
};

// Load Roster button - manually refresh
document.getElementById("loadRoster").onclick = async () => {
    const classId = document.getElementById("classInput").value.trim() || "CLASS1";
    
    if (!socket.connected) {
        socket.connect();
        await new Promise(resolve => {
            socket.once("connect", resolve);
        });
    }
    
    socket.emit("teacher_join", { classId });
    loadRosterData(classId);
};

// Connection status
socket.on("connect", () => {
    console.log("✅ Teacher socket connected");
    const classId = document.getElementById("classInput").value.trim() || "CLASS1";
    console.log("Teacher joining class:", classId);
    socket.emit("teacher_join", { classId });
    
    // Also fetch current roster immediately
    setTimeout(() => loadRosterData(classId), 500);
});

socket.on("disconnect", () => {
    console.log("❌ Teacher socket disconnected");
});

socket.on("connect_error", (error) => {
    console.error("❌ Teacher socket connection error:", error);
    console.error("❌ Error details:", {
        message: error.message,
        type: error.type,
        description: error.description
    });
    console.error("❌ Attempted to connect to:", WS_URL);
    console.error("❌ Backend URL:", BACKEND_URL);
    
    // Show user-friendly error message
    const errorMsg = `Failed to connect to server.\n\n` +
        `Backend URL: ${BACKEND_URL}\n` +
        `WebSocket URL: ${WS_URL}\n\n` +
        `Error: ${error.message || 'Connection failed'}\n\n` +
        `Please check:\n` +
        `1. Backend service is running in Railway\n` +
        `2. Backend URL is correct\n` +
        `3. Network connection is active\n` +
        `4. Backend service logs for errors`;
    
    alert(errorMsg);
});

// Connect socket on page load and auto-join default class
socket.connect();

// Handle teacher join acknowledgment
socket.on("teacher_join_ack", (data) => {
    if (data.status === "ok") {
        console.log("Teacher successfully joined class:", data.classId);
        loadRosterData(data.classId);
    } else {
        console.error("Failed to join class:", data.reason);
    }
});

// Function to load roster data
async function loadRosterData(classId) {
    try {
        const baseUrl = WS_URL.replace('ws://', 'http://').replace('wss://', 'https://');
        const resp = await fetch(`${baseUrl}/api/class/${classId}/roster`);
        const data = await resp.json();
        if (data.success && data.roster) {
            console.log("Roster loaded:", data.roster);
            // Add students from roster
            data.roster.forEach(rosterItem => {
                if (!studentsData.has(rosterItem.studentId)) {
                    studentsData.set(rosterItem.studentId, {
                        name: rosterItem.name,
                        studentId: rosterItem.studentId,
                        emotion: "NEUTRAL",
                        engagement: 0,
                        confidence: 0,
                        timeline: [],
                        avgEngagement: 0,
                        samples: 0,
                        totalEngagement: 0,
                        image: null,
                        cameraEnabled: false
                    });
                }
            });
            updateStudentGrid();
        }
        
        // Also fetch summary to populate existing students with data
        const summaryResp = await fetch(`${baseUrl}/api/class/${classId}/summary`);
        const summaryData = await summaryResp.json();
        if (summaryData.success) {
            Object.values(summaryData.summary).forEach(student => {
                if (!studentsData.has(student.studentId)) {
                    studentsData.set(student.studentId, {
                        name: student.name,
                        studentId: student.studentId,
                        emotion: (student.dominantEmotion || "NEUTRAL").toUpperCase(),
                        engagement: student.avgEngagement || 0,
                        confidence: 0,
                        timeline: (student.eventsSample || []).map(ev => ({
                            time: new Date(ev.timestamp).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true 
                            }),
                            emotion: (ev.emotion || "NEUTRAL").toUpperCase(),
                            engagement: ev.engagement || 0
                        })),
                        avgEngagement: student.avgEngagement || 0,
                        samples: student.totalSamples || 0,
                        totalEngagement: (student.avgEngagement || 0) * (student.totalSamples || 0),
                        image: null
                    });
                } else {
                    // Update existing student with summary data
                    const existing = studentsData.get(student.studentId);
                    existing.avgEngagement = student.avgEngagement || 0;
                    if (student.dominantEmotion) {
                        existing.emotion = student.dominantEmotion.toUpperCase();
                    }
                }
            });
            updateStudentGrid();
        }
    } catch (err) {
        console.error("Error loading roster:", err);
    }
}

// Listen for student camera state changes
socket.on("student_camera_state", (data) => {
    const { studentId, enabled } = data;
    if (studentsData.has(studentId)) {
        studentsData.get(studentId).cameraEnabled = enabled;
        // Update display based on camera state
        updateStudentCameraDisplay(studentId, enabled);
    }
});

// Listen for student video stream (smooth video for display)
socket.on("student_video_stream", (data) => {
    const { studentId, image } = data;
    if (studentsData.has(studentId)) {
        const student = studentsData.get(studentId);
        // Only update image if camera is enabled
        if (student.cameraEnabled !== false) {
            student.image = image;
            student.cameraEnabled = true; // Implicitly enabled if receiving video
            // Update only the image, don't recreate the entire grid
            updateStudentVideoImage(studentId, image);
        }
    }
});

// Efficiently update only the video image without recreating the card
// Optimized for low latency and smooth video
function updateStudentVideoImage(studentId, image) {
    const cardData = studentCards.get(studentId);
    if (cardData && cardData.imageElement) {
        // Direct update for lowest latency - no debouncing needed
        // Update src directly for immediate display
        if (cardData.imageElement.src !== image) {
            // Use direct assignment for fastest update
            cardData.imageElement.src = image;
            // Force browser to update immediately
            cardData.imageElement.style.opacity = '0.99';
            // Small delay to ensure smooth transition
            setTimeout(() => {
                if (cardData.imageElement) {
                    cardData.imageElement.style.opacity = '1';
                }
            }, 10);
        }
        // Show image, hide placeholder
        const placeholder = cardData.cardElement.querySelector('.student-video-placeholder');
        if (placeholder) placeholder.style.display = 'none';
        if (cardData.imageElement) {
            cardData.imageElement.style.display = 'block';
            // Ensure image is visible and optimized
            cardData.imageElement.style.imageRendering = 'auto';
        }
    } else if (studentsData.has(studentId)) {
        // Card doesn't exist yet, need to create it
        updateStudentGrid();
    }
}

// Update camera display based on state
function updateStudentCameraDisplay(studentId, enabled) {
    const cardData = studentCards.get(studentId);
    const student = studentsData.get(studentId);
    
    if (!cardData || !student) return;
    
    const imageElement = cardData.imageElement;
    const placeholder = cardData.cardElement.querySelector('.student-video-placeholder');
    
    if (enabled) {
        // Camera enabled - show video if available, otherwise show placeholder
        if (student.image && imageElement) {
            imageElement.src = student.image;
            imageElement.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
        } else {
            // Camera enabled but no video yet - show "Camera Starting..." or keep placeholder
            if (placeholder) {
                placeholder.querySelector('.placeholder-text').textContent = 'Camera Starting...';
                placeholder.style.display = 'flex';
            }
            if (imageElement) imageElement.style.display = 'none';
        }
    } else {
        // Camera disabled - show blank/placeholder
        if (imageElement) {
            imageElement.src = '';
            imageElement.style.display = 'none';
        }
        if (placeholder) {
            placeholder.querySelector('.placeholder-text').textContent = 'Camera Off';
            placeholder.style.display = 'flex';
        }
        // Clear image data
        student.image = null;
    }
}

// Listen for emotion updates
socket.on("emotion_update", (data) => {
    const { studentId, name, emotion, engagement, confidence, timestamp, source } = data;
    
    // Normalize emotion to uppercase for display
    let normalizedEmotion = (emotion || "NEUTRAL").toUpperCase();
    
    // Map emotion variations to standard set (comprehensive)
    const emotionMap = {
        'UNKNOWN': 'NEUTRAL',
        'NO_FACE': 'NEUTRAL',  // Map no_face to neutral for display
        'NO FACE': 'NEUTRAL',
        'HAPPY': 'HAPPY',
        'SAD': 'SAD',
        'ANGRY': 'ANGRY',
        'FEAR': 'FEAR',
        'SURPRISE': 'SURPRISE',
        'DISGUST': 'DISGUST',
        'NEUTRAL': 'NEUTRAL',
        '': 'NEUTRAL'  // Empty to neutral
    };
    
    normalizedEmotion = emotionMap[normalizedEmotion] || 'NEUTRAL';  // Always default to NEUTRAL
    
    if (!studentsData.has(studentId)) {
        studentsData.set(studentId, {
            name,
            studentId,
            emotion: normalizedEmotion,
            engagement: engagement || 0,
            confidence: confidence || 0,
            timeline: [],
            avgEngagement: engagement || 0,
            samples: 0,
            totalEngagement: 0,
            image: null,
            cameraEnabled: false
        });
    }

    const student = studentsData.get(studentId);
    student.emotion = normalizedEmotion;
    student.engagement = engagement || 0;
    student.confidence = confidence || 0;
    // Don't update image from emotion_update - video stream handles display
    // Detection snapshots should not affect the displayed video
    
    // Log for debugging if emotion is unknown or low confidence
    if (normalizedEmotion === 'UNKNOWN' || (confidence && confidence < 30)) {
        console.log(`⚠️ Low confidence emotion for ${name}: ${emotion} -> ${normalizedEmotion}, confidence: ${confidence}%, source: ${source || 'unknown'}`);
    } else if (source) {
        // Log source for monitoring (optional, can be removed in production)
        console.log(`✓ Emotion detected for ${name}: ${normalizedEmotion} (${source}, ${confidence}%)`);
    }
    
    // Update timeline
    const timeStr = new Date(timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    student.timeline.push({
        time: timeStr,
        emotion: student.emotion,
        engagement: student.engagement
    });
    if (student.timeline.length > 10) student.timeline.shift();

    // Update average engagement
    student.samples++;
    student.totalEngagement += engagement;
    student.avgEngagement = Math.round(student.totalEngagement / student.samples);

    // Add to recent events
    recentEvents.unshift({
        time: timeStr,
        studentId,
        name,
        emotion: student.emotion
    });
    if (recentEvents.length > 20) recentEvents.pop();

    // Update emotion and engagement in existing card without recreating
    const cardData = studentCards.get(studentId);
    if (cardData) {
        // Update emotion tag
        if (cardData.emotionTagElement) {
            const emotionColor = getEmotionColor(normalizedEmotion);
            cardData.emotionTagElement.textContent = normalizedEmotion;
            cardData.emotionTagElement.style.background = emotionColor.bg;
            cardData.emotionTagElement.style.color = emotionColor.text;
        }
        
        // Update engagement
        if (cardData.engagementElement) {
            cardData.engagementElement.textContent = `${student.engagement}%`;
        }
        
        // Also update emotion tag in student-info section
        const infoEmotionTag = cardData.cardElement.querySelector('.student-info .emotion-tag');
        if (infoEmotionTag) {
            const emotionColor = getEmotionColor(normalizedEmotion);
            infoEmotionTag.textContent = normalizedEmotion;
            infoEmotionTag.style.background = emotionColor.bg;
            infoEmotionTag.style.color = emotionColor.text;
        }
    } else {
        // Card doesn't exist yet, recreate grid
        updateStudentGrid();
    }
    
    updateRecentEvents();
    if (selectedStudentId === studentId) {
        updateDetailsPanel(studentId);
    }
});

// Listen for raise hand events
socket.on("raise_hand", (data) => {
    const { name, studentId } = data;
    alert(`${name} raised hand!`);
    recentEvents.unshift({
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        studentId,
        name,
        event: "Raised Hand"
    });
    if (recentEvents.length > 20) recentEvents.pop();
    updateRecentEvents();
});

// Listen for doubt events
socket.on("ask_doubt", (data) => {
    const { name, studentId, doubt } = data;
    console.log(`Doubt from ${name}: ${doubt}`);
    recentEvents.unshift({
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        studentId,
        name,
        event: "Asked Doubt",
        doubt
    });
    if (recentEvents.length > 20) recentEvents.pop();
    updateRecentEvents();
});

// Listen for student joined
socket.on("student_joined", (data) => {
    const { studentId, name } = data;
    console.log("Student joined event received:", data);
    
    if (!studentsData.has(studentId)) {
        studentsData.set(studentId, {
            name,
            studentId,
            emotion: "NEUTRAL",
            engagement: 0,
            confidence: 0,
            timeline: [],
            avgEngagement: 0,
            samples: 0,
            totalEngagement: 0,
            image: null,
            cameraEnabled: false // Default to false, will be updated when camera is enabled
        });
        console.log("Added new student to dashboard:", name);
        // Only recreate grid when new student joins
        updateStudentGrid();
    } else {
        // Update name if it changed
        studentsData.get(studentId).name = name;
        // Update name in existing card if it exists
        const cardData = studentCards.get(studentId);
        if (cardData) {
            const nameElement = cardData.cardElement.querySelector('.student-name');
            if (nameElement) {
                nameElement.textContent = name;
            }
        }
    }
    
    // Add to recent events
    const timeStr = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    recentEvents.unshift({
        time: timeStr,
        studentId,
        name,
        event: "Joined Class"
    });
    if (recentEvents.length > 20) recentEvents.pop();
    updateRecentEvents();
});

// Listen for student left
socket.on("student_left", (data) => {
    const { studentId, name } = data;
    console.log("Student left event received:", data);
    
    studentsData.delete(studentId);
    studentCards.delete(studentId);
    if (selectedStudentId === studentId) {
        selectedStudentId = null;
        updateDetailsPanel(null);
    }
    updateStudentGrid();
    
    // Add to recent events
    const timeStr = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    recentEvents.unshift({
        time: timeStr,
        studentId,
        name: name || studentId,
        event: "Left Class"
    });
    if (recentEvents.length > 20) recentEvents.pop();
    updateRecentEvents();
});

// Update student grid
function updateStudentGrid() {
    const container = document.getElementById("studentsContainer");
    const filterSelect = document.getElementById("filterSelect");
    const filterValue = filterSelect.value;
    
    // Clear container and card references
    container.innerHTML = "";
    studentCards.clear();

    if (studentsData.size === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 40px;">No students joined yet</p>';
        updateFilterDropdown(0);
        return;
    }

    // Filter students based on selection
    let filteredStudents = Array.from(studentsData.entries());
    if (filterValue === "live") {
        // Show only students with recent activity (within last 30 seconds)
        const now = Date.now();
        filteredStudents = filteredStudents.filter(([id, student]) => {
            // Consider students with engagement > 0 as "live"
            return student.engagement > 0;
        });
    }

    // Update filter dropdown text
    updateFilterDropdown(filteredStudents.length);

    filteredStudents.forEach(([studentId, student]) => {
        const card = document.createElement("div");
        card.className = "student-card";
        if (selectedStudentId === studentId) {
            card.style.border = "2px solid #6366f1";
        }
        card.onclick = () => {
            selectedStudentId = studentId;
            updateStudentGrid(); // Refresh to show selection
            updateDetailsPanel(studentId);
        };

        // Generate a simple avatar based on name (for demo)
        // In production, you would use actual student photos
        const avatarColor = getAvatarColor(student.name);
        const initials = student.name.substring(0, 2).toUpperCase();

        const emotionColor = getEmotionColor(student.emotion);
        const emotionTag = student.emotion || "NEUTRAL";
        
        // Use full camera feed if available and enabled, otherwise use placeholder
        let videoHtml = '';
        const cameraEnabled = student.cameraEnabled !== false;
        
        if (student.image && cameraEnabled) {
            videoHtml = `<div class="student-video-container">
                <img src="${student.image}" alt="${student.name}" class="student-video-feed">
                <div class="video-overlay">
                    <div class="emotion-tag-overlay" style="background: ${emotionColor.bg}; color: ${emotionColor.text};">
                        ${emotionTag}
                    </div>
                </div>
                <div class="student-video-placeholder" style="display: none; background: ${avatarColor};">
                    <div class="placeholder-initials">${initials}</div>
                    <div class="placeholder-text">Camera Off</div>
                </div>
            </div>`;
        } else {
            videoHtml = `<div class="student-video-container">
                <img src="" alt="${student.name}" class="student-video-feed" style="display: none;">
                <div class="student-video-placeholder" style="background: ${avatarColor};">
                    <div class="placeholder-initials">${initials}</div>
                    <div class="placeholder-text">${cameraEnabled ? 'Camera Starting...' : 'Camera Off'}</div>
                </div>
            </div>`;
        }

        card.innerHTML = `
            ${videoHtml}
            <div class="student-info">
                <div class="student-name">${student.name}</div>
                <div class="student-stats">
                    <div class="emotion-tag" style="background: ${emotionColor.bg}; color: ${emotionColor.text};">
                        ${emotionTag}
                    </div>
                    <div class="engagement-percent">${student.engagement}%</div>
                </div>
            </div>
        `;

        container.appendChild(card);
        
        // Store card reference and image element for efficient updates
        const imageElement = card.querySelector('.student-video-feed');
        studentCards.set(studentId, {
            cardElement: card,
            imageElement: imageElement,
            emotionTagElement: card.querySelector('.emotion-tag-overlay'),
            engagementElement: card.querySelector('.engagement-percent')
        });
    });
}

// Update filter dropdown text
function updateFilterDropdown(liveCount) {
    const filterSelect = document.getElementById("filterSelect");
    const option = filterSelect.querySelector('option[value="live"]');
    if (option) {
        option.textContent = `${liveCount} Live`;
    }
}

// Update details panel
function updateDetailsPanel(studentId) {
    const panel = document.getElementById("detailsPanel");
    
    if (!studentId || !studentsData.has(studentId)) {
        panel.innerHTML = `
            <h3>Select a student</h3>
            <p>Click a student to view full analytics.</p>
        `;
        return;
    }

    const student = studentsData.get(studentId);
    // Generate a consistent student ID from the studentId (email) hash
    let hash = 0;
    for (let i = 0; i < student.studentId.length; i++) {
        hash = ((hash << 5) - hash) + student.studentId.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
    }
    const studentIdNum = Math.abs(hash).toString().substring(0, 5).padStart(5, '0');
    
    let timelineHtml = "";
    if (student.timeline.length > 0) {
        timelineHtml = student.timeline.map(item => `
            <div class="timeline-item">
                <span class="timeline-time">${item.time}</span>
                <span class="timeline-emotion">${item.emotion}</span>
                <span class="timeline-engagement">${item.engagement}%</span>
            </div>
        `).join("");
    } else {
        timelineHtml = '<p style="color: #6b7280; font-size: 14px;">No timeline data yet</p>';
    }

    panel.innerHTML = `
        <h2 style="margin-top: 0;">${student.name}</h2>
        <div class="detail-row">
            <span class="detail-label">Student ID:</span>
            <span class="detail-value">${studentIdNum}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Dominant emotion:</span>
            <span class="detail-value">${student.emotion}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Average engagement:</span>
            <span class="detail-value">${student.avgEngagement}%</span>
        </div>
        <h3 style="margin-top: 24px; margin-bottom: 12px;">Recent Timeline</h3>
        <div class="timeline-container">
            ${timelineHtml}
        </div>
    `;
}

// Update recent events
function updateRecentEvents() {
    const container = document.getElementById("eventsList");
    
    if (recentEvents.length === 0) {
        container.innerHTML = '<p style="color: #6b7280; font-size: 14px;">No recent events</p>';
        return;
    }

    container.innerHTML = recentEvents.map(event => {
        if (event.event === "Raised Hand") {
            return `<div class="event-item">${event.time} ${event.name} → Raised Hand</div>`;
        } else if (event.event === "Asked Doubt") {
            return `<div class="event-item">${event.time} ${event.name} → Asked Doubt</div>`;
        } else if (event.event === "Joined Class") {
            return `<div class="event-item">${event.time} ${event.name} → Joined</div>`;
        } else if (event.event === "Left Class") {
            return `<div class="event-item">${event.time} ${event.name} → Left</div>`;
        } else if (event.emotion) {
            return `<div class="event-item">${event.time} ${event.name} → ${event.emotion}</div>`;
        } else {
            return `<div class="event-item">${event.time} ${event.name}</div>`;
        }
    }).join("");
}

// Helper functions
function getEmotionColor(emotion) {
    const em = (emotion || "NEUTRAL").toUpperCase();
    const colors = {
        "HAPPY": { bg: "#d1fae5", text: "#065f46" },
        "SAD": { bg: "#dbeafe", text: "#1e40af" },
        "ANGRY": { bg: "#fee2e2", text: "#991b1b" },
        "NEUTRAL": { bg: "#f3f4f6", text: "#374151" },
        "FEAR": { bg: "#fef3c7", text: "#92400e" },
        "DISGUST": { bg: "#e9d5ff", text: "#6b21a8" },
        "SURPRISE": { bg: "#fce7f3", text: "#9f1239" },
        "NO_FACE": { bg: "#fee2e2", text: "#991b1b" },
        "UNKNOWN": { bg: "#f3f4f6", text: "#6b7280" }
    };
    return colors[em] || colors["NEUTRAL"];
}

function getAvatarColor(name) {
    const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

// Filter change handler
document.getElementById("filterSelect").addEventListener("change", () => {
    updateStudentGrid();
});

// Initial load
updateStudentGrid();
updateDetailsPanel(null);
updateRecentEvents();

