// --- Existing modal + open/close logic ---
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const modal = document.getElementById("signupModal");

  if (params.get("showSignup") === "1") {
    modal.style.display = "flex";
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});

// Close button
document.querySelector(".close").addEventListener("click", () => {
  document.getElementById("signupModal").style.display = "none";
});

// Optional: close if click outside modal
window.onclick = function(event) {
  const modal = document.getElementById("signupModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('signupModal');
  if (!modal) return; // safety

  const closeBtn    = modal.querySelector('.close');
  const defaultView = modal.querySelector('#view-default');
  const signupView  = modal.querySelector('#view-signup');
  const loginView   = modal.querySelector('#view-login');

  const showView = (name) => {
    [defaultView, signupView, loginView].forEach(v => v.classList.add('hidden'));
    if (name === 'signup')      signupView.classList.remove('hidden');
    else if (name === 'login')  loginView.classList.remove('hidden');
    else                        defaultView.classList.remove('hidden');
  };

  const params = new URLSearchParams(location.search);
  if (params.get('showSignup') === '1') {
    modal.style.display = 'flex';
    showView('default');
    history.replaceState({}, document.title, location.pathname);
  }

  const openSignupBtn = modal.querySelector('.open-signup');
  const openLoginBtn  = modal.querySelector('.open-login');
  if (openSignupBtn) openSignupBtn.addEventListener('click', () => showView('signup'));
  if (openLoginBtn)  openLoginBtn.addEventListener('click',  () => showView('login'));

  modal.querySelectorAll('.back-default').forEach(btn => {
    btn.addEventListener('click', () => showView('default'));
  });

  if (closeBtn) closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    showView('default');
  });
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      showView('default');
    }
  });
});


// ----- Custom inline validation for signup & login -----
(function () {
  const setupValidation = (form) => {
    if (!form) return;

    form.setAttribute('novalidate', 'novalidate');

    const showError = (input, message) => {
      input.classList.remove('success');
      input.classList.add('error');
      input.setAttribute('aria-invalid', 'true');

      if (input.nextElementSibling && input.nextElementSibling.classList.contains('error-message')) {
        input.nextElementSibling.remove();
      }

      const msg = document.createElement('div');
      msg.className = 'error-message';
      msg.textContent = message;
      input.insertAdjacentElement('afterend', msg);
    };

    const clearError = (input) => {
      input.classList.remove('error', 'success');
      input.removeAttribute('aria-invalid');
      if (input.nextElementSibling && input.nextElementSibling.classList.contains('error-message')) {
        input.nextElementSibling.remove();
      }
    };

    const markSuccess = (input) => {
      clearError(input);
      input.classList.add('success');
    };

    // Live feedback
    form.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', () => {
        if (input.value.trim().length > 0) {
          if (input.type === 'email') {
            const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
            if (ok) markSuccess(input);
            else showError(input, 'Please enter a valid email');
          } else if (input.type === 'password' && input.hasAttribute('minlength')) {
            if (input.value.trim().length >= parseInt(input.getAttribute('minlength'))) {
              markSuccess(input);
            } else {
              showError(input, 'Password must be at least 6 characters');
            }
          } else {
            markSuccess(input);
          }
        } else {
          clearError(input);
        }
      });
    });

    // On submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      form.querySelectorAll('.error-message').forEach(el => el.remove());
      form.querySelectorAll('input').forEach(el => el.classList.remove('error', 'success'));

      form.querySelectorAll('input[required]').forEach((input) => {
        const value = input.value.trim();
        const label = (input.placeholder || input.name || 'this field').toLowerCase();

        if (!value) {
          showError(input, `Please enter your ${label}`);
          valid = false;
        } else if (input.type === 'email') {
          const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          if (!ok) {
            showError(input, 'Please enter a valid email');
            valid = false;
          } else {
            markSuccess(input);
          }
        } else if (input.type === 'password' && input.hasAttribute('minlength')) {
          if (value.length < parseInt(input.getAttribute('minlength'))) {
            showError(input, 'Password must be at least 6 characters');
            valid = false;
          } else {
            markSuccess(input);
          }
        } else {
          markSuccess(input);
        }
      });

      if (valid) {
        // Try to save a display name for the dashboard
        let displayName = "";

        // If it's the signup form, prefer the username field
        const nameInput = form.querySelector('input[name="username"]');
        if (nameInput && nameInput.value.trim()) {
          displayName = nameInput.value.trim();
        } else {
          // Otherwise infer a name from the email in the login form
          const emailInput = form.querySelector('input[name="email"]');
          if (emailInput && emailInput.value.includes("@")) {
            displayName = emailInput.value.split("@")[0];
          }
        }

        if (displayName) {
          localStorage.setItem("fixitUser", displayName);
        }

        // IMPORTANT: change this if your logged-in page has a different name
        window.location.assign("index2.html");
      }
    });
  };

  setupValidation(document.getElementById('signupForm'));
  setupValidation(document.getElementById('loginForm'));
})();
