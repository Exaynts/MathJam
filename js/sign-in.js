function showLoginForm() {
  document.getElementById("login-form").classList.remove("hidden");
  document.getElementById("forgot-login-form").classList.add("hidden");
  document.getElementById("forgot-password-form").classList.add("hidden");
}

function showForgotLogin() {
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("forgot-login-form").classList.remove("hidden");
  document.getElementById("forgot-password-form").classList.add("hidden");
}

function showForgotPassword() {
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("forgot-login-form").classList.add("hidden");
  document.getElementById("forgot-password-form").classList.remove("hidden");
}

// Show the Sign-in form on load
document.addEventListener("DOMContentLoaded", function () {
  showLoginForm();
});
