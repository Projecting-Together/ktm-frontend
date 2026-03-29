import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export async function startMsw() {
  const worker = setupWorker(...handlers);
  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: { url: "/mockServiceWorker.js" },
  });
}
