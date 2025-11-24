document.addEventListener("DOMContentLoaded", () => {
    const results = document.getElementById("results");
    const searchInput = document.getElementById("search");
  
    // show the initial loading state
    results.innerText = "Loading data...";
    results.classList.add("loading");
  
    Papa.parse("data/cemetery_data.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function (resultsData) {
        // Element that shows "Showing X of Y records"
        const recordCountEl = document.getElementById("record-count");

        // Parse CSV rows into a friendlier JS structure
        // PHASE 2 IDEA: In the future, this data could come from Firestore instead of CSV.
        const people = resultsData.data
          .map(row => ({
            name: row["Occupant"]?.trim() || "",
            birth: row["Birth"]?.trim() || "",
            death: row["Death"]?.trim() || "",
            // Some rows mark veterans with something like "X" or another flag
            veteran: (row["Veteran"] || "").trim()
          }))
          .filter(p => p.name);

        // Helper: update the "Showing X of Y" text
        function updateCount(list) {
          if (recordCountEl) {
            recordCountEl.textContent = `Showing ${list.length} of ${people.length} records`;
          }
        }

        // Randomized loading delay (1–5 seconds) for a slightly "fancier" feel
        const delayMs = 1000 + Math.floor(Math.random() * 4000);

        setTimeout(() => {
          results.classList.remove("loading");
          displayPeople(people);
          updateCount(people);
        }, delayMs);

        // Debounced search input handler
        let timeout;
        searchInput.addEventListener("input", () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            const searchType = document.getElementById("searchType");
            const term = searchInput.value.toLowerCase();
            const type = searchType.value; // "name", "birth", or "death"

            const filtered = people.filter(p =>
              (p[type] || "").toLowerCase().includes(term)
            );
            displayPeople(filtered);
            updateCount(filtered);
          }, 200);
        });

        // Renders the table of people into the #results div
        function displayPeople(list) {
          if (list.length === 0) {
            results.innerHTML = "<p>No matching names found.</p>";
            return;
          }

          results.innerHTML = `
            <table class="data-table">
              <thead>
                <tr>
                  <th data-sort="name">Name ⬍</th>
                  <th>Birth</th>
                  <th>Death</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          `;

          const tbody = results.querySelector("tbody");

          const renderRows = (rows) => {
            tbody.innerHTML = rows
              .map(p => {
                const vetBadge = p.veteran ? `<span class="badge-veteran">🎖</span>` : "";
                return `
                  <tr>
                    <td>${p.name}${vetBadge}</td>
                    <td>${p.birth || "-"}</td>
                    <td>${p.death || "-"}</td>
                  </tr>`;
              })
              .join("");
          };

          renderRows(list);

          // Simple alphabetical sort by name (click the header)
          const nameHeader = results.querySelector('th[data-sort="name"]');
          nameHeader.addEventListener("click", () => {
            const currentOrder = nameHeader.dataset.order === "asc" ? "desc" : "asc";
            nameHeader.dataset.order = currentOrder;

            const sorted = [...list].sort((a, b) => {
              const valA = (a.name || "").toLowerCase();
              const valB = (b.name || "").toLowerCase();

              if (valA < valB) return currentOrder === "asc" ? -1 : 1;
              if (valA > valB) return currentOrder === "asc" ? 1 : -1;
              return 0;
            });

            renderRows(sorted);
          });
        }
      },

      error: function (err) {
        console.error("Error loading CSV:", err);
        results.innerText = "Error loading data.";
      }
    });
  });
  