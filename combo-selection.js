function getOptionValue(button) {
  return [...button.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent)
    .join("")
    .trim();
}

function getFieldValue(input) {
  const value = input.value.trim();
  const placeholder = String(input.placeholder || "").trim();
  if (!value || (placeholder && value === placeholder)) return "";
  return value;
}

function updateComboSelection(menu) {
  const input = menu.closest(".combo")?.querySelector("input");
  if (!input) return;

  const current = getFieldValue(input);
  menu.querySelectorAll(".combo-option").forEach((button) => {
    const isMatch = Boolean(current) && getOptionValue(button) === current;
    button.classList.toggle("is-selected", isMatch);
  });
}

function initComboSelection() {
  document.querySelectorAll(".combo-menu").forEach(updateComboSelection);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const menu = mutation.target.classList?.contains("combo-menu")
        ? mutation.target
        : mutation.target.closest?.(".combo-menu");
      if (menu) updateComboSelection(menu);
    });
  });

  document.querySelectorAll(".combo-menu").forEach((menu) => {
    observer.observe(menu, { childList: true, subtree: true });
  });

  document.querySelectorAll(".combo input").forEach((input) => {
    input.addEventListener("input", () => {
      const menu = input.closest(".combo")?.querySelector(".combo-menu");
      if (menu) updateComboSelection(menu);
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initComboSelection);
} else {
  initComboSelection();
}
