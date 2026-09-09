/* AI NOVA V5.7 registry loader */
(function () {
  fetch("data/tool-registry.json", { cache: "no-store" })
    .then(r => r.json())
    .then(data => {
      const tools = data.tools || {};
      window.AINovaRegistry = tools;

      document.dispatchEvent(
        new CustomEvent("ainova-registry-ready", {
          detail: data
        })
      );
    })
    .catch(err => {
      console.error("AI Nova registry error:", err);
      window.AINovaRegistry = {};
    });
})();
