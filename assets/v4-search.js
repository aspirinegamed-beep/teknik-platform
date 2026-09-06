(function () {
  const input = document.getElementById("search");
  const grid = document.getElementById("articles");

  if (!input || !grid) return;

  let category = "";

  const toolbar = document.createElement("div");
  toolbar.className = "v4-category-bar";

  toolbar.innerHTML = `
    <button type="button" class="v4-filter active" data-tag="">ALL</button>
    <button type="button" class="v4-filter" data-tag="AI">AI</button>
    <button type="button" class="v4-filter" data-tag="ANDROID">ANDROID</button>
    <button type="button" class="v4-filter" data-tag="GUIDE">GUIDE</button>
    <button type="button" class="v4-filter" data-tag="SECURITY">SECURITY</button>
  `;

  input.parentElement.insertAdjacentElement("afterend", toolbar);

  function filterArticles() {
    const query = input.value.toLowerCase().trim();

    [...grid.children].forEach(card => {
      const text = card.textContent.toLowerCase();
      const tag = card.dataset.tag || "";

      const matchesText = !query || text.includes(query);
      const matchesCategory = !category || tag === category;

      card.hidden = !(matchesText && matchesCategory);
    });
  }

  input.addEventListener("input", filterArticles);

  toolbar.addEventListener("click", event => {
    const button = event.target.closest(".v4-filter");
    if (!button) return;

    category = button.dataset.tag || "";

    toolbar.querySelectorAll(".v4-filter").forEach(b => {
      b.classList.remove("active");
    });

    button.classList.add("active");
    filterArticles();
  });
})();
