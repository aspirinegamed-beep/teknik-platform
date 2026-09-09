/* AI NOVA V5.7
   Unified Real Tool Router
   Local-first / browser-first / no fake results
*/
(function () {
  "use strict";

  const Registry = window.AINovaRegistry || {};

  function getRegistry() {
    return Registry;
  }

  function isAvailable(id) {
    const item = Registry[id];
    return !!(
      item &&
      item.status === "Available" &&
      item.implemented === true
    );
  }

  function engineCandidates() {
    return [
      window.AINovaV56,
      window.AINovaV55,
      window.AINovaV54,
      window.AINovaV53,
      window.AINovaV52,
      window.AINova
    ].filter(Boolean);
  }

  async function run(id, values) {
    if (!isAvailable(id)) {
      return {
        ok: false,
        status: "Coming Soon",
        tool: id,
        message:
          "This tool is not locally implemented yet. " +
          "AI Nova will not generate a fake result."
      };
    }

    const engines = engineCandidates();

    for (const engine of engines) {
      try {
        if (typeof engine.run !== "function") continue;

        const result = await engine.run(id, values || {});

        if (result !== undefined && result !== null) {
          if (typeof result === "object" && "ok" in result) {
            return result;
          }

          return {
            ok: true,
            status: "Available",
            tool: id,
            result
          };
        }
      } catch (error) {
        console.warn("AI Nova engine error:", id, error);
      }
    }

    return {
      ok: false,
      status: "Coming Soon",
      tool: id,
      message:
        "The tool is registered but its execution layer is not available."
    };
  }

  window.AINovaV57 = {
    version: "5.7",
    getRegistry,
    isAvailable,
    run
  };

  window.AINovaUnified = window.AINovaV57;
})();
