document.addEventListener("DOMContentLoaded", () => {
  const gridContainer = document.getElementById("map-grid");
  const results = document.getElementById("map-results");

  // ===============================
  // GRID VISUAL SETUP
  // ===============================
  const letters = ["A","B","C","D","E","F","G","H","I","J","K","L","M"];
  const numbers = Array.from({ length: 12 }, (_, i) => i + 1);

  gridContainer.style.display = "grid";
  gridContainer.style.gridTemplateColumns = `repeat(${letters.length}, 1fr)`;
  gridContainer.style.gridTemplateRows = `repeat(${numbers.length}, 1fr)`;
  gridContainer.style.gap = "2px";

  // ===============================
  // CREATE GRID CELLS
  // ===============================
  numbers.forEach(num => {
    letters.forEach(letter => {
      const cell = document.createElement("div");
      cell.classList.add("map-cell");
      cell.dataset.grid = `${letter}${num}`;
      cell.innerText = `${letter}${num}`;
      cell.style.backgroundColor = "#f0f0f0";
      gridContainer.appendChild(cell);
    });
  });

  // ===============================
  // LOAD BOTH CSV FILES
  // ===============================
  Promise.all([
    fetch("data/grid_lookup.csv").then(r => r.text()),
    fetch("data/cemetery_data_fixed.csv").then(r => r.text())
  ])
    .then(([lookupCSV, cemeteryCSV]) => {
      const lookupData = Papa.parse(lookupCSV, { header: true, skipEmptyLines: true }).data;
      const cemeteryData = Papa.parse(cemeteryCSV, { header: true, skipEmptyLines: true }).data;

      // Group all people by grid
      const gridGroups = {};

      cemeteryData.forEach(person => {
        const grid = person.Grid?.trim() || person.Grid?.trim(); // just in case column name differs
        if (!grid) return;
        if (!gridGroups[grid]) gridGroups[grid] = [];
        gridGroups[grid].push({
          name: person.Occupant?.trim() || "(Unknown)",
          birth: person.Birth?.trim() || "",
          death: person.Death?.trim() || "",
          ward: person.Ward?.trim() || "0"
        });
      });

      console.log("Unique grids with data:", Object.keys(gridGroups).length, gridGroups);

      // ===============================
      // APPLY COLORS + CLICK EVENTS
      // ===============================
      document.querySelectorAll(".map-cell").forEach(cell => {
        const grid = cell.dataset.grid;
        const people = gridGroups[grid] || [];
        const count = people.length;

        // Color intensity = how many names in that grid
        if (count === 0) {
          cell.style.backgroundColor = "#f0f0f0"; // empty - grayish white
        } else {
          // darken green slightly with more names
          const greenValue = Math.max(200 - count * 10, 120);
          cell.style.backgroundColor = `rgb(${greenValue}, ${greenValue + 30}, ${greenValue})`;
        }

        // Click event to show info
        cell.addEventListener("click", () => {
          if (count === 0) {
            results.innerHTML = `<p>No records found for ${grid}</p>`;
          } else {
            results.innerHTML = `
              <h2>Section ${grid}</h2>
              <ul>
                ${people
                  .map(p => `<li>${p.name} (${p.birth} - ${p.death})</li>`)
                  .join("")}
              </ul>
            `;
          }
        });
      });
    })
    .catch(err => {
      console.error("Error loading data:", err);
      results.innerText = "Error loading data.";
    });
});
