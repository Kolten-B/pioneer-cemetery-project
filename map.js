document.addEventListener("DOMContentLoaded", () => {
  const gridContainer = document.getElementById("map-grid");
  const results = document.getElementById("map-results");

  // =====================================
  // GRID VISUAL SETUP (letters across, numbers down)
  // =====================================
  const letters = ["A","B","C","D","E","F","G","H","I","J","K","L","M"]; // columns
  const numbers = Array.from({ length: 12 }, (_, i) => i + 1);          // rows 1–12

  gridContainer.style.display = "grid";
  gridContainer.style.gridTemplateColumns = `repeat(${letters.length}, 1fr)`;
  gridContainer.style.gridTemplateRows = `repeat(${numbers.length}, 1fr)`;
  gridContainer.style.gap = "4px";

  // Create grid cells: A1, B1, C1, ..., A2, B2, ..., M12
  numbers.forEach(num => {
    letters.forEach(letter => {
      const cell = document.createElement("div");
      cell.classList.add("map-cell");
      cell.dataset.grid = `${letter}${num}`;
      cell.textContent = `${letter}${num}`;
      gridContainer.appendChild(cell);
    });
  });

  // =====================================
  // LOAD CEMETERY DATA (already merged with lookup)
  // =====================================
  fetch("data/cemetery_data_fixed.csv")
    .then(r => r.text())
    .then(csvText => {
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true
      });

      const rows = parsed.data;

      // Group everyone by grid ID (e.g., "H5", "H6", "I5", etc.)
      const gridGroups = {};

      rows.forEach(row => {
        // Use Grid_y from cemetery_data_fixed.csv
        const rawGrid =
          (row.Grid_y || row.Grid || "").toString().trim();

        if (!rawGrid) return;

        if (!gridGroups[rawGrid]) {
          gridGroups[rawGrid] = [];
        }

        gridGroups[rawGrid].push({
          name: (row.Occupant || "").trim() || "(Unknown)",
          birth: (row.Birth || "").trim(),
          death: (row.Death || "").trim()
        });
      });

      console.log("Unique grids with data:", Object.keys(gridGroups).length);

      // =====================================
      // COLOR THE GRID + HOOK UP CLICK EVENTS
      // =====================================
      document.querySelectorAll(".map-cell").forEach(cell => {
        const gridId = cell.dataset.grid;
        const people = gridGroups[gridId] || [];
        const count = people.length;

        if (count === 0) {
          // No people here
          cell.classList.add("empty");
        } else {
          // More people = darker green
          const level = Math.min(count, 5); // clamp between 1–5
          cell.classList.add(`density-${level}`);
        }

        cell.addEventListener("click", () => {
          if (count === 0) {
            results.innerHTML = `<p>No records found for ${gridId}.</p>`;
          } else {
            results.innerHTML = `
              <h2>Section ${gridId}</h2>
              <ul>
                ${people
                  .map(
                    p =>
                      `<li>${p.name} (${p.birth || "?"} - ${p.death || "?"})</li>`
                  )
                  .join("")}
              </ul>
            `;
          }
        });
      });
    })
    .catch(err => {
      console.error("Error loading map data:", err);
      results.textContent = "Error loading data.";
    });
});
