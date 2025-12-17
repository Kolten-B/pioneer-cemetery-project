if (form) {
  // Build a normalized name list once (we’ll hook this up in step 3)
  const people = (window.PIONEER_PEOPLE || []);
  const knownNames = people.map(p => (p.name || "").toLowerCase());

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const rawName = nameEl.value.trim();
    const rawSuggestion = textEl.value.trim();
    const rawEmail = emailEl.value.trim();

    if (!rawName || !rawSuggestion) {
      msgEl.textContent = "Please enter a name and a suggestion.";
      return;
    }

    // 🔎 Name validation (see section 3 for more detail)
    const typed = rawName.toLowerCase();

    const hasMatch = knownNames.some(n => {
      // allow “saxton” matching “Broadwith, Emma Saxton”
      return n.includes(typed) || typed.includes(n);
    });

    if (!hasMatch && knownNames.length > 0) {
      msgEl.textContent = "We couldn’t match that name in the records. Please check spelling or search the Records table first.";
      return;
    }

    // Loading state
    msgEl.textContent = "Submitting suggestion...";
    msgEl.classList.add("loading");

    try {
      const user = auth.currentUser;

      const safeSuggestion = rawSuggestion.slice(0, 2000); // cap length

      await addDoc(collection(db, "pendingEdits"), {
        personName: rawName,
        suggestion: safeSuggestion,
        contactEmail: rawEmail || null,
        submittedBy: user ? user.email : "anonymous",
        submittedAt: serverTimestamp(),
        status: "pending"
      });

      msgEl.classList.remove("loading");
      msgEl.textContent = "Thank you! Your suggestion has been submitted for review.";
      form.reset();
    } catch (err) {
      console.error(err);
      msgEl.classList.remove("loading");
      msgEl.textContent = "Error submitting suggestion. Please try again later.";
    }
  });
}
