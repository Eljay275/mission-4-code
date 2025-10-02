// Show modal via ?showSignup=1
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search); // check the URL when the page loads
  const modal = document.getElementById("signupModal"); // grab the signup modal element
  // if the url has ?showSignup=1, then open the modal
  if (params.get("showSignup") === "1") {
    modal.style.display = "flex"; 
    // clean up the url so it doesn’t keep re-opening the modal on refresh
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});

// Close modal
document.addEventListener("click", (e) => {
  const modal = document.getElementById("signupModal");
  if (!modal) return;
  // this makes it so if u press the x or out of the modal it'll close
  if (e.target.matches(".close") || e.target === modal) {
    modal.style.display = "none";
    document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
    document.getElementById("view-default")?.classList.remove("hidden");
  }
});

// Switching between default, signup, and login screens
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("signupModal");
  if (!modal) return;
  const defaultView = modal.querySelector("#view-default");
  const signupView = modal.querySelector("#view-signup");
  const loginView = modal.querySelector("#view-login");

  const showView = (name) => {
    [defaultView, signupView, loginView].forEach(v => v.classList.add("hidden"));
    // shows the right screen depending on which one you click
    if (name === "signup") signupView.classList.remove("hidden");
    else if (name === "login") loginView.classList.remove("hidden");
    else defaultView.classList.remove("hidden");
    modal.style.display = "flex";
  };

  document.querySelectorAll(".open-signup").forEach(btn => btn.addEventListener("click", () => showView("signup"))); // when someone hits “Sign up”, show the signup form
  document.querySelectorAll(".open-login").forEach(btn => btn.addEventListener("click", () => showView("login"))); // when someone hits “Log in”, show the login form
  modal.querySelectorAll(".back-default").forEach(btn => btn.addEventListener("click", () => showView("default"))); // back button if ur too lazy to log in or sign up
});

// Inline validation + save display name
(function () {
  const setupValidation = (form) => {
    if (!form) return;
    form.setAttribute("novalidate", "novalidate");

    // shows an error message under a field 
    const showError = (input, message) => {
      input.classList.remove("success");
      input.classList.add("error");
      input.setAttribute("aria-invalid", "true");
      if (input.nextElementSibling?.classList.contains("error-message")) input.nextElementSibling.remove(); // clear any existing error message next to this input
      const msg = document.createElement("div");
      msg.className = "error-message";
      msg.textContent = message;
      input.insertAdjacentElement("afterend", msg); // place error directly under the field
    };

    // remove error/success state and any inline message
    const clearError = (input) => {
      input.classList.remove("error", "success");
      input.removeAttribute("aria-invalid");
      if (input.nextElementSibling?.classList.contains("error-message")) input.nextElementSibling.remove();
    };

     // mark a field as valid
    const markSuccess = (input) => { clearError(input); input.classList.add("success"); };
    // basic format checks
    const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const passwordMin = (input) => parseInt(input.getAttribute("minlength"), 10) || 6;

    form.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        const value = input.value.trim();
        // empty value = neutral state
        if (!value) { clearError(input); return; }
        if (input.type === "email") {
          isValidEmail(value) ? markSuccess(input) : showError(input, "Please enter a valid email");
          return;
        }
        if (input.type === "password") {
          const min = passwordMin(input);
          if (value.length >= min) markSuccess(input);
          else clearError(input); // no error message for passwords
          return;
        }
        markSuccess(input);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll(".error-message").forEach((el) => el.remove());
      form.querySelectorAll("input").forEach((el) => el.classList.remove("error", "success"));

      form.querySelectorAll("input[required]").forEach((input) => {
        const value = input.value.trim();
        if (!value) { showError(input, `Please enter your ${(input.placeholder || input.name).toLowerCase()}`); valid = false; return; }
        if (input.type === "email" && !isValidEmail(value)) { showError(input, "Please enter a valid email"); valid = false; return; }
        if (input.type === "password") {
          const min = passwordMin(input);
          if (value.length < min) { clearError(input); valid = false; return; } // block submit, no message
        }
        markSuccess(input);
      });

      if (valid) {
        let displayName = "";
        const nameInput = form.querySelector('input[name="username"]');
        if (nameInput?.value.trim()) displayName = nameInput.value.trim();
        else {
          const emailInput = form.querySelector('input[name="email"]');
          if (emailInput?.value.includes("@")) displayName = emailInput.value.split("@")[0];
        }
        if (displayName) localStorage.setItem("fixitUser", displayName);
        window.location.assign("index2.html");
      }
    });
  };

  setupValidation(document.getElementById("signupForm"));
  setupValidation(document.getElementById("loginForm"));
})();