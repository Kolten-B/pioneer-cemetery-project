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
        const recordCountEl = document.getElementById("record-count");

        const people = resultsData.data
          .map(row => ({
            name: row["Occupant"]?.trim() || "",
            birth: row["Birth"]?.trim() || "",
            death: row["Death"]?.trim() || "",
            veteran: (row["Veteran"] || "").trim()
          }))
          .filter(p => p.name);

        function updateCount(list) {
          if (recordCountEl) {
            recordCountEl.textContent = `Showing ${list.length} of ${people.length} records`;
          }
        }

        // show data after 5 seconds for a nice loading effect
        setTimeout(() => {
          results.classList.remove("loading");
          displayPeople(people);
          updateCount(people);
        }, 5000);

        // SEARCH: filter by name/birth/death
        let timeout;
        searchInput.addEventListener("input", () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            const searchType = document.getElementById("searchType");
            const term = searchInput.value.toLowerCase();
            const type = searchType.value;

            const filtered = people.filter(p =>
              (p[type] || "").toLowerCase().includes(term)
            );
            displayPeople(filtered);
            updateCount(filtered);
          }, 200);
        });

        // FUNCTION: display data table
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

          // simple name sorting only
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
  