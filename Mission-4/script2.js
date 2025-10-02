document.addEventListener("DOMContentLoaded", () => {
  // Welcome
  const name = localStorage.getItem("fixitUser") || "User";
  const welcome = document.getElementById("welcomeMessage");
  if (welcome) welcome.textContent = `Welcome back, ${name}!`;

  // Report modal
  const reportBox = document.getElementById("reportBox");
  const report = safeParse(localStorage.getItem("fixitReport"));
  const modal = document.getElementById("reportModal");
  const modalBody = document.getElementById("modalBody");
  const closeBtn = document.querySelector(".close");

  if (report && reportBox && modal && modalBody) {
    reportBox.addEventListener("click", () => {
      modalBody.innerHTML = buildReportHTML(report);
      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
    });
  }

  closeBtn?.addEventListener("click", () => closeModal());
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  function closeModal() {
    modal?.classList.remove("show");
    modal?.setAttribute("aria-hidden", "true");
  }
});

function buildReportHTML(r) {
  const safe = (v, fallback = "N/A") =>
    (v && String(v).trim().length ? v : fallback);

  let html = `
    <p><strong>Issue:</strong> ${safe(r.type)}</p>
    <p><strong>Description:</strong> ${safe(r.description)}</p>
    <p><strong>Reference:</strong> ${safe(r.reference)}</p>
    <p><strong>By:</strong> ${safe(r.reporter)}</p>
    <p><strong>Date:</strong> ${safe(r.date)}</p>
  `;

  if (r.location) html += `<p><strong>Location:</strong> ${r.location}</p>`;
  if (r.photo) html += `<img src="${r.photo}" alt="Reported issue photo">`;

  return html;
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
