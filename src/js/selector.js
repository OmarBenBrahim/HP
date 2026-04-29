function getSelectorParts(rootElement) {
  return {
    triggerElement: rootElement.querySelector(".js-selector-trigger"),
    valueElement: rootElement.querySelector(".selector__value"),
    menuElement: rootElement.querySelector(".js-selector-menu"),
    optionElements: Array.from(rootElement.querySelectorAll(".js-selector-option"))
  };
}

function updateExpandedState(rootElement, triggerElement, expanded) {
  rootElement.classList.toggle("is-open", expanded);
  triggerElement.setAttribute("aria-expanded", expanded ? "true" : "false");
}

function focusOption(optionElements, index) {
  if (index < 0 || index >= optionElements.length) {
    return;
  }

  optionElements[index].focus();
}

export function attachSelectorHandlers(rootElement, onChange) {
  const controller = new AbortController();
  const { signal } = controller;
  const {
    triggerElement,
    valueElement,
    menuElement,
    optionElements
  } = getSelectorParts(rootElement);

  if (!triggerElement || !valueElement || !menuElement || !optionElements.length) {
    return () => {};
  }

  const closeMenu = ({ restoreFocus = false } = {}) => {
    updateExpandedState(rootElement, triggerElement, false);

    if (restoreFocus) {
      triggerElement.focus();
    }
  };

  const openMenu = ({ focusSelected = true } = {}) => {
    updateExpandedState(rootElement, triggerElement, true);

    if (!focusSelected) {
      return;
    }

    const selectedIndex = optionElements.findIndex(
      (optionElement) => optionElement.getAttribute("aria-selected") === "true"
    );
    focusOption(optionElements, selectedIndex >= 0 ? selectedIndex : 0);
  };

  const selectValue = (nextValue) => {
    const nextOption = optionElements.find(
      (optionElement) => optionElement.dataset.value === nextValue
    );

    if (!nextOption) {
      return;
    }

    const nextLabel = nextOption.textContent?.trim() ?? nextValue;
    rootElement.dataset.selectedValue = nextValue;
    valueElement.textContent = nextLabel;

    optionElements.forEach((optionElement) => {
      const isSelected = optionElement.dataset.value === nextValue;
      optionElement.classList.toggle("is-selected", isSelected);
      optionElement.setAttribute("aria-selected", isSelected ? "true" : "false");
    });

    closeMenu({ restoreFocus: true });
    onChange(nextValue);
  };

  triggerElement.addEventListener(
    "click",
    () => {
      const isOpen = rootElement.classList.contains("is-open");

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    },
    { signal }
  );

  triggerElement.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        openMenu();
      }
    },
    { signal }
  );

  optionElements.forEach((optionElement, index) => {
    optionElement.addEventListener(
      "click",
      () => {
        selectValue(optionElement.dataset.value);
      },
      { signal }
    );

    optionElement.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          focusOption(optionElements, Math.min(index + 1, optionElements.length - 1));
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          if (index === 0) {
            triggerElement.focus();
            return;
          }

          focusOption(optionElements, index - 1);
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectValue(optionElement.dataset.value);
        }

        if (event.key === "Escape") {
          event.preventDefault();
          closeMenu({ restoreFocus: true });
        }

        if (event.key === "Tab") {
          closeMenu();
        }
      },
      { signal }
    );
  });

  document.addEventListener(
    "click",
    (event) => {
      if (!rootElement.contains(event.target)) {
        closeMenu();
      }
    },
    { signal }
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    },
    { signal }
  );

  return () => {
    controller.abort();
  };
}
