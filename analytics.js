(() => {
  const id = window.CHATZIDIS_CONFIG?.ga4MeasurementId || "";
  const configured = /^G-[A-Z0-9]+$/.test(id);
  let active = false;
  let loaded = false;
  const basePath = new URL(".", document.currentScript.src).pathname;

  function clearAnalyticsCookies() {
    const names = document.cookie.split(";").map(item => item.trim().split("=")[0])
      .filter(name => name === "_ga" || name.startsWith("_ga_"));
    const host = location.hostname;
    for (const name of names) for (const path of new Set(["/", basePath])) {
      for (const domain of ["", `; Domain=${host}`, `; Domain=.${host}`]) {
        document.cookie = `${name}=; Max-Age=0; Path=${path}${domain}; SameSite=Lax`;
      }
    }
  }

  function setConsent(allowed) {
    if (!configured) return;
    active = Boolean(allowed);
    window[`ga-disable-${id}`] = !active;
    if (!active) {
      clearAnalyticsCookies();
      // A reload after withdrawal removes the already-loaded Google script and timers.
      if (loaded) location.reload();
      return;
    }
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      analytics_storage: "denied", ad_storage: "denied",
      ad_user_data: "denied", ad_personalization: "denied",
    });
    window.gtag("consent", "update", { analytics_storage: "granted" });
    window.gtag("js", new Date());
    // No URL queries, fragments, message contents or contact details are sent.
    const pageLocation = location.origin + location.pathname;
    let referrer = "";
    try { referrer = document.referrer ? new URL(document.referrer).origin : ""; } catch { /* Ignore invalid referrers. */ }
    window.gtag("config", id, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_domain: "none",
      cookie_path: basePath,
      cookie_expires: 180 * 24 * 60 * 60,
      cookie_update: false,
      page_location: pageLocation,
      page_referrer: referrer,
    });
    window.gtag("event", "page_view", { page_location: pageLocation, page_referrer: referrer });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    script.id = "google-analytics-tag";
    document.head.append(script);
  }

  window.chatzidisAnalytics = Object.freeze({ configured, id, setConsent });
  document.addEventListener("click", event => {
    if (!active || typeof window.gtag !== "function") return;
    const link = event.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href");
    const method = href.startsWith("mailto:") ? "email" : href.startsWith("tel:") ? "phone" : null;
    if (method) window.gtag("event", "contact_click", { contact_method: method });
  });
})();
