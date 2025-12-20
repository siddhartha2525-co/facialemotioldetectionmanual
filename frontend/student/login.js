document.getElementById("loginBtn").addEventListener("click", async () => {
    const name = document.getElementById("s_name").value.trim();
    const email = document.getElementById("s_email").value.trim();
    const password = document.getElementById("s_pwd").value.trim();

    const statusEl = document.getElementById("status");
    statusEl.textContent = "";

    if (!name || !email || !password) {
        statusEl.textContent = "Please fill all fields";
        return;
    }

    // For demo purposes, we'll use localStorage
    // In production, verify credentials via backend API
    try {
        const userData = {
            email,
            name,
            role: "student"
        };

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("student", JSON.stringify({ name, email })); // Keep for backward compatibility
        
        statusEl.textContent = "Login Successful";
        statusEl.style.color = "#10b981";

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 500);
    } catch (error) {
        statusEl.textContent = "Login failed: " + error.message;
        statusEl.style.color = "red";
    }
});