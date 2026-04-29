function createEventLogItem(payload) {
  const item = document.createElement("li");
  item.className = "event-log__item";
  item.innerHTML = `
    <p class="event-log__event-type">${payload.type}</p>
    <p class="event-log__event-meta">
      offerId: ${payload.offerId ?? "n/a"} | component: ${payload.componentType ?? "n/a"} |
      product: ${payload.productId ?? "n/a"} | source: ${payload.source ?? "render"} |
      timestamp: ${payload.timestamp}
    </p>
  `;
  return item;
}

export class EventTracker {
  constructor(logListElement) {
    this.logListElement = logListElement;
    this.currentProductId = "";
    this.displayedKeys = new Set();
    this.focusedKeys = new Set();
    this.clickHandlers = new WeakMap();
    this.focusHandlers = new WeakMap();
    this.observedTiles = new Set();
    this.hasUserScrolled = false;
    this.onScroll = this.handleUserScroll.bind(this);
    this.intersectionObserver = new IntersectionObserver(
      (entries) => this.handleIntersections(entries),
      {
        threshold: 0.5
      }
    );

    window.addEventListener("scroll", this.onScroll, { passive: true });
  }

  beginProductRender(productId) {
    this.currentProductId = productId;
    this.displayedKeys.clear();
    this.focusedKeys.clear();
    this.intersectionObserver.disconnect();
    this.observedTiles.clear();
  }

  handleUserScroll() {
    this.hasUserScrolled = true;
  }

  logEvent(payload) {
    const eventPayload = {
      ...payload,
      productId: payload.productId ?? this.currentProductId,
      timestamp: new Date().toISOString()
    };

    console.log(eventPayload);
    this.logListElement.prepend(createEventLogItem(eventPayload));
  }

  trackOfferDisplayed({ offerId, componentType, productId }) {
    const key = `${productId}:${componentType}:${offerId}:displayed`;

    if (this.displayedKeys.has(key)) {
      return;
    }

    this.displayedKeys.add(key);
    this.logEvent({
      type: "offer_displayed",
      offerId,
      componentType,
      productId
    });
  }

  trackTileFocus({ offerId, componentType, productId, source }) {
    const key = `${productId}:${componentType}:${offerId}:focus:${source}`;

    if (this.focusedKeys.has(key)) {
      return;
    }

    this.focusedKeys.add(key);
    this.logEvent({
      type: "tile_in_focus",
      offerId,
      componentType,
      productId,
      source
    });
  }

  bindInteractiveTile(tileElement, productId) {
    const offerId = tileElement.dataset.offerId;
    const componentType = tileElement.dataset.componentType;

    if (!offerId || !componentType) {
      return;
    }

    const focusHandler = () => {
      this.trackTileFocus({
        offerId,
        componentType,
        productId,
        source: "keyboard"
      });
    };

    tileElement.addEventListener("focusin", focusHandler);
    this.focusHandlers.set(tileElement, focusHandler);
    this.intersectionObserver.observe(tileElement);
    this.observedTiles.add(tileElement);

    tileElement
      .querySelectorAll("[data-track-click='true']")
      .forEach((targetElement) => {
        const clickHandler = () => {
          this.logEvent({
            type: "offer_clicked",
            offerId,
            componentType,
            productId,
            source: "button"
          });
        };

        targetElement.addEventListener("click", clickHandler);
        this.clickHandlers.set(targetElement, clickHandler);
      });
  }

  handleIntersections(entries) {
    if (!this.hasUserScrolled) {
      return;
    }

    for (const entry of entries) {
      if (!entry.isIntersecting) {
        continue;
      }

      const offerId = entry.target.dataset.offerId;
      const componentType = entry.target.dataset.componentType;

      if (!offerId || !componentType) {
        continue;
      }

      this.trackTileFocus({
        offerId,
        componentType,
        productId: this.currentProductId,
        source: "viewport"
      });
    }
  }
}
