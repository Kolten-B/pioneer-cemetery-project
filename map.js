// map.js
// =======================================
// Simple grid-based "map" of the cemetery
// Phase 1: show which section (Grid_y like H5, I4, etc.) has burials,
//          and list the people in that section.
// Phase 2 (future): use a real visual map and Lot/Plot for precise markers.
// =======================================

document.addEventListener("DOMContentLoaded", () => {
  const gridContainer   = document.getElementById("map-grid");
  const results         = document.getElementById("map-results");
  const mapSearchInput  = document.getElementById("map-search");
  const mapSearchHint   = document.getElementById("map-search-hint");

  // -----------------------------
  // GRID VISUAL SETUP
  // -----------------------------
  // We limit the grid to the portion where we currently have good data.
  // PHASE 2: expand to full A–M, 1–12 and/or finer granularity.
  const letters = ["A","B","C","D","E","F","G","H","I","J","K"]; // cropped horizontally
  const numbers = Array.from({ length: 6 }, (_, i) => i + 1);   // rows 1–6 only

  gridContainer.style.display = "grid";
  gridContainer.style.gridTemplateColumns = `repeat(${letters.length}, minmax(55px, 1fr))`;
  gridContainer.style.gap = "6px";

  // Create grid cells like A1, A2, ..., K6
  numbers.forEach(num => {
    letters.forEach(letter => {
      const cell = document.createElement("div");
      cell.classList.add("map-cell");
      cell.dataset.grid = `${letter}${num}`; // matches Grid_y like H5
      cell.innerText = `${letter}${num}`;
      gridContainer.appendChild(cell);
    });
  });

  // -----------------------------
  // LOAD CEMETERY DATA (CSV for Phase 1)
  // -----------------------------
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
        const gridCode = (person.Grid_y || "").trim();
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

      const cells = document.querySelectorAll(".map-cell");

      // -----------------------------
      // APPLY COLORS + CLICK EVENTS
      // -----------------------------
      cells.forEach(cell => {
        const gridCode = cell.dataset.grid;
        const people   = gridGroups[gridCode] || [];
        const count    = people.length;

        // Color intensity = how many names in that grid
        if (count === 0) {
          cell.style.backgroundColor = "#f0f0f0"; // empty - gray
        } else {
          // More names => darker green (clamped)
          const base = 210; // start light
          const step = Math.min(count, 10);
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
                This grid shows the general area of these graves,
                not an exact headstone location yet.
                <br>
                <em>Phase 2:</em> A true map view will place graves more precisely using Lot/Plot data.
              </p>
            `;
          }

          results.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });

      // -----------------------------
      // NAME SEARCH → HIGHLIGHT SECTIONS
      // -----------------------------
      if (mapSearchInput) {
        const handleSearch = () => {
          const term = mapSearchInput.value.trim().toLowerCase();

          // Clear previous search highlights
          cells.forEach(c => c.classList.remove("search-hit"));

          if (!term) {
            if (mapSearchHint) {
              mapSearchHint.textContent = "Type part of a name to see which sections contain matching records.";
            }
            return;
          }

          const hitGrids = new Set();

          Object.entries(gridGroups).forEach(([gridCode, people]) => {
            for (const p of people) {
              const nameLower = (p.name || "").toLowerCase();
              if (nameLower.includes(term)) {
                hitGrids.add(gridCode);
                break;
              }
            }
          });

          if (hitGrids.size === 0) {
            if (mapSearchHint) {
              mapSearchHint.textContent = `No matches found for “${term}”.`;
            }
            return;
          }

          // Highlight all matching cells
          cells.forEach(c => {
            if (hitGrids.has(c.dataset.grid)) {
              c.classList.add("search-hit");
            }
          });

          if (mapSearchHint) {
            mapSearchHint.textContent =
              `Matches found in section(s): ${Array.from(hitGrids).sort().join(", ")}`;
          }
        };

        mapSearchInput.addEventListener("input", () => {
          // tiny debounce feel without complexity
          window.clearTimeout(mapSearchInput._t);
          mapSearchInput._t = window.setTimeout(handleSearch, 200);
        });
      }
    })
    .catch(err => {
      console.error("Error loading data:", err);
      results.innerText = "Error loading data.";
    });
});
