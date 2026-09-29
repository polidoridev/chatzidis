(() => {
  // Bump the version and implement consent gating before adding optional services.
  const VERSION = 1;
  const COOKIE = "chatzidis_consent";
  const MAX_AGE = 180 * 24 * 60 * 60;
  const banner = document.getElementById("cookie-banner");
  const dialog = document.getElementById("cookie-dialog");

  function readChoice() {
    try {
      const entry = document.cookie.split(";").map(item => item.trim())
        .find(item => item.startsWith(`${COOKIE}=`));
      if (!entry) return null;
      const value = JSON.parse(decodeURIComponent(entry.slice(COOKIE.length + 1)));
      return value.version === VERSION && ["accepted", "necessary"].includes(value.choice)
        ? value.choice : null;
    } catch {
      return null;
    }
  }

  let settingsTrigger;
  document.querySelectorAll("[data-cookie-settings]").forEach(button => {
    button.hidden = false;
    button.addEventListener("click", () => {
      settingsTrigger = button;
      dialog.showModal();
    });
  });

  dialog.addEventListener("close", () => {
    const target = settingsTrigger?.closest("#cookie-banner") && banner.hidden
      ? document.querySelector("footer [data-cookie-settings]") : settingsTrigger;
    target?.focus({ preventScroll: true });
  });

  document.querySelectorAll("[data-cookie-choice]").forEach(button => {
    button.addEventListener("click", () => {
      const value = encodeURIComponent(JSON.stringify({
        version: VERSION, choice: button.dataset.cookieChoice,
      }));
      try {
        document.cookie = `${COOKIE}=${value}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
      } catch {
        // The site still works if the visitor blocks storage; hide for this visit.
      }
      const fromBanner = banner.contains(button);
      banner.hidden = true;
      if (dialog.open) dialog.close();
      else if (fromBanner) document.querySelector("footer [data-cookie-settings]").focus({ preventScroll: true });
    });
  });

  banner.hidden = readChoice() !== null;
})();
