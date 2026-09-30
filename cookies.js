(() => {
  const VERSION = 2;
  const COOKIE = "chatzidis_consent";
  const MAX_AGE = 180 * 24 * 60 * 60;
  const banner = document.getElementById("cookie-banner");
  const dialog = document.getElementById("cookie-dialog");
  if (!banner || !dialog) return;
  const analytics = window.chatzidisAnalytics;
  const configured = analytics?.configured === true;
  const provider = configured ? analytics.id : "none";
  const path = new URL(".", document.currentScript.src).pathname;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  // Remove the old domain-root preference when upgrading the project site.
  if (path !== "/") document.cookie = `${COOKIE}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;

  function readChoice() {
    try {
      for (const entry of document.cookie.split(";").map(item => item.trim())) {
        if (!entry.startsWith(`${COOKIE}=`)) continue;
        const value = JSON.parse(decodeURIComponent(entry.slice(COOKIE.length + 1)));
        if (value.version === VERSION && value.provider === provider &&
          ["accepted", "necessary"].includes(value.choice)) return value.choice;
      }
    } catch { /* Malformed or unavailable cookies require a new choice. */ }
    return null;
  }

  if (configured) {
    document.querySelectorAll("[data-analytics-only]").forEach(el => { el.hidden = false; });
    document.querySelectorAll("[data-analytics-label]").forEach(el => { el.textContent = "Optional · Google Analytics 4"; });
    document.querySelectorAll("[data-analytics-description]").forEach(el => {
      el.textContent = "With permission, Google Analytics measures page visits and use of email and phone links. Analytics cookies may last up to 180 days. No analytics loads before you allow it. Declining keeps the site fully available.";
    });
    document.querySelectorAll("[data-decline-label]").forEach(el => { el.textContent = "Decline analytics"; });
  }
  let settingsTrigger;
  document.querySelectorAll("[data-cookie-settings]").forEach(button => {
    button.hidden = false;
    button.addEventListener("click", () => { settingsTrigger = button; dialog.showModal(); });
  });
  dialog.addEventListener("close", () => {
    const target = settingsTrigger?.closest("#cookie-banner") && banner.hidden
      ? document.querySelector("footer [data-cookie-settings]") : settingsTrigger;
    target?.focus({ preventScroll: true });
  });
  document.querySelectorAll("[data-cookie-choice]").forEach(button => {
    button.addEventListener("click", () => {
      const choice = configured ? button.dataset.cookieChoice : "necessary";
      const value = encodeURIComponent(JSON.stringify({ version: VERSION, provider, choice }));
      try { document.cookie = `${COOKIE}=${value}; Max-Age=${MAX_AGE}; Path=${path}; SameSite=Lax${secure}`; } catch { /* Keep the choice for this visit if storage is blocked. */ }
      const fromBanner = banner.contains(button);
      banner.hidden = true;
      if (dialog.open) dialog.close();
      else if (fromBanner) document.querySelector("footer [data-cookie-settings]")?.focus({ preventScroll: true });
      analytics?.setConsent(choice === "accepted");
    });
  });
  new ResizeObserver(() => {
    document.documentElement.style.setProperty("--consent-height", `${banner.getBoundingClientRect().height}px`);
  }).observe(banner);
  const choice = readChoice();
  banner.hidden = !configured || choice !== null;
  analytics?.setConsent(choice === "accepted");
})();
