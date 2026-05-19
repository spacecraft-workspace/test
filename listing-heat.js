const heatEl = document.querySelector(".heat");
const vesselDetails = document.querySelector(".vessel-details");
const heatHullInput = document.querySelector("#hull-number");
const heatStorageKey = "listing-general-info:dealer-anna";

const HEAT_LEVELS = [
  { id: "freezing", label: "Freezing", threshold: 0 },
  { id: "cold", label: "Cold", threshold: 0.16 },
  { id: "cool", label: "Cool", threshold: 0.38 },
  { id: "warm", label: "Warm", threshold: 0.62 },
];

let listingHeatFrame = 0;

function readDraft() {
  try {
    return JSON.parse(localStorage.getItem(heatStorageKey) || "{}");
  } catch {
    return {};
  }
}

function getInputValue(input, draftKey) {
  if (!input) return "";

  const placeholder = String(input.placeholder || "").trim();
  const domValue = input.value.trim();
  if (domValue && domValue !== placeholder) return domValue;

  if (!draftKey) return "";
  const draft = readDraft();
  return String(draft[draftKey] || "").trim();
}

function isFilledInput(input, draftKey) {
  if (!input || input.disabled) return false;
  return Boolean(getInputValue(input, draftKey));
}

function getListingHeatProgress() {
  if (!vesselDetails) return 0;

  const checks = [
    () => isFilledInput(document.querySelector("#make-input"), "make"),
    () => isFilledInput(document.querySelector("#model-input"), "model"),
    () => isFilledInput(document.querySelector("#year-input"), "year"),
    () => isFilledInput(heatHullInput, "hull"),
    () => isFilledInput(vesselDetails.querySelector(".field.full input")),
    () => isFilledInput(vesselDetails.querySelector('input[placeholder="Current Name"]')),
    () => isFilledInput(vesselDetails.querySelector('input[placeholder="Launch Name"]')),
  ];

  const filled = checks.filter((check) => check()).length;
  return filled / checks.length;
}

function getListingHeatLevel(progress) {
  return HEAT_LEVELS.reduce((active, level) => (progress >= level.threshold ? level : active), HEAT_LEVELS[0]);
}

function scheduleListingHeat() {
  if (listingHeatFrame) return;
  listingHeatFrame = requestAnimationFrame(() => {
    listingHeatFrame = 0;
    renderListingHeat();
  });
}

function renderListingHeat() {
  if (!heatEl) return;

  const progress = getListingHeatProgress();
  const level = getListingHeatLevel(progress);
  const label = heatEl.querySelector("strong");
  const previous = heatEl.dataset.heat;

  const showSunOrbit = level.id !== "freezing" && level.id !== "cold";
  const particleCount = showSunOrbit ? Math.min(6, Math.ceil(progress * 6)) : 0;
  const gradientMaxOpacity = 0.54;
  const gradientMaxHeight = 323;
  const gradientOpacity = progress === 0 ? 0 : progress * gradientMaxOpacity;
  const gradientHeight = progress === 0 ? 0 : Math.round(progress * gradientMaxHeight);

  heatEl.dataset.heat = level.id;
  heatEl.style.setProperty("--heat-progress", progress.toFixed(3));
  document.body.style.setProperty("--listing-heat-gradient", gradientOpacity.toFixed(3));
  document.body.style.setProperty("--listing-heat-gradient-height", `${gradientHeight}px`);
  if (label) label.textContent = level.label;

  heatEl.querySelectorAll(".heat-orbit i").forEach((particle, index) => {
    particle.classList.toggle("is-visible", index < particleCount);
  });

  if (previous && previous !== level.id) {
    heatEl.classList.remove("is-transitioning");
    void heatEl.offsetWidth;
    heatEl.classList.add("is-transitioning");
    window.setTimeout(() => heatEl.classList.remove("is-transitioning"), 1000);
  }
}

function initListingHeat() {
  renderListingHeat();

  requestAnimationFrame(() => {
    renderListingHeat();
    requestAnimationFrame(renderListingHeat);
  });

  window.setTimeout(renderListingHeat, 0);
}

if (vesselDetails && heatEl) {
  initListingHeat();
  vesselDetails.addEventListener("input", scheduleListingHeat);
  vesselDetails.addEventListener("change", scheduleListingHeat);
  vesselDetails.addEventListener("click", scheduleListingHeat);
  window.addEventListener("pageshow", renderListingHeat);
}
