/* AI NOVA V6.0 REAL UNIFIED ENGINE */
(function () {
  "use strict";

  const IMPLEMENTATIONS = {
  "discount-calculator": {
    "sources": [
      "nova-engine-v59.js"
    ]
  },
  "password-generator": {
    "sources": [
      "nova-engine-v59.js"
    ]
  },
  "percentage-calculator": {
    "sources": [
      "nova-engine-v59.js"
    ]
  },
  "query-string-parser": {
    "sources": [
      "nova-engine-v59.js"
    ]
  },
  "slug-generator": {
    "sources": [
      "nova-engine-v59.js"
    ]
  },
  "tip-calculator": {
    "sources": [
      "nova-engine-v59.js"
    ]
  },
  "uuid-generator": {
    "sources": [
      "nova-engine-v59.js"
    ]
  }
};

  const engines = [
    () => window.AINovaV59,
    () => window.AINovaV56,
    () => window.AINovaV55
  ];

  async function run(toolId, values, options) {
    const input = values || {};
    
    for (const getEngine of engines) {
      try {
        const engine = getEngine();

        if (engine && typeof engine.run === "function") {
          const result = await engine.run(
            toolId,
            input,
            options || {}
          );

          if (result !== undefined && result !== null) {
            return result;
          }
        }
      } catch (error) {
        console.warn(
          "AI Nova V6 fallback:",
          error
        );
      }
    }

    throw new Error(
      "No local implementation available for: " + toolId
    );
  }

  function has(toolId) {
    return Object.prototype.hasOwnProperty.call(
      IMPLEMENTATIONS,
      toolId
    );
  }

  window.AINovaV60 = {
    version: "6.0.1",
    run,
    has,
    implementations: Object.freeze(IMPLEMENTATIONS)
  };
})();


// AI NOVA V6.0.2 CANONICAL IMPLEMENTATION ALIASES
window.AINovaV602Aliases = {
  "binary-to-decimal": "binary-converter",
  "decimal-to-binary": "binary-converter",
  "decimal-to-hex": "hex-converter",
  "hex-to-decimal": "hex-converter",
  "hex-to-hsl": "hex-converter",
  "hsl-to-hex": "hex-converter",
  "compound-interest-calculator": "compound-interest",
  "count-paragraphs": "paragraph-counter",
  "count-sentences": "sentence-counter",
  "extract-numbers": "random-number",
  "lorem-ipsum-generator": "lorem-generator",
  "percentage-change-calculator": "percentage-calculator",
  "query-string-builder": "query-string-parser",
  "random-number-generator": "random-number",
  "random-string-generator": "random-string",
  "remove-line-breaks": "duplicate-remover",
  "timestamp-converter": "timestamp",
  "unix-timestamp": "timestamp"
};
