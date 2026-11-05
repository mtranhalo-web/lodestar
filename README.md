# LODESTAR Rewards Dashboard (dashboard 1382)

Everything the page needs, in one repo. On TVR you only paste the five HTML widgets (HTML and CSS only, no scripts). The stylesheet and images load from GitHub.

```
css/lodestar-dashboard.css   stylesheet (imports Figtree, reads images from ../assets/)
optional/lodestar-dashboard.js  NOT used. Widgets can't run scripts; kept only in case you get head access later
assets/                      13 images (3 photos, white logo, 4 hero icons, 5 value icons)
widgets/                     the five TVR HTML widgets (10237 to 10241)
BUILD-NOTES.md               audit, placeholders, fidelity report
```

## 1. Put it on GitHub
1. Create a **public** repo and upload the contents of this folder (keep the `css/` and `assets/` folders exactly as they are, because the CSS finds images with `../assets/`).
2. Pick one way to serve it:
   * **jsDelivr (no setup):** base URL is `https://cdn.jsdelivr.net/gh/YOUR-USER/YOUR-REPO@v1`. Create a release or tag called `v1` first. A tag keeps the files cached and stable, and a new tag (`v2`) is how you ship updates.
   * **GitHub Pages:** Settings > Pages > deploy from the `main` branch root. Base URL is `https://YOUR-USER.github.io/YOUR-REPO`.
   * Do **not** use `raw.githubusercontent.com`. It sends files as plain text, so browsers refuse to apply the CSS and JS.
3. Check the stylesheet opens in a browser at `BASE/css/lodestar-dashboard.css`, and an image at `BASE/assets/hero-sky-photo.jpg`.

## 2. Set the base URL (one edit)
Open `widgets/10237-hero.html` and replace `REPLACE_WITH_REPO_URL` (one place, no trailing slash) with your base URL.

## 3. Paste the widgets on TVR
| Widget | Row / column | File |
|---|---|---|
| 10237 | Row 1, col-md-12 | `widgets/10237-hero.html` (contains the loader) |
| 10238 | Row 2, col-md-12 | `widgets/10238-profile.html` |
| 10239 | Row 4, col-md-12 | `widgets/10239-band-header.html` |
| 10240 | Row 5, col-md-6 left | `widgets/10240-nominate.html` |
| 10241 | Row 5, col-md-6 right | `widgets/10241-gift-cards.html` |

Replace the "Placeholder links" in the widgets when you have the real pages: `/placeholder/nomination-page`, `/placeholder/my-account`, `/placeholder/credit-ledger` (`/gallery` is real). The name, initials and department in 10238 are sample text.

## What to check after pasting (I could not test these on TVR)
* **The `<link>` may be stripped.** The widget editor removes some tags. If the page is unstyled, the editor removed the `<link>`. Try replacing that line with `<style>@import url("BASE/css/lodestar-dashboard.css");</style>`. If both are stripped, the stylesheet has to be added another way (the platform's CSS upload).
* **What you lose without scripts:** the credit number appears without the count-up, and the ARIA labels the editor strips are not restored (the `title` attributes and visible text remain). The gift-card row scrolls and snaps by swipe or trackpad. Chromium shows native arrow buttons, and other browsers show a branded scrollbar instead of arrows.
* Load order: the stylesheet must come after the platform CSS to win. It does when loaded from the body.
