
(() => {
"use strict";

window.AINovaLauncher = {
  launch(id) {
    if (!id) return false;
    location.href = "tool.html?id=" + encodeURIComponent(id);
    return true;
  }
};

})();
