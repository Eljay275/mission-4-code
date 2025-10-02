(function () {
  const onReady = (fn) => document.readyState !== "loading" ? fn() : document.addEventListener("DOMContentLoaded", fn);
  onReady(() => {
    if (window.LOCATION_PAGE_INDEX === undefined && window.LOCATION_PAaGE_INDEX !== undefined) {
      window.LOCATION_PAGE_INDEX = window.LOCATION_PAaGE_INDEX;
    }

    const q = (s) => document.querySelector(s);
    const val = (s) => (q(s)?.value || "").trim();
    const getPreview = () => {
      const img = document.getElementById("preview");
      return img && img.style.display !== "none" ? img.src : "";
    };
    const genRef = () =>
      typeof window.generateReference === "function"
        ? window.generateReference()
        : Array.from({ length: 8 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.floor(Math.random() * 36))).join("");

    const saveReport = ({ reference, shared }) => {
      const report = {
        type: window.selectedIssue || "Unspecified",
        description: val("#issue-description"),
        location: val("#address-input"),
        photo: getPreview(),
        reference,
        reporter: shared ? (val("#name") || localStorage.getItem("fixitUser") || "Anonymous") : "Anonymous",
        email: shared ? val("#email") : "",
        shared: !!shared,
        date: new Date().toLocaleString()
      };
      localStorage.setItem("fixitReport", JSON.stringify(report));
    };

    const origAnon = window.reportAnonymous;
    window.reportAnonymous = function () {
      const reference = genRef();
      saveReport({ reference, shared: false });
      return origAnon?.apply(this, arguments);
    };

    const origSubmit = window.submitReport;
    window.submitReport = function () {
      const out = origSubmit?.apply(this, arguments);
      let reference = q("#reference-number")?.textContent?.trim();
      if (!reference) reference = genRef();
      saveReport({ reference, shared: true });
      return out;
    };
  });
})();