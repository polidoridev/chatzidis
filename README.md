# Chatzidis

Static website for Chatzidis Greek extra virgin olive oil, by Golden Roots Global LLC.

## Preview and checks

From this repository, run `python3 -m http.server 5173`, then open `http://localhost:5173/`. This preserves the production domain-root paths. A basic Python server does not automatically serve the custom 404 document on unknown routes; GitHub Pages does.

Run `python3 scripts/check-site.py` for local links, anchors, image alt attributes, metadata and sitemap validation. Run `node --check` on the JavaScript files after edits.

## Publishing

GitHub Pages serves the root of `main` at https://chatzidisglobal.com/ through the existing `CNAME` configuration. Push to `main` to publish. Confirm the Pages build and check the live pages after publishing.

## Pages and assets

- `index.html`: product collection, order and wholesale contact, introductory FAQs.
- `faq.html`, `privacy.html`, `terms.html`: public supporting pages.
- `404.html`: custom error page; its base URL keeps assets and home links working for missing nested paths.
- `styles.css`, `fonts.css`, `site.js`: shared styling, locally hosted fonts, mobile navigation and native sharing.
- `scroll.js`: one-time section and photo reveals, with row-aware product and certificate staggering. The hero pause control also pauses section motion; reduced-motion and no-JavaScript visits remain fully readable.
- `main.js`: on-demand hero animation with at most three concurrent image requests and 18 decoded frames in memory. Reduced-motion, data-saving and no-JavaScript visits use the static hero.
- `assets/frames/web/` and `assets/frames/mobile/`: optimized animation frames; full source frames remain in the parent directory.
- `assets/products/thumbs/`: responsive previews; product links still open the full artwork.
- `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `assets/img/social-share.png`: browser and social previews.
- `sitemap.xml`, `robots.txt`: crawling resources. Update `lastmod` when public page content changes.

## Analytics and privacy

`site-config.js` contains the public GA4 measurement ID `G-9MNBL3M42P`. `analytics.js` loads Google’s tag only after consent. It records page views and `contact_click` events with `contact_method` equal to `email` or `phone`. Page locations omit query strings and fragments. Advertising consent stays denied and Google signals are disabled in the tag configuration.

`cookies.js` stores a versioned preference for 180 days, scoped to the site root. The property ID is included so changing accounts requires fresh consent. Withdrawal clears accessible GA cookies and reloads without the tag. Revisit preferences through the footer. Clearing the measurement ID disables analytics. Increment the consent version if optional data uses change.

The site keeps email and phone contact; there is no enquiry form or submission backend. The only form is the native cookie-dialog close control. Check links without sending test enquiries.

Account-side GA4 settings (report retention, enhanced measurement and key-event designation) are managed in Google Analytics, outside this repository. `contact_click` can be marked as a key event there if desired.

## Domain and crawler configuration

The canonical domain is `https://chatzidisglobal.com/`, matching `CNAME`. It appears in all page metadata, the sitemap, `robots.txt`, `site-config.js` and the checker. The custom 404 uses a domain-root base URL. Update these together if the domain changes.

On this custom domain, `robots.txt` is served at the required origin root and advertises `https://chatzidisglobal.com/sitemap.xml`. The sitemap can also be submitted directly in Search Console. If the site is ever moved back to the GitHub project path, review all paths: crawlers do not read a nested `/chatzidis/robots.txt` file, as explained in [Google’s documentation](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt).

GitHub Pages DNS and TLS provisioning are managed by the hosting service. For the apex domain, the registrar should have four `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`; an optional `www` CNAME points to `polidoridev.github.io`. Remove a conflicting URL-forward/parking record for the same host. These values follow [GitHub’s custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). Enable **Enforce HTTPS** in Pages settings once a certificate is ready; canonical URLs already use HTTPS.

## Verification

See `SITE-VERIFICATION.md` for the latest browser, accessibility, consent and performance checks and their limits.
