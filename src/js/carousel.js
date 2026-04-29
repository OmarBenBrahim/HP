import { createFragment } from "./dom-helpers.js";
import { renderTemplate } from "./template-engine.js";

export class CarouselController {
  constructor({
    container,
    template,
    offers,
    productId,
    eventTracker,
    mapOfferForTemplate
  }) {
    this.container = container;
    this.template = template;
    this.offers = offers;
    this.productId = productId;
    this.eventTracker = eventTracker;
    this.mapOfferForTemplate = mapOfferForTemplate;
    this.activeIndex = 0;
    this.rotationTimerId = null;
  }

  render() {
    const slidesHtml = this.offers
      .map((offer, index) => {
        const slideMarkup = renderTemplate(
          this.template,
          this.mapOfferForTemplate(offer)
        );
        const activeClass = index === this.activeIndex ? " is-active" : "";
        return `<div class="carousel__slide${activeClass}" data-slide-index="${index}">${slideMarkup}</div>`;
      })
      .join("");

    const controlsHidden = this.offers.length <= 1 ? " hidden" : "";
    const carouselHtml = `
      <div class="carousel">
        <div class="carousel__track">${slidesHtml}</div>
        <div class="carousel__controls"${controlsHidden}>
          <button class="carousel__control js-carousel-previous" type="button" aria-label="Previous offer"${controlsHidden}>
            <span class="carousel__control-icon carousel__control-icon--previous" aria-hidden="true"></span>
          </button>
          <button class="carousel__control js-carousel-next" type="button" aria-label="Next offer"${controlsHidden}>
            <span class="carousel__control-icon carousel__control-icon--next" aria-hidden="true"></span>
          </button>
        </div>
      </div>
    `;

    this.container.innerHTML = "";
    this.container.append(createFragment(carouselHtml));

    this.trackActiveSlide();
    this.bindTileTracking();
    this.attachHandlers();
    this.startRotation();
  }

  attachHandlers() {
    const previousButton = this.container.querySelector(".js-carousel-previous");
    const nextButton = this.container.querySelector(".js-carousel-next");

    if (!previousButton || !nextButton) {
      return;
    }

    previousButton.addEventListener("click", () => this.showPreviousSlide());
    nextButton.addEventListener("click", () => this.showNextSlide());
  }

  bindTileTracking() {
    this.container.querySelectorAll(".js-track-tile").forEach((tileElement) => {
      this.eventTracker.bindInteractiveTile(tileElement, this.productId);
    });
  }

  showPreviousSlide() {
    this.activeIndex =
      (this.activeIndex - 1 + this.offers.length) % this.offers.length;
    this.updateVisibleSlide();
  }

  showNextSlide() {
    this.activeIndex = (this.activeIndex + 1) % this.offers.length;
    this.updateVisibleSlide();
  }

  updateVisibleSlide() {
    this.container.querySelectorAll(".carousel__slide").forEach((slideElement) => {
      const slideIndex = Number(slideElement.dataset.slideIndex);
      slideElement.classList.toggle("is-active", slideIndex === this.activeIndex);
    });

    this.trackActiveSlide();
    this.restartRotation();
  }

  trackActiveSlide() {
    const activeOffer = this.offers[this.activeIndex];

    if (!activeOffer) {
      return;
    }

    this.eventTracker.trackOfferDisplayed({
      offerId: activeOffer.id,
      componentType: "carousel",
      productId: this.productId
    });
  }

  startRotation() {
    if (this.offers.length <= 1) {
      return;
    }

    this.rotationTimerId = window.setInterval(() => {
      this.showNextSlide();
    }, 5000);
  }

  restartRotation() {
    if (!this.rotationTimerId) {
      return;
    }

    window.clearInterval(this.rotationTimerId);
    this.startRotation();
  }

  destroy() {
    if (this.rotationTimerId) {
      window.clearInterval(this.rotationTimerId);
      this.rotationTimerId = null;
    }
  }
}
