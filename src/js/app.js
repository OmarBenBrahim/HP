import { loadOfferConfig } from "./data-loader.js";
import { getRequiredElement } from "./dom-helpers.js";
import { EventTracker } from "./event-tracker.js";
import { AppRenderer } from "./renderer.js";

async function startApp() {
  const eventLogList = getRequiredElement("#event-log-list");
  const appRoot = getRequiredElement("#app-root");

  try {
    const config = await loadOfferConfig();
    const eventTracker = new EventTracker(eventLogList);
    const renderer = new AppRenderer({ config, eventTracker });
    renderer.render();
  } catch (error) {
    console.error(error);
    appRoot.innerHTML = `
      <section class="event-log">
        <div class="event-log__header">
          <h1 class="event-log__title">Unable to load the simulator</h1>
          <p class="event-log__caption">Check that the JSON file and local assets are available.</p>
        </div>
      </section>
    `;
  }
}

startApp();
