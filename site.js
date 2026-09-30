(() => {
  const menu = document.querySelector(".mobile-menu");
  if (menu) {
    const summary = menu.querySelector("summary");
    menu.addEventListener("click", event => {
      if (event.target.closest("a")) menu.open = false;
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && menu.open) { menu.open = false; summary.focus(); }
    });
    document.addEventListener("click", event => {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    });
  }
  document.querySelectorAll("[data-share]").forEach(button => {
    button.hidden = false;
    button.addEventListener("click", async () => {
      const status = button.nextElementSibling;
      const url = window.CHATZIDIS_CONFIG.siteUrl;
      try {
        if (navigator.share) await navigator.share({ title: "Chatzidis Greek Olive Oil", url });
        else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url); status.textContent = "Website link copied."; }
        else status.textContent = `Share this link: ${url}`;
      } catch (error) {
        if (error.name !== "AbortError") status.textContent = `Share this link: ${url}`;
      }
    });
  });
})();
