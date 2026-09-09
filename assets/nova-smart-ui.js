
(() => {
"use strict";

window.AINovaSmartUI = {

  async load(id) {
    const r = await fetch("data/smart-ui-profiles.json");
    const data = await r.json();
    return data.profiles[id] || null;
  },

  render(profile, container) {

    container.innerHTML = "";

    if (!profile) return;

    for (const field of profile.fields) {

      const wrap = document.createElement("div");
      wrap.className = "smart-field";

      const label = document.createElement("label");
      label.textContent = field.label || field.id;

      let input;

      if (field.type === "textarea") {
        input = document.createElement("textarea");
      } else {
        input = document.createElement("input");
        input.type = field.type || "text";
      }

      input.id = "smart-" + field.id;
      input.name = field.id;

      if (field.placeholder)
        input.placeholder = field.placeholder;

      if (field.default !== undefined)
        input.value = field.default;

      if (field.required)
        input.required = true;

      wrap.appendChild(label);
      wrap.appendChild(input);
      container.appendChild(wrap);
    }
  },

  values(profile) {

    const values = {};

    if (!profile) return values;

    for (const field of profile.fields) {
      const el = document.getElementById("smart-" + field.id);
      if (!el) continue;

      values[field.id] = el.value;
    }

    return values;
  }
};

})();
