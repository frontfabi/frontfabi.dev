"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Consent = "granted" | "denied" | "unknown";

const consentKey = "frontfabi-analytics-consent";
const gaId = process.env.NEXT_PUBLIC_GA_ID;

export default function Analytics() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedConsent = window.localStorage.getItem(consentKey);
    setConsent(storedConsent === "granted" || storedConsent === "denied" ? storedConsent : "unknown");
  }, []);

  useEffect(() => {
    if (!loaded || !pathname) return;
    window.gtag?.("event", "page_view", {
      page_path: pathname,
    });
  }, [loaded, pathname]);

  if (!gaId || consent === null) return null;

  const saveConsent = (value: Extract<Consent, "granted" | "denied">) => {
    window.localStorage.setItem(consentKey, value);
    setConsent(value);
  };

  return (
    <>
      {consent === "granted" && (
        <>
          <Script id="ga-bootstrap" strategy="afterInteractive">
            {"window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};"}
          </Script>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
            onLoad={() => {
              window.gtag?.("js", new Date().toISOString());
              window.gtag?.("config", gaId, { send_page_view: false });
              setLoaded(true);
            }}
          />
        </>
      )}
      {consent === "unknown" && (
        <aside className="analytics-consent" aria-label="Preferências de privacidade">
          <p>Usamos métricas anônimas para entender como o portfólio é usado.</p>
          <div>
            <button onClick={() => saveConsent("denied")}>recusar</button>
            <button onClick={() => saveConsent("granted")}>aceitar</button>
          </div>
        </aside>
      )}
    </>
  );
}
