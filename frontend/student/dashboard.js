// Auto-detect backend URL based on current host (works for localhost, IP, and cloud deployment)
// Supports both HTTP and HTTPS, and handles Railway deployment where services are separate
const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
const hostname = window.location.hostname;
const port = window.location.port;

// For Railway: services are separate, so we need to construct backend URL
// Option 1: Use environment variable if set (Railway can inject this)
// Option 2: Try to infer from current hostname
// Option 3: Use service name for Railway internal discovery (if same project)
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

let stream = null;
let interval = null;
let videoStreamInterval = null;
let detectionEnabled = false;
let cameraEnabled = false;

// load student info - support both unified and old format
let student = JSON.parse(localStorage.getItem("student") || "{}");
const user = JSON.parse(localStorage.getItem("user") || "{}");

// If using unified login, convert to student format
if (!student.name && user.email && user.role === "student") {
    student = { name: user.name || user.email.split('@')[0], email: user.email };
    localStorage.setItem("student", JSON.stringify(student));
}

if (!student.name) window.location.href = "login.html";

document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("student");
    window.location.href = "login.html";
};

/* ---------- Camera ---------- */

// Check if camera access is available
function isCameraAvailable() {
    try {
        return !!(typeof navigator !== 'undefined' && 
                  navigator.mediaDevices && 
                  typeof navigator.mediaDevices.getUserMedia === 'function');
    } catch (e) {
        return false;
    }
}

async function enableCamera() {
    const statusEl = document.getElementById("statusText");
    
    // Check if camera API is available - must check navigator.mediaDevices exists first
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
        const errorMsg = "Camera access not available. Mobile browsers require HTTPS for camera access.";
        if (statusEl) {
            statusEl.innerText = "❌ " + errorMsg;
            statusEl.style.color = "red";
        }
        alert(errorMsg + "\n\nYou can still join the class without video by unchecking 'Join with video'.");
        cameraEnabled = false;
        return;
    }
    
    // Check if getUserMedia method exists
    if (typeof navigator.mediaDevices.getUserMedia !== 'function') {
        const errorMsg = "Camera API not supported in this browser. Please use a modern browser or join without video.";
        if (statusEl) {
            statusEl.innerText = "❌ " + errorMsg;
            statusEl.style.color = "red";
        }
        alert(errorMsg);
        cameraEnabled = false;
        return;
    }
    
    try {
        // Double-check mediaDevices is available (safety check)
        if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
            throw new Error("Camera API not available. Mobile browsers require HTTPS for camera access.");
        }
        
        // Request camera with better constraints for mobile
        const constraints = {
            video: {
                facingMode: 'user', // Front camera on mobile
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        };
        
        // Try to get user media
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        const videoElement = document.getElementById("localVideo");
        if (videoElement) {
            videoElement.srcObject = stream;
            await videoElement.play().catch(e => {
                console.warn("Video play error:", e);
                // Try again after a short delay
                setTimeout(() => videoElement.play().catch(console.warn), 100);
            });
        }
        cameraEnabled = true;
        
        // Notify teacher that camera is enabled (if socket is connected)
        const classId = document.getElementById("classId").value;
        if (socket && socket.connected && classId) {
            socket.emit("camera_state", {
                studentId: student.email,
                name: student.name,
                classId: classId,
                enabled: true
            });
        }
        
        // Start video stream if socket is connected
        if (socket && socket.connected) {
            if (videoStreamInterval) clearInterval(videoStreamInterval);
            videoStreamInterval = setInterval(sendVideoStream, 150);
        }
        
        if (statusEl) {
            statusEl.innerText = "Camera enabled ✓";
            statusEl.style.color = "#10b981";
        }
        
        console.log("✅ Camera enabled successfully");
    } catch (err) {
        console.error("Camera error:", err);
        cameraEnabled = false;
        
        let errorMsg = "";
        
        // Check for the specific error the user is seeing
        if (err.message && err.message.includes("undefined is not an object")) {
            errorMsg = "Camera API not available. Mobile browsers require HTTPS for camera access.\n\nYou can still join the class without video.";
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            errorMsg = "Camera permission denied. Please allow camera access in your browser settings.";
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            errorMsg = "No camera found on this device.";
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            errorMsg = "Camera is already in use by another application.";
        } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
            errorMsg = "Camera constraints not supported. Trying with basic settings...";
            // Try again with basic constraints only if mediaDevices is available
            if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    const videoElement = document.getElementById("localVideo");
                    if (videoElement) {
                        videoElement.srcObject = stream;
                        videoElement.play().catch(e => console.warn("Video play error:", e));
                    }
                    cameraEnabled = true;
                    if (statusEl) {
                        statusEl.innerText = "Camera enabled ✓";
                        statusEl.style.color = "#10b981";
                    }
                    return;
                } catch (retryErr) {
                    errorMsg = "Camera error: " + (retryErr.message || retryErr.name);
                }
            } else {
                errorMsg = "Camera API not available. Mobile browsers require HTTPS.";
            }
        } else if (err.message) {
            errorMsg = err.message;
        } else {
            errorMsg = "Camera error: " + (err.name || "Unknown error");
        }
        
        if (statusEl) {
            statusEl.innerText = "⚠️ " + errorMsg.split('\n')[0]; // Show first line only
            statusEl.style.color = "#f59e0b";
        }
        
        // Show alert with full message
        if (errorMsg) {
            alert(errorMsg);
        }
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
    }
    cameraEnabled = false;
    
    // Stop video stream
    if (videoStreamInterval) {
        clearInterval(videoStreamInterval);
        videoStreamInterval = null;
    }
    
    // Notify teacher that camera is disabled
    const classId = document.getElementById("classId").value;
    if (socket.connected && classId) {
        socket.emit("camera_state", {
            studentId: student.email,
            name: student.name,
            classId: classId,
            enabled: false
        });
    }
}

document.getElementById("startCam").onclick = enableCamera;
document.getElementById("stopCam").onclick = stopCamera;

/* ---------- Join Class ---------- */

document.getElementById("joinClassBtn").onclick = async () => {

    const classId = document.getElementById("classId").value.trim();
    const withVideo = document.getElementById("withVideo").checked;
    const statusEl = document.getElementById("statusText");

    if (!classId) {
        statusEl.innerText = "Please enter a Class ID";
        statusEl.style.color = "red";
        return;
    }

    // First, check if class exists
    statusEl.innerText = "Checking Class ID...";
    statusEl.style.color = "#6b7280";
    
    try {
        const baseUrl = WS_URL.replace('ws://', 'http://').replace('wss://', 'https://');
        const checkResp = await fetch(`${baseUrl}/api/class/${classId}/check`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // Add timeout for mobile networks
            signal: AbortSignal.timeout(10000)
        });
        const checkData = await checkResp.json();
        
        if (!checkData.exists) {
            statusEl.innerText = "❌ No class exists with this Class ID. Please check the Class ID and try again.";
            statusEl.style.color = "red";
            return;
        }
    } catch (err) {
        console.error("Error checking class:", err);
        if (err.name === 'AbortError' || err.name === 'TimeoutError') {
            statusEl.innerText = "⚠️ Connection timeout. Trying to join anyway...";
            statusEl.style.color = "#f59e0b";
        } else {
            // Continue anyway - let the socket handle the validation
            console.warn("Class check failed, continuing with socket join");
        }
    }

    if (withVideo && !stream) {
        // Check if camera is available before trying to enable
        if (!isCameraAvailable()) {
            statusEl.innerText = "⚠️ Camera not available. Joining without video...";
            statusEl.style.color = "#f59e0b";
            // Continue without video - don't block joining
        } else {
            try {
                await enableCamera();
                // If camera fails, allow joining without video
                if (!cameraEnabled) {
                    statusEl.innerText = "⚠️ Camera unavailable. Joining without video...";
                    statusEl.style.color = "#f59e0b";
                }
            } catch (err) {
                console.error("Camera enable error:", err);
                // Don't block joining - allow joining without video
                statusEl.innerText = "⚠️ Camera unavailable. Joining without video...";
                statusEl.style.color = "#f59e0b";
            }
        }
    }

    statusEl.innerText = "Connecting...";
    statusEl.style.color = "#6b7280";

    // Connect socket if not connected
    if (!socket.connected) {
        try {
            socket.connect();
            
            // Wait for connection with longer timeout for mobile networks
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    statusEl.innerText = "❌ Connection timeout. Please check your network and try again.";
                    statusEl.style.color = "red";
                    reject(new Error("Connection timeout"));
                }, 15000); // 15 seconds for mobile networks
                
                socket.once("connect", () => {
                    clearTimeout(timeout);
                    console.log("✅ Socket connected successfully");
                    resolve();
                });
                
                socket.once("connect_error", (err) => {
                    clearTimeout(timeout);
                    console.error("❌ Connection error during join:", err);
                    console.error("❌ Backend URL:", BACKEND_URL);
                    console.error("❌ WebSocket URL:", WS_URL);
                    statusEl.innerText = `❌ Failed to connect to backend.\n\nBackend: ${BACKEND_URL}\n\nPlease check:\n1. Backend service is running in Railway\n2. Network connection is active\n3. Backend URL is correct`;
                    statusEl.style.color = "red";
                    reject(err);
                });
            });
        } catch (err) {
            console.error("❌ Error connecting socket:", err);
            statusEl.innerText = `❌ Connection failed: ${err.message || "Unknown error"}`;
            statusEl.style.color = "red";
            return; // Stop here if connection fails
        }
    }

    // Verify socket is connected before joining
    if (!socket.connected) {
        statusEl.innerText = "❌ Not connected to server. Please try again.";
        statusEl.style.color = "red";
        return;
    }
    
    statusEl.innerText = "Joining class...";
    statusEl.style.color = "#6b7280";
    
    try {
        socket.emit("join_class", {
            studentId: student.email,
            name: student.name,
            classId
        });
        console.log("✅ Join class request sent");
    } catch (err) {
        console.error("❌ Error sending join request:", err);
        statusEl.innerText = "❌ Failed to join class: " + (err.message || "Unknown error");
        statusEl.style.color = "red";
    }
};

/* ---------- Snapshot sending ---------- */

// Send video stream for display (smooth video)
function sendVideoStream() {
    if (!stream || !cameraEnabled) return;

    const canvas = document.createElement("canvas");
    const video = document.getElementById("localVideo");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Lower quality for smooth video streaming
    const image = canvas.toDataURL("image/jpeg", 0.6);

    const classId = document.getElementById("classId").value;

    socket.emit("video_stream", {
        image,
        studentId: student.email,
        name: student.name,
        classId
    });
}

// Send snapshot for detection (backend only, not for display)
function sendSnapshot() {
    if (!stream || !detectionEnabled) return;

    const canvas = document.createElement("canvas");
    const video = document.getElementById("localVideo");
    // Optimized resolution for speed and accuracy balance (400x300)
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Optimized quality for faster transmission (0.7 is good balance)
    const image = canvas.toDataURL("image/jpeg", 0.7);

    const classId = document.getElementById("classId").value;

    socket.emit("snapshot", {
        image,
        studentId: student.email,
        name: student.name,
        classId
    });
}

socket.on("join_ack", (data) => {
    const statusEl = document.getElementById("statusText");
    
    if (data.status === "ok") {
        statusEl.innerText = "Joined ✓ - Waiting for teacher to start detection...";
        statusEl.style.color = "#10b981";
        
        // Send initial camera state
        const classId = document.getElementById("classId").value;
        socket.emit("camera_state", {
            studentId: student.email,
            name: student.name,
            classId: classId,
            enabled: cameraEnabled && stream !== null
        });
        
        // Start sending video stream immediately if camera is enabled
        if (stream && cameraEnabled) {
            if (videoStreamInterval) clearInterval(videoStreamInterval);
            videoStreamInterval = setInterval(sendVideoStream, 150);
        }
        
        // Don't start sending detection snapshots - wait for teacher to start detection
    } else {
        // Handle specific error cases
        if (data.reason === "class_not_found") {
            statusEl.innerText = "❌ " + (data.message || "No class exists with this Class ID. Please check the Class ID and try again.");
        } else {
            statusEl.innerText = "❌ Join failed: " + (data.reason || data.message || "Unknown error");
        }
        statusEl.style.color = "red";
    }
});

// Listen for detection start/stop from teacher
socket.on("detection_started", (data) => {
    detectionEnabled = true;
    const statusEl = document.getElementById("statusText");
    statusEl.innerText = "Joined ✓ - Detection Active";
    statusEl.style.color = "#10b981";
    
        // Start sending video stream for smooth display (every 150ms)
        if (stream && cameraEnabled) {
            if (videoStreamInterval) clearInterval(videoStreamInterval);
            videoStreamInterval = setInterval(sendVideoStream, 150);
            
        // Start sending detection snapshots (every 1.2 seconds for better performance)
        if (interval) clearInterval(interval);
        interval = setInterval(sendSnapshot, 1200);  // Slightly slower for better processing
        }
});

socket.on("detection_stopped", (data) => {
    detectionEnabled = false;
    const statusEl = document.getElementById("statusText");
    statusEl.innerText = "Joined ✓ - Detection Paused";
    statusEl.style.color = "#f59e0b";
    
    // Stop sending detection snapshots
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
    
    // Keep video stream running for display even when detection is paused
    // Video stream continues for smooth display
});

// Listen for teacher video stream
socket.on("teacher_video", (data) => {
    const { image } = data;
    const teacherVideo = document.getElementById("teacherVideo");
    const placeholder = document.getElementById("teacherVideoPlaceholder");
    
    if (image && teacherVideo) {
        // Directly use the image as source for smoother updates
        teacherVideo.src = image;
        if (placeholder) placeholder.classList.add("hidden");
    }
});

socket.on("teacher_video_stopped", () => {
    const teacherVideo = document.getElementById("teacherVideo");
    const placeholder = document.getElementById("teacherVideoPlaceholder");
    
    if (teacherVideo) {
        teacherVideo.src = "";
    }
    if (placeholder) placeholder.classList.remove("hidden");
});

// Handle connection errors
socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error);
    console.error("❌ Attempted to connect to:", WS_URL);
    console.error("❌ Backend URL:", BACKEND_URL);
    const statusEl = document.getElementById("statusText");
    if (statusEl) {
        statusEl.innerText = `❌ Connection failed. Backend: ${BACKEND_URL}\n\nPlease check:\n1. Backend service is running\n2. Network connection is active`;
        statusEl.style.color = "red";
    }
});

socket.on("connect", () => {
    console.log("Socket connected successfully");
    const statusEl = document.getElementById("statusText");
    if (statusEl && statusEl.innerText.includes("Connecting")) {
        statusEl.innerText = "Connected ✓";
        statusEl.style.color = "#10b981";
    }
});

socket.on("disconnect", () => {
    const statusEl = document.getElementById("statusText");
    statusEl.innerText = "Disconnected";
    statusEl.style.color = "red";
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
});

/* ---------- Raise Hand ---------- */

let raised = false;

document.getElementById("raiseHandBtn").onclick = () => {
    const classId = document.getElementById("classId").value;

    raised = !raised;

    document.getElementById("raiseHandBtn").innerText =
        raised ? "✋ Hand Raised" : "✋ Raise Hand";

    document.getElementById("raiseHandBtn").classList.toggle("active");

    socket.emit(raised ? "raise_hand" : "lower_hand", {
        studentId: student.email,
        name: student.name,
        classId
    });
};

/* ---------- Ask Doubt ---------- */

document.getElementById("askDoubtBtn").onclick = () =>
    document.getElementById("doubtPopup").classList.remove("hidden");

document.getElementById("closePopup").onclick = () =>
    document.getElementById("doubtPopup").classList.add("hidden");

document.getElementById("sendDoubtBtn").onclick = () => {
    const text = document.getElementById("doubtText").value.trim();
    if (!text) return alert("Type your doubt");

    const classId = document.getElementById("classId").value;

    socket.emit("ask_doubt", {
        studentId: student.email,
        name: student.name,
        doubt: text,
        classId
    });

    document.getElementById("doubtPopup").classList.add("hidden");
};

/* ---------- Notes Saving ---------- */

document.getElementById("notesArea").value =
    localStorage.getItem("notes_" + student.email) || "";

document.getElementById("notesArea").oninput = () => {
    localStorage.setItem(
        "notes_" + student.email,
        document.getElementById("notesArea").value
    );
};

document.getElementById("downloadNotesBtn").onclick = () => {
    const text = document.getElementById("notesArea").value;
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "My_Class_Notes.txt";
    a.click();
};