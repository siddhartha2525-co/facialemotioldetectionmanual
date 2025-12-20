document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;

    const statusEl = document.getElementById("status");
    statusEl.textContent = "";
    statusEl.classList.remove("success-msg");

    if (!email || !password || !role) {
        statusEl.textContent = "Please fill all fields";
        return;
    }

    // Simulate API call - in production, this would call your backend
    try {
        // For demo purposes, we'll use localStorage
        // In production, verify credentials via backend API

        const userData = {
            email,
            name: email.split('@')[0], // Extract name from email for demo
            role
        };

        localStorage.setItem("user", JSON.stringify(userData));
        statusEl.textContent = "Login Successful";
        statusEl.classList.add("success-msg");

        // Redirect based on role
        setTimeout(() => {
            if (role === "student") {
                window.location.href = "student/dashboard.html";
            } else if (role === "teacher") {
                window.location.href = "student/teacher/dashboard.html";
            }
        }, 500);

    } catch (error) {
        statusEl.textContent = "Login failed: " + error.message;
    }
});
