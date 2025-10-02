// ==================== VARIABLES ====================
// Track the current visible page which is 0 - the first page
let currentPage = 0;

// Select all page sections in the app
const pages = document.querySelectorAll('.page');

// Flags for user choice
let sharedReport = false, selectedIssue = '';//whether user shares contact details, stores the selected issue type

// Map related variables
let map, marker, mapInitialized = false;

// Index of the page containing the map/location
const LOCATION_PAaGE_INDEX = 3;


// ==================== PAGE NAVIGATION ====================
// Function to display a specific page by index
function showPage(index) {
  // Toogle the active class on all pages
  pages.forEach((p, i) => p.classList.toggle('active', i === index));
  
  //Only initialize map if we're on the location page
  if (index !== LOCATION_PAaGE_INDEX) return;

  setTimeout(() => {
    if (!mapInitialized) { initMap(); mapInitialized = true; }//mark map as intialized
    else map?.invalidateSize();//fix map display after container resize
  }, 100);//delay by 100ms
}

// Move to next page if not last
function nextPage() { if (currentPage < pages.length - 1) showPage(++currentPage); }

// Move to previous page if not first
function prevPage() { if (currentPage > 0) showPage(--currentPage); }

// Show the first page on load
showPage(currentPage);


// ==================== ISSUE TYPE ====================
// Set selected issue and move to next page
function selectIssue(issue) { selectedIssue = issue; nextPage(); }


// ==================== MAP ====================
// Initialize the Leaflet map
function initMap() {
  if (typeof L === 'undefined') return console.error('Leaflet not loaded');

  // Default map center (Mission Ready location - coordinates)
  map = L.map('map').setView([-36.9263, 174.7830], 13);

  //add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '© OpenStreetMap'
  }).addTo(map);

  // Add default marker
  marker = L.marker([-36.9263, 174.7830]).addTo(map).bindPopup('Default Location').openPopup();

  // Update marker when user clicks on the map
  map.on('click', e => updateMarker(e.latlng.lat, e.latlng.lng, `Selected`));
}

//update or create a marker at given coordinates
function updateMarker(lat, lng, label) {
  marker = marker || L.marker([lat, lng]).addTo(map);
  marker.setLatLng([lat, lng]).bindPopup(`${label}: ${lat.toFixed(5)}, ${lng.toFixed(5)}`).openPopup();
  const addr = document.getElementById('address-input');
  if (addr) addr.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;//update input with coordinates
}

//search for an addresss/coordinates and move map to it
async function findAddress() {//function to find address or coordinates
  const input = document.getElementById('address-input')?.value.trim();//get user input from field
  if (!input) return alert('Enter an address or coordinates.');//stop if input is empty

  // Check if input is coordinates
  const coords = input.match(/^\s*([+-]?\d+(\.\d+)?),\s*([+-]?\d+(\.\d+)?)\s*$/);
  if (coords) return moveTo(+coords[1], +coords[3], 'Coordinates');

//otherwise search address using OpenStreetMap nominatim
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}`);
    const data = await res.json();
    if (!data.length) return alert('Address not found.');
    moveTo(+data[0].lat, +data[0].lon, data[0].display_name || input);
  } catch (err) {
    console.error('Geocoding error', err);
    alert('Error finding address.');
  }
}

//Move map and marker to a given lat/long with label
function moveTo(lat, lon, label) {
  if (!mapInitialized) showPage(LOCATION_PAGE_INDEX);//ensure map is ready
  map?.setView([lat, lon], 16);//center map and zoom in
  updateMarker(lat, lon, label);//update marker with new position and label
}


// ==================== CONTACT DETAILS ====================
//User chooses to report anonymously
function reportAnonymous() {
  sharedReport = false;
  showPage(5);
  document.getElementById('anonymous-message')?.style.setProperty('display', 'block');
  document.getElementById('reference-container')?.style.setProperty('display', 'none');
}

//User chooses to share their contact details
function shareDetails() {
  sharedReport = true;
  document.getElementById('contact-form')?.style.setProperty('display', 'block');
}

//validate and submit report
function submitReport() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  let valid = true;

//Validate required fields
  ['name', 'email'].forEach(id => {//loop through fields
    const input = document.getElementById(id);//get input field
    const err = document.getElementById(`${id}-error`);//get error span
    input.classList.remove('input-error');//clear error styles
    err.innerText = '';//clear previous error message

      if (!input.value.trim()) {//if field is empty
        err.innerText = `${id[0].toUpperCase() + id.slice(1)} is required.`;//show error message
        input.classList.add('input-error');//add error styling
        valid = false;//mark as invalid
    }
  });

  if (!valid) return;//stop if invalid inputs

//Move to confirmation page
  showPage(5);
  const refCont = document.getElementById('reference-container');//reference container element
  if (sharedReport) {//if user share details
    document.getElementById('reference-number').innerText = generateReference();//generate and display refernce number
    refCont.style.display = 'block';//show reference container
  } else refCont.style.display = 'none';//hide reference container if anonymous
}

// ==================== IMAGE INSERTING ====================
// Preview image when user selects file
document.getElementById('issue-photo').addEventListener('change', function(event) {
  const file = event.target.files[0];
  const dropText = document.getElementById('drop-text');
  const preview = document.getElementById('preview');

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      preview.style.display = 'block'; // show image
      dropText.style.display = 'none'; // hide text
    }
    reader.readAsDataURL(file);
  } else {
    preview.style.display = 'none'; // hide image if no file
    dropText.style.display = 'block'; // show text back
  }
});


// ==================== GENERATE REFERENCE ====================
//Create a random 8character reference number
function generateReference() {
  return Array.from({ length: 8 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'//create array of 8 characters and allowed characters
    .charAt(Math.floor(Math.random() * 36))).join('');//pick random character and join into a single string
}