import {
  createDetailsHtml,
  createFragment,
  createOptionsHtml,
  getRequiredElement,
  limitText
} from "./dom-helpers.js";
import { renderTemplate } from "./template-engine.js";
import { CarouselController } from "./carousel.js";
import { renderStickyFooter } from "./sticky-footer.js";
import { attachSelectorHandlers } from "./selector.js";

function mapCarouselOffer(offer) {
  return {
    ...offer,
    title: limitText(offer.title, 35),
    description: limitText(offer.description, 120),
    button: {
      ...offer.button,
      label: limitText(offer.button.label, 30)
    }
  };
}

function mapSmallOffer(offer) {
  return {
    ...offer,
    title: limitText(offer.title, 25),
    description: limitText(offer.description, 75),
    button: {
      ...offer.button,
      label: limitText(offer.button.label, 20)
    }
  };
}

function mapSkuOffer(offer) {
  return {
    ...offer,
    description: limitText(offer.description, 75),
    pill: {
      ...offer.pill,
      label: limitText(offer.pill.label, 25)
    },
    button: {
      ...offer.button,
      label: limitText(offer.button.label, 20)
    }
  };
}

function mapBannerOffer(offer) {
  return {
    ...offer,
    title: limitText(offer.title, 35),
    description: limitText(offer.description, 100),
    button: {
      ...offer.button,
      label: limitText(offer.button.label, 30)
    }
  };
}

function renderSingleTile(containerElement, template, data) {
  containerElement.innerHTML = "";
  containerElement.append(createFragment(renderTemplate(template, data)));
}

export class AppRenderer {
  constructor({ config, eventTracker }) {
    this.config = config;
    this.eventTracker = eventTracker;
    this.currentProductId = config.products[0].id;
    this.carouselController = null;
    this.selectorCleanup = null;

    this.productSummaryElement = getRequiredElement("#product-summary");
    this.promotionsSectionElement = getRequiredElement("#promotions-section");
    this.recommendationsSectionElement = getRequiredElement(
      "#recommendations-section"
    );
    this.stickyFooterRoot = getRequiredElement("#sticky-footer-root");
  }

  render() {
    this.renderProduct(this.currentProductId);
  }

  renderProduct(productId) {
    const product = this.config.products.find((item) => item.id === productId);

    if (!product) {
      throw new Error(`Unknown product: ${productId}`);
    }

    this.currentProductId = productId;
    this.eventTracker.beginProductRender(productId);

    if (this.carouselController) {
      this.carouselController.destroy();
      this.carouselController = null;
    }

    if (this.selectorCleanup) {
      this.selectorCleanup();
      this.selectorCleanup = null;
    }

    this.renderProductSummary(product);
    this.renderPromotionsSection(product);
    this.renderRecommendationsSection(product);
    this.renderStickyFooter(product);
  }

  renderProductSummary(product) {
    const selectorOptions = this.config.products.map((item) => ({
      id: item.id,
      label: item.id
    }));

    const template = this.config.html.productSummary;
    const html = renderTemplate(template, {
      ...product.productSummary,
      selectedSerial: product.id,
      selectorOptionsHtml: createOptionsHtml(selectorOptions, product.id),
      detailsHtml: createDetailsHtml(product.productSummary.details)
    });

    this.productSummaryElement.innerHTML = html;

    const selectorElement = this.productSummaryElement.querySelector(
      ".js-selector"
    );

    this.selectorCleanup = attachSelectorHandlers(selectorElement, (nextProductId) => {
      this.renderProduct(nextProductId);
    });
  }

  renderPromotionsSection(product) {
    this.promotionsSectionElement.innerHTML = `
      <h2 class="offers-section__title" id="promotions-title">${this.config.labels.promotions}</h2>
      <div class="offers-section__promotions-layout">
        <div id="carousel-region"></div>
        <div class="offers-section__side-column">
          <div id="small-offer-region"></div>
          <div id="sku-offer-region"></div>
        </div>
      </div>
    `;

    const carouselRegion = getRequiredElement("#carousel-region", this.promotionsSectionElement);
    const smallOfferRegion = getRequiredElement(
      "#small-offer-region",
      this.promotionsSectionElement
    );
    const skuOfferRegion = getRequiredElement(
      "#sku-offer-region",
      this.promotionsSectionElement
    );

    this.carouselController = new CarouselController({
      container: carouselRegion,
      template: this.config.html.carouselTile,
      offers: product.carouselOffers,
      productId: product.id,
      eventTracker: this.eventTracker,
      mapOfferForTemplate: mapCarouselOffer
    });
    this.carouselController.render();

    renderSingleTile(
      smallOfferRegion,
      this.config.html.smallOfferTile,
      mapSmallOffer(product.smallOfferTile)
    );

    renderSingleTile(
      skuOfferRegion,
      this.config.html.skuOfferTile,
      mapSkuOffer(product.skuOfferTile)
    );

    this.eventTracker.bindInteractiveTile(
      getRequiredElement(".js-track-tile", smallOfferRegion),
      product.id
    );
    this.eventTracker.bindInteractiveTile(
      getRequiredElement(".js-track-tile", skuOfferRegion),
      product.id
    );
    this.eventTracker.trackOfferDisplayed({
      offerId: product.smallOfferTile.id,
      componentType: "small-offer",
      productId: product.id
    });
    this.eventTracker.trackOfferDisplayed({
      offerId: product.skuOfferTile.id,
      componentType: "sku-offer",
      productId: product.id
    });
  }

  renderRecommendationsSection(product) {
    this.recommendationsSectionElement.innerHTML = `
      <h2 class="offers-section__title" id="recommendations-title">${this.config.labels.recommendations}</h2>
      <div id="banner-region"></div>
    `;

    const bannerRegion = getRequiredElement(
      "#banner-region",
      this.recommendationsSectionElement
    );

    renderSingleTile(
      bannerRegion,
      this.config.html.bannerTile,
      mapBannerOffer(product.bannerTile)
    );

    this.eventTracker.bindInteractiveTile(
      getRequiredElement(".js-track-tile", bannerRegion),
      product.id
    );
    this.eventTracker.trackOfferDisplayed({
      offerId: product.bannerTile.id,
      componentType: "banner",
      productId: product.id
    });
  }

  renderStickyFooter(product) {
    const footerData = {
      ...product.stickyFooter,
      title: limitText(product.stickyFooter.title, 50),
      button: {
        ...product.stickyFooter.button,
        label: limitText(product.stickyFooter.button.label, 35)
      }
    };

    renderStickyFooter(this.stickyFooterRoot, this.config.html.stickyFooter, footerData);
  }
}
