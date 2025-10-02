// Show modal via ?showSignup=1
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const modal = document.getElementById("signupModal");

  if (params.get("showSignup") === "1") {
    modal.style.display = "flex";
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});

// Close modal
document.addEventListener("click", (e) => {
  const modal = document.getElementById("signupModal");
  if (!modal) return;

  if (e.target.matches(".close") || e.target === modal) {
    modal.style.display = "none";
    document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
    document.getElementById("view-default")?.classList.remove("hidden");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("signupModal");
  if (!modal) return;

  const defaultView = modal.querySelector("#view-default");
  const signupView = modal.querySelector("#view-signup");
  const loginView = modal.querySelector("#view-login");

  const showView = (name) => {
    [defaultView, signupView, loginView].forEach(v => v.classList.add("hidden"));

    if (name === "signup") {
      signupView.classList.remove("hidden");
    } else if (name === "login") {
      loginView.classList.remove("hidden");
    } else {
      defaultView.classList.remove("hidden");
    }

    modal.style.display = "flex";
  };

  document.querySelectorAll(".open-signup").forEach(btn =>
    btn.addEventListener("click", () => showView("signup"))
  );

  document.querySelectorAll(".open-login").forEach(btn =>
    btn.addEventListener("click", () => showView("login"))
  );

  modal.querySelectorAll(".back-default").forEach(btn =>
    btn.addEventListener("click", () => showView("default"))
  );
});

// Inline validation + save display name
(function () {
  const setupValidation = (form) => {
    if (!form) return;
    form.setAttribute("novalidate", "novalidate");

    const showError = (input, message) => {
      input.classList.remove("success");
      input.classList.add("error");
      input.setAttribute("aria-invalid", "true");
      if (input.nextElementSibling?.classList.contains("error-message")) {
        input.nextElementSibling.remove();
      }
      const msg = document.createElement("div");
      msg.className = "error-message";
      msg.textContent = message;
      input.insertAdjacentElement("afterend", msg);
    };

    const clearError = (input) => {
      input.classList.remove("error", "success");
      input.removeAttribute("aria-invalid");
      if (input.nextElementSibling?.classList.contains("error-message")) {
        input.nextElementSibling.remove();
      }
    };

    const markSuccess = (input) => {
      clearError(input);
      input.classList.add("success");
    };

    form.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        if (!input.value.trim()) {
          clearError(input);
          return;
        }
        if (input.type === "email") {
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())
            ? markSuccess(input)
            : showError(input, "Please enter a valid email");
        } else if (input.type === "password" && input.hasAttribute("minlength")) {
          input.value.trim().length >= parseInt(input.getAttribute("minlength"))
            ? markSuccess(input)
            : showError(input, "Password must be at least 6 characters");
        } else {
          markSuccess(input);
        }
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll(".error-message").forEach(el => el.remove());
      form.querySelectorAll("input").forEach(el => el.classList.remove("error", "success"));

      form.querySelectorAll("input[required]").forEach((input) => {
        const value = input.value.trim();
        if (!value) {
          showError(input, `Please enter your ${(input.placeholder || input.name).toLowerCase()}`);
          valid = false;
          return;
        }
        if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          showError(input, "Please enter a valid email");
          valid = false;
          return;
        }
        if (input.type === "password" && input.hasAttribute("minlength") &&
            value.length < parseInt(input.getAttribute("minlength"))) {
          showError(input, "Password must be at least 6 characters");
          valid = false;
          return;
        }
        markSuccess(input);
      });

      if (valid) {
        let displayName = "";
        const nameInput = form.querySelector('input[name="username"]');
        if (nameInput?.value.trim()) {
          displayName = nameInput.value.trim();
        } else {
          const emailInput = form.querySelector('input[name="email"]');
          if (emailInput?.value.includes("@")) {
            displayName = emailInput.value.split("@")[0];
          }
        }
        if (displayName) {
          localStorage.setItem("fixitUser", displayName);
        }
        window.location.assign("index2.html");
      }
    });
  };

  setupValidation(document.getElementById("signupForm"));
  setupValidation(document.getElementById("loginForm"));
})();
