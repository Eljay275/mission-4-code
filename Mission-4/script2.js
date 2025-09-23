document.addEventListener("DOMContentLoaded", () => {
  // Welcome message
  const name = localStorage.getItem("fixitUser") || "User";
  const welcome = document.getElementById("welcomeMessage");
  if (welcome) welcome.textContent = `Welcome back, ${name}!`;

  // Report box + saved report
  const reportBox = document.getElementById("reportBox");
  const report = safeParse(localStorage.getItem("fixitReport"));

  if (report && reportBox) {
    // ✅ Updated text
    reportBox.textContent = `Your recent post`;

    // Modal bits
    const modal     = document.getElementById("reportModal");
    const modalBody = document.getElementById("modalBody");
    const closeBtn  = document.querySelector(".close");

    const openModal = () => {
      modalBody.innerHTML = buildReportHTML(report);
      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
    };
    const closeModal = () => {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
    };

    reportBox.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    // Close when clicking outside modal content
    modal.addEventListener("click", (e) => { 
      if (e.target === modal) closeModal(); 
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => { 
      if (e.key === "Escape") closeModal(); 
    });
  }
});

// Build the HTML that goes inside the modal
function buildReportHTML(r) {
  const safe = (v, fallback="N/A") => (v && String(v).trim().length ? v : fallback);

  let html = `
    <p><strong>Issue:</strong> ${safe(r.type)}</p>
    <p><strong>Description:</strong> ${safe(r.description)}</p>
    <p><strong>Reference:</strong> ${safe(r.reference)}</p>
    <p><strong>By:</strong> ${safe(r.reporter)}</p>
    <p><strong>Date:</strong> ${safe(r.date)}</p>
  `;

  if (r.location) {
    html += `<p><strong>Location:</strong> ${r.location}</p>`;
  }
  if (r.photo) {
    html += `<img class="report-photo" src="${r.photo}" alt="Reported issue photo">`;
  }
  return html;
}

// Safe JSON.parse
function safeParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}
