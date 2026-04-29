export async function loadOfferConfig() {
  const response = await fetch("./data/offers.json");

  if (!response.ok) {
    throw new Error(`Unable to load offer config: ${response.status}`);
  }

  const config = await response.json();

  if (!config?.html || !Array.isArray(config?.products) || !config.products.length) {
    throw new Error("Offer config is missing templates or products.");
  }

  return config;
}
