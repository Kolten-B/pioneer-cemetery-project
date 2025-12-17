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
      const filterVeteransCheckbox = document.getElementById("filterVeterans");

      // Helper: convert messy date strings like "7/3/1917" or "1860" to sortable numbers (YYYYMMDD).
      // If year is missing or weird, we push it to the bottom.
      function parseDateToNumber(str) {
        if (!str) return 0; // treat as "no date"
        const raw = str.trim();

        // Try to grab a 4-digit year
        const yearMatch = raw.match(/(\d{4})/);
        if (!yearMatch) return 0;
        const year = parseInt(yearMatch[1], 10);

        // Default month/day to 1 if they are missing or '?'
        let month = 1;
        let day = 1;

        // If there is something like M/D/YYYY, try to parse M and D
        const parts = raw.split("/");
        if (parts.length >= 2) {
          const m = parseInt(parts[0], 10);
          const d = parseInt(parts[1], 10);
          if (!isNaN(m)) month = m;
          if (!isNaN(d)) day = d;
        }

        // Format: YYYYMMDD as a number
        return year * 10000 + month * 100 + day;
      }

      // Parse CSV to nice objects
      const people = resultsData.data
        .map(row => ({
          name: row["Occupant"]?.trim() || "",
          birth: row["Birth"]?.trim() || "",
          death: row["Death"]?.trim() || "",
          veteran: (row["Veteran"] || "").trim()
        }))
        .filter(p => p.name);

      // 🔗 Make people list available to other scripts (like suggest.js)
      window.PIONEER_PEOPLE = people;

      // Update "Showing X of Y" text
      function updateCount(list) {
        if (recordCountEl) {
          recordCountEl.textContent = `Showing ${list.length} of ${people.length} records`;
        }
      }

      // Apply filters (search + veteran checkbox) and re-render
      let currentList = people.slice(); // base list we operate on
      let currentSortConfig = { key: "name", order: "asc" };

      function applyFiltersAndRender(sortConfig) {
        const searchType = document.getElementById("searchType");
        const term = (searchInput.value || "").toLowerCase();
        const type = searchType.value;
        const onlyVets = filterVeteransCheckbox.checked;

        let filtered = people.filter(p => {
          // text search
          const fieldValue = (p[type] || "").toLowerCase();
          if (term && !fieldValue.includes(term)) return false;

          // veteran filter
          if (onlyVets && !p.veteran) return false;

          return true;
        });

        // Apply optional sorting
        if (sortConfig) {
          const { key, order } = sortConfig;
          filtered.sort((a, b) => {
            let valA, valB;

            if (key === "name") {
              valA = (a.name || "").toLowerCase();
              valB = (b.name || "").toLowerCase();
            } else if (key === "birth") {
              valA = parseDateToNumber(a.birth);
              valB = parseDateToNumber(b.birth);
            } else if (key === "death") {
              valA = parseDateToNumber(a.death);
              valB = parseDateToNumber(b.death);
            } else {
              return 0;
            }

            if (valA < valB) return order === "asc" ? -1 : 1;
            if (valA > valB) return order === "asc" ? 1 : -1;
            return 0;
          });
        }

        currentList = filtered;
        displayPeople(currentList, sortConfig);
        updateCount(currentList);
      }

      // Random loading delay 1–5 seconds
      const delayMs = 1000 + Math.floor(Math.random() * 4000);

      setTimeout(() => {
        results.classList.remove("loading");
        applyFiltersAndRender({ key: "name", order: "asc" }); // default
      }, delayMs);

      // Debounced search
      let timeout;
      searchInput.addEventListener("input", () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          applyFiltersAndRender(currentSortConfig);
        }, 200);
      });

      // Re-filter when "Show veterans only" changes
      filterVeteransCheckbox.addEventListener("change", () => {
        applyFiltersAndRender(currentSortConfig);
      });

      // Render table + attach header sort events
      function displayPeople(list, sortConfig) {
        if (list.length === 0) {
          results.innerHTML = "<p>No matching names found.</p>";
          return;
        }

        results.innerHTML = `
          <table class="data-table">
            <thead>
              <tr>
                <th data-sort="name">Name ⬍</th>
                <th data-sort="birth">Birth ⬍</th>
                <th data-sort="death">Death ⬍</th>
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

        // Attach sorting behavior to all three headers
        const headers = results.querySelectorAll("th[data-sort]");
        headers.forEach(header => {
          const key = header.getAttribute("data-sort");
          header.style.cursor = "pointer";

          header.addEventListener("click", () => {
            const newOrder =
              currentSortConfig.key === key && currentSortConfig.order === "asc"
                ? "desc"
                : "asc";

            currentSortConfig = { key, order: newOrder };
            applyFiltersAndRender(currentSortConfig);
          });
        });
      }
    },

    error: function (err) {
      console.error("Error loading CSV:", err);
      results.innerText = "Error loading data.";
    }
  });
});
