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
      window.AINovaV59,
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


/* AI NOVA V5.9.1 V59 BRIDGE */
(function () {
  const previousRun =
    window.AINovaUnified &&
    typeof window.AINovaUnified.run === "function"
      ? window.AINovaUnified.run.bind(window.AINovaUnified)
      : null;

  window.AINovaUnified = window.AINovaUnified || {};

  window.AINovaUnified.run = async function (toolId, input, options) {
    if (
      window.AINovaV59 &&
      typeof window.AINovaV59.run === "function"
    ) {
      try {
        const result = await window.AINovaV59.run(
          toolId,
          input,
          options || {}
        );

        if (result !== undefined && result !== null) {
          return result;
        }
      } catch (error) {
        console.warn("V5.9 engine fallback:", error);
      }
    }

    if (previousRun) {
      return previousRun(toolId, input, options || {});
    }

    throw new Error("No AI Nova tool engine available.");
  };
})();

