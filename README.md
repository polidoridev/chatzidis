# Chatzidis

Static website for Chatzidis Greek extra virgin olive oil, by Golden Roots Global LLC.

## Local preview

Run `python3 -m http.server 5173` and open http://localhost:5173.

## Publishing

GitHub Pages serves the root of the `main` branch. Push changes to `main` to update the website. All website assets use relative paths so the site works under a GitHub Pages project URL.

## Files

- `index.html`: website content and product collection
- `styles.css`: desktop and mobile styling
- `main.js`: scroll-driven pour animation
- `cookies.js`: privacy preference controls
- `assets/`: optimized images, animation frames, and certificate PDFs

The website currently uses no analytics or advertising cookies. Before introducing optional services, implement consent gating and increment the consent version in `cookies.js`.
