// ---------- VARIABLES ----------
let currentPage = 0; // Current page index
const pages = document.querySelectorAll('.page'); // select all sections/pages

let sharedReport = false; // flag to track user shares contact details
let selectedIssue = ''; // selected issue type

// Map related
let map = null; // leaflet map object
let marker = null; // marker object on the map
let mapInitialized = false; // tracks if the map has been initialized
const LOCATION_PAGE_INDEX = 3; // page-order: 0=home,1=issue-type,2=details,3=location,4=contact,5=confirmation

// ----------PAGE NAVIGATION FUNCTIONS ----------
function showPage(index) { //function to show a specific page by index
  pages.forEach((page, i) => {
    if (i === index) page.classList.add('active');
    else page.classList.remove('active');
  });

  // Initialize or refresh map when location page is shown
  if (index === LOCATION_PAGE_INDEX) {
    if (!mapInitialized) {
      setTimeout(() => {
        initMap();
        mapInitialized = true;
      }, 60);
    } else {
      setTimeout(() => {
        if (map && typeof map.invalidateSize === 'function') {
          map.invalidateSize();
        }
      }, 100);
    }
  }
}

function nextPage() {
  if (currentPage < pages.length - 1) {
    currentPage++;
    showPage(currentPage);
  }
}

function prevPage() {
  if (currentPage > 0) {
    currentPage--;
    showPage(currentPage);
  }
}

// Initialize page display
showPage(currentPage);

// ---------- SELECT ISSUE TYPE PAGE ----------
function selectIssue(issue) {
  selectedIssue = issue;
  nextPage();
}

// ---------- ADD LOCATION PAGE ----------
function initMap() {
  if (typeof L === 'undefined') {
    console.error('Leaflet library not loaded. Make sure <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script> is included.');
    return;
  }

  if (map) {
    map.invalidateSize();
    return;
  }

  map = L.map('map').setView([-41.2865, 174.7762], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  marker = L.marker([-41.2865, 174.7762]).addTo(map)
    .bindPopup('Default Location')
    .openPopup();

  map.on('click', function (e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    if (marker) {
      marker.setLatLng([lat, lng]).bindPopup(`Selected: ${lat.toFixed(5)}, ${lng.toFixed(5)}`).openPopup();
    } else {
      marker = L.marker([lat, lng]).addTo(map).bindPopup(`Selected: ${lat.toFixed(5)}, ${lng.toFixed(5)}`).openPopup();
    }

    const addrInput = document.getElementById('address-input');
    if (addrInput) addrInput.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  });
}

async function findAddress() {
  const addrEl = document.getElementById('address-input');
  const errEl  = document.getElementById('address-error');

  // ✅ Clear old error message every time Find Address is clicked
  if (errEl) errEl.textContent = '';

  const address = (addrEl || { value: '' }).value.trim();
  if (!address) {
    if (errEl) errEl.textContent = 'Please enter an address or coordinates.';
    return;
  }

  const coordMatch = address.match(/^\s*([+-]?\d+(\.\d+)?)\s*,\s*([+-]?\d+(\.\d+)?)\s*$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[3]);
    if (!mapInitialized) {
      showPage(LOCATION_PAGE_INDEX);
    }

    if (map) {
      map.setView([lat, lon], 16);
      if (marker) marker.setLatLng([lat, lon]).bindPopup(`Coordinates: ${lat}, ${lon}`).openPopup();
      else marker = L.marker([lat, lon]).addTo(map).bindPopup(`Coordinates: ${lat}, ${lon}`).openPopup();
    }
    return;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json();

    if (!data || data.length === 0) {
      if (errEl) errEl.textContent = 'Address not found. Try a different query.';
      return;
    }

    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);

    if (!mapInitialized) {
      showPage(LOCATION_PAGE_INDEX);
    }

    if (map) {
      map.setView([lat, lon], 16);
      const displayName = data[0].display_name || address;
      if (marker) marker.setLatLng([lat, lon]).bindPopup(displayName).openPopup();
      else marker = L.marker([lat, lon]).addTo(map).bindPopup(displayName).openPopup();
    }
  } catch (err) {
    console.error('Geocoding error', err);
    if (errEl) errEl.textContent = 'Error finding address. Please try again.';
  }
}

// ---------- SAVE REPORT TO LOCALSTORAGE ----------
function saveReportToLocalStorage(reporter, reference) {
  const type        = selectedIssue || "Unknown";
  const description = (document.getElementById('issue-description')?.value || "").trim();
  const location    = (document.getElementById('address-input')?.value || "").trim();
  const date        = new Date().toLocaleString();

  const fileEl = document.getElementById('issue-photo');
  const file   = fileEl && fileEl.files && fileEl.files[0];

  const doSave = (photoData) => {
    const report = { type, description, reporter, reference, date, location, photo: photoData || null };
    localStorage.setItem('fixitReport', JSON.stringify(report));
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = e => doSave(e.target.result);
    reader.readAsDataURL(file);
  } else {
    doSave(null);
  }
}

// ---------- CONTACT DETAILS PAGE ----------
function reportAnonymous() {
  sharedReport = false;
  showPage(5);

  const anonMsg = document.getElementById('anonymous-message');
  if (anonMsg) anonMsg.style.display = 'block';

  const refCont = document.getElementById('reference-container');
  if (refCont) refCont.style.display = 'none';

  // Save report as anonymous
  const reference = generateReference();
  saveReportToLocalStorage("Anonymous", reference);
}

function shareDetails() {
  sharedReport = true;
  const form = document.getElementById('contact-form');
  if (form) form.style.display = 'block';
}

function submitReport() {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  document.getElementById('name-error').innerText = '';
  document.getElementById('email-error').innerText = '';
  nameInput.classList.remove('input-error');
  emailInput.classList.remove('input-error');

  let valid = true;

  if (!name) {
    document.getElementById('name-error').innerText = 'Name is required.';
    nameInput.classList.add('input-error');
    valid = false;
  }
  if (!email) {
    document.getElementById('email-error').innerText = 'Email is required.';
    emailInput.classList.add('input-error');
    valid = false;
  }

  if (!valid) return;

  showPage(5);

  let reference;
  if (sharedReport) {
    reference = generateReference();
    const el = document.getElementById('reference-number');
    if (el) el.innerText = reference;
    const refCont = document.getElementById('reference-container');
    if (refCont) refCont.style.display = 'block';
  } else {
    reference = generateReference();
    const refCont = document.getElementById('reference-container');
    if (refCont) refCont.style.display = 'none';
  }

  // Save report with name
  saveReportToLocalStorage(name, reference);
}

// ---------- GENERATE UNIQUE REFERENCE NUMBER ----------
function generateReference() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = '';
  for (let i = 0; i < 8; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}
