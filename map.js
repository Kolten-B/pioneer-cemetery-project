// MAP.JS
// =======================================
// Simple grid-based "map" of the cemetery
// Phase 1: show which section (Grid_y like H5, I4, etc.) has burials,
//          and list the people in that section.
// Phase 2 (future): use a real visual map (image/SVG/Leaflet),
//          and use Lot/Plot to place markers more precisely.
// =======================================

document.addEventListener("DOMContentLoaded", () => {
  const gridContainer = document.getElementById("map-grid");
  const results = document.getElementById("map-results");

  // -----------------------------
  // GRID VISUAL SETUP
  // -----------------------------
  // NOTE: Originally this was A–M by 1–12.
  // For Phase 1, we intentionally limit the grid to the portion
  // where we currently have reliable mapping data.
  //
  // PHASE 2: Expand this grid again (e.g., back to A–M and 1–12),
  // and break each section into smaller cells using Lot/Plot.
  const letters = ["A","B","C","D","E","F","G","H","I","J","K"]; // cropped horizontally
  const numbers = Array.from({ length: 6 }, (_, i) => i + 1);   // rows 1–6 only

  gridContainer.style.display = "grid";
  gridContainer.style.gridTemplateColumns = `repeat(${letters.length}, 1fr)`;
  gridContainer.style.gridTemplateRows = `repeat(${numbers.length}, 1fr)`;
  gridContainer.style.gap = "2px";

  // Create grid cells like A1, A2, ..., K6
  numbers.forEach(num => {
    letters.forEach(letter => {
      const cell = document.createElement("div");
      cell.classList.add("map-cell");
      cell.dataset.grid = `${letter}${num}`; // matches Grid_y like H5
      cell.innerText = `${letter}${num}`;
      cell.style.backgroundColor = "#f0f0f0";
      gridContainer.appendChild(cell);
    });
  });

  // -----------------------------
  // LOAD CEMETERY DATA (Phase 1 uses CSV)
  // -----------------------------
  // PHASE 2 IDEA: Instead of CSV, load this from a Firestore collection
  // such as "people", where each document has fields like:
  // { name, birth, death, gridCode, ward, block, lot, plot, bio, photos[] }
  fetch("data/cemetery_data_fixed.csv")
    .then(r => r.text())
    .then(csvText => {
      const cemeteryData = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true
      }).data;

      // Group all people by grid code (Grid_y = letter+number, e.g., H5)
      const gridGroups = {};

      cemeteryData.forEach(person => {
        const gridCode = (person.Grid_y || "").trim(); // use mapped grid
        if (!gridCode) return;

        if (!gridGroups[gridCode]) {
          gridGroups[gridCode] = [];
        }

        gridGroups[gridCode].push({
          name: (person.Occupant || "").trim() || "(Unknown)",
          birth: (person.Birth || "").trim(),
          death: (person.Death || "").trim(),
          ward: (person.Ward || "").trim(),
          block: (person.Block || "").trim()
          // PHASE 2: could also include lot, plot, bio, etc.
        });
      });

      console.log("Unique grids with data:", Object.keys(gridGroups).length);

      // -----------------------------
      // APPLY COLORS + CLICK EVENTS
      // -----------------------------
      const cells = document.querySelectorAll(".map-cell");

      cells.forEach(cell => {
        const gridCode = cell.dataset.grid;
        const people = gridGroups[gridCode] || [];
        const count = people.length;

        // Color intensity = how many names in that grid
        if (count === 0) {
          cell.style.backgroundColor = "#f0f0f0"; // empty - gray
        } else {
          // More names => darker green, but clamped to not go too dark
          const base = 210; // start light
          const step = Math.min(count, 10); // cap influence at 10
          const greenValue = Math.max(base - step * 8, 130);
          cell.style.backgroundColor = `rgb(${greenValue}, ${greenValue + 20}, ${greenValue})`;
        }

        // Clicking a cell: highlight it and show names in the panel
        cell.addEventListener("click", () => {
          // Clear previous selection
          cells.forEach(c => c.classList.remove("selected"));

          // Mark this one
          cell.classList.add("selected");

          if (count === 0) {
            results.innerHTML = `<p>No records found for section ${gridCode}.</p>`;
          } else {
            results.innerHTML = `
              <h2>Section ${gridCode}</h2>
              <p>${count} record(s) in this section.</p>
              <ul>
                ${people
                  .map(p => `<li>${p.name} (${p.birth || "?"} – ${p.death || "?"})</li>`)
                  .join("")}
              </ul>
              <p class="map-note">
                Note: This grid shows the general area of these graves,
                not an exact headstone location yet.
                <br>
                <em>Phase 2:</em> A true map view will place graves more precisely using Lot/Plot data.
              </p>
            `;
          }

          // Scroll the result panel into view on small screens
          results.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    })
    .catch(err => {
      console.error("Error loading data:", err);
      results.innerText = "Error loading data.";
    });
});
