
(() => {
"use strict";

window.AINovaV51 = {

  openTool(id) {
    if (!id) return;
    localStorage.setItem("aiNova:lastTool", id);

    let recent = [];
    try {
      recent = JSON.parse(localStorage.getItem("aiNova:recent") || "[]");
    } catch(e) {}

    recent = [id, ...recent.filter(x => x !== id)].slice(0, 12);
    localStorage.setItem("aiNova:recent", JSON.stringify(recent));

    location.href = "tool.html?id=" + encodeURIComponent(id);
  },

  toggleFavorite(id) {
    let fav = [];
    try {
      fav = JSON.parse(localStorage.getItem("aiNova:favorites") || "[]");
    } catch(e) {}

    if (fav.includes(id)) {
      fav = fav.filter(x => x !== id);
    } else {
      fav.push(id);
    }

    localStorage.setItem("aiNova:favorites", JSON.stringify(fav));
    return fav.includes(id);
  },

  isFavorite(id) {
    try {
      return JSON.parse(
        localStorage.getItem("aiNova:favorites") || "[]"
      ).includes(id);
    } catch(e) {
      return false;
    }
  }
};

document.addEventListener("click", e => {

  const tool = e.target.closest("[data-tool-id]");
  if (!tool) return;

  if (e.target.closest("[data-favorite]")) {
    e.preventDefault();
    e.stopPropagation();

    const id = tool.dataset.toolId;
    const active = AINovaV51.toggleFavorite(id);

    const button = e.target.closest("[data-favorite]");
    button.textContent = active ? "★" : "☆";
    return;
  }

  AINovaV51.openTool(tool.dataset.toolId);
});

})();
