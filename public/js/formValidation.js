//   Author: Sydney Stalker
//   Class: CST 336 - Internet Programming
//   Date: 12/18/2025
//   Assignment: Final Project
//   File: formValidation.js

document.addEventListener("DOMContentLoaded", () => {
  function showErrors(containerId, errors) {
    if (!errors.length) return;

    const container = document.getElementById(containerId);

    if (!container) {
      alert(errors.join("\n"));
      return;
    }

    container.innerHTML = "";
    container.style.display = "block";

    errors.forEach((msg) => {
      const p = document.createElement("p");
      p.textContent = msg;
      container.appendChild(p);
    });
  }

  // LOGIN FORM VALIDATION
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      const errors = [];

      const usernameInput = loginForm.querySelector('input[name="username"]');
      const passwordInput = loginForm.querySelector('input[name="password"]');

      const username = usernameInput ? usernameInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";

      if (!username) {
        errors.push("Username is required.");
      }

      if (!password) {
        errors.push("Password is required.");
      } else if (password.length < 4) {
        errors.push("Password must be at least 4 characters long.");
      }

      if (errors.length > 0) {
        event.preventDefault();
        showErrors("loginErrors", errors);
      }
    });
  }

  // REGISTER FORM VALIDATION
  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
      const errors = [];

      const usernameInput = registerForm.querySelector('input[name="username"]');
      const emailInput = registerForm.querySelector('input[name="email"]');
      const passwordInput = registerForm.querySelector('input[name="password"]');
      const confirmInput = registerForm.querySelector('input[name="confirmPassword"]');

      const username = usernameInput ? usernameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";
      const confirmPassword = confirmInput ? confirmInput.value : "";

      if (!username) {
        errors.push("Username is required.");
      }

      if (!email) {
        errors.push("Email is required.");
      } else if (!email.includes("@")) {
        errors.push("Please enter a valid email address.");
      }

      if (!password) {
        errors.push("Password is required.");
      } else if (password.length < 6) {
        errors.push("Password must be at least 6 characters long.");
      }

      if (confirmPassword !== password) {
        errors.push("Password and Confirm Password must match.");
      }

      if (errors.length > 0) {
        event.preventDefault();
        showErrors("registerErrors", errors);
      }
    });
  }
});
