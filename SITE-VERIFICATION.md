# Site verification — September 30, 2026

## Implemented

- Public Privacy, Terms and FAQ pages, linked throughout the site.
- Immediate collection CTA, persistent order/wholesale contact and native mobile navigation.
- Page-specific titles, descriptions, canonical URLs, Open Graph and Twitter metadata; a 1200 × 630 social image and native share/copy action.
- SVG/ICO favicon, Apple touch icon, XML sitemap, robots file and custom 404 with working nested-path asset links.
- GA4 property `G-9MNBL3M42P`, blocked until affirmative consent; page views and email/phone contact events, with consent withdrawal and preference persistence.
- Descriptive image alternatives, decorative-image treatment, keyboard navigation, focus indicators, skip link, semantic headings, table caption and header scopes, adequate text contrast, and reduced-motion support.
- Responsive product thumbnails, optimized on-demand animation frames, lazy-loaded below-fold photography and self-hosted fonts with included licences.

## Validation

- Local checker: **5 HTML pages, 235 local references, 56 distinct resources**, sitemap and metadata passed. All **58 checked resource and external policy URLs** returned HTTP 200.
- Chromium: homepage, FAQ, Privacy, Terms and nested missing route at **320, 390, 768 and 1440 px**. No horizontal overflow; one H1 per page; every image has an alt attribute.
- Home reflow also checked at **720 CSS pixels**, the effective viewport of a 1440-pixel desktop at 200% browser zoom. This is a viewport-equivalent check, not a claim of testing every browser’s zoom implementation.
- axe-core WCAG 2 A/AA and WCAG 2.1 AA scans: **0 violations** on all five routes at desktop and mobile widths after fixes.
- Keyboard checks: native mobile menu, Escape and focus return; FAQ expansion; skip link; cookie dialog and its close form.
- Email and telephone contact links validated with external navigation prevented. There is **no enquiry submission form**, as requested; no test email or telephone call was sent.
- Consent checks: no tag or collection request before permission or after rejection; choice persists between pages; acceptance loads the correct property once; withdrawal removes accessible analytics cookies and reloads without the tag.
- The real Google tag was loaded for an integration check, and its collection requests were intercepted before transmission. Requests targeted the supplied property and omitted test URL query data. Test hits were not sent to the property.
- Reduced-motion and JavaScript-disabled visits show readable content, a static hero and working native mobile navigation.
- Custom 404 returned HTTP 404 with the expected page and correct assets on a nested unknown path in the preview server.
- JavaScript syntax and `git diff --check` passed; browser interaction checks found no uncaught page errors.

## Performance sample

Lighthouse mobile, local production files with simulated mobile throttling, before analytics consent:

| Measure | Result |
| --- | --- |
| Performance | 94 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| Largest Contentful Paint | 2.7 s |
| Cumulative Layout Shift | 0.036 |
| Total Blocking Time | 0 ms |
| Initial transfer | 310 KiB |

The old hero preloaded roughly 29 MB of frames. The new hero initially requests only its first optimized frame (about 36 KB on mobile), then requests nearby frames as the visitor scrolls. Remaining content images are lazy-loaded. These are lab measurements, not real-user Core Web Vitals; networks, devices and consent choices affect results.

## Limits and follow-up configuration

- Automated accessibility and keyboard checks are not a full WCAG certification or a manual VoiceOver/NVDA audit. PDFs retain their source-document accessibility.
- A concurrent remote commit added the custom domain `chatzidisglobal.com`. Its CNAME was preserved, and canonical URLs, social URLs, sitemap, robots, sharing and 404 paths were migrated to the domain root. The sitemap can be submitted directly to Search Console.
- GA4 reporting retention, enhanced-measurement settings and marking `contact_click` as a key event require access to the Analytics account. They are not controlled by these source files.
- Static hosting controls cache headers; GitHub Pages applies its own caching policy.
