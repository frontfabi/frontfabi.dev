type EventParameters = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: string, target: string, parameters?: EventParameters) => void;
  }
}

export function trackEvent(name: string, parameters?: EventParameters) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, parameters);
}
