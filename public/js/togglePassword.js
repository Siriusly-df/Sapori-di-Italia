document.getElementById("togglePassword").addEventListener("click", function () {
    let passwordInput = document.getElementById("password");
    passwordInput.type = (passwordInput.type === "password") ? "text" : "password";
});