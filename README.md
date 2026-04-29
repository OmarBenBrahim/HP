# HP Offer Tiles Simulator

Static frontend implementation of the HP offer-tile simulator exercise using semantic HTML, plain CSS, and native JavaScript.


## Run locally

Because the app loads `data/offers.json` with `fetch`, serve the folder with a local static server instead of opening `index.html` directly.

Examples:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Rendering approach

- `data/offers.json` is the single content source.
- The `html` object inside `offers.json` stores the HTML templates for the product summary, tiles, and sticky footer.
- The `products` array stores the serial-number-specific content injected into those templates.
- Native JavaScript loads the JSON, interpolates the templates, and injects the rendered markup into the page.
- Changing the selector re-renders the selected product summary, offers, banner, and sticky footer.
- No framework or build step is required.

## Project structure

```text
.
├── assets/
│   ├── banner_offer_printer.webp
│   ├── carousel_arrow_left.svg
│   ├── carousel_arrow_right.svg
│   ├── close_icon.svg
│   ├── hp_care_pack_logo.webp
│   ├── product_summary_printer.webp
│   ├── sku_offer_printer.webp
│   └── small_offer_printer_photo.webp
├── data/
│   └── offers.json
├── src/
│   ├── css/
│   └── js/
├── index.html
└── README.md
```

## Component system

Implemented components:

- selector
- primary button
- secondary button
- carousel tile
- small offer tile
- small SKU/product offer tile
- banner tile
- sticky footer
- event log

## Event schema

The app logs events to both the browser console and the on-page event log.

### `offer_displayed`

Triggered when an offer is rendered into view. Initial render and product changes create fresh impressions, with per-render deduping to avoid repeated entries for the same tile.

```json
{
  "type": "offer_displayed",
  "offerId": "banner-offer-1",
  "componentType": "banner",
  "productId": "5CD9396KWX",
  "timestamp": "2026-04-27T00:00:00.000Z"
}
```

### `offer_clicked`

Triggered when an offer CTA is clicked.

```json
{
  "type": "offer_clicked",
  "offerId": "sku-offer-1",
  "componentType": "sku-offer",
  "productId": "5CD9396KWX",
  "source": "button",
  "timestamp": "2026-04-27T00:00:00.000Z"
}
```

### `tile_in_focus`

Triggered when a tile receives keyboard focus or newly enters the viewport after a user scroll. Tiles that are already visible on first page load do not create viewport-focus log noise.

```json
{
  "type": "tile_in_focus",
  "offerId": "small-offer-1",
  "componentType": "small-offer",
  "productId": "5CD9396KWX",
  "source": "viewport",
  "timestamp": "2026-04-27T00:00:00.000Z"
}
```

## Image handling notes

- The supplied local image assets are stored in `assets/`.
- Image paths and alt text come from `data/offers.json`, so changing an asset does not require JavaScript changes.
- Raster assets are WebP for smaller file sizes and better runtime performance.
