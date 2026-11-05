# LODESTAR Dashboard Build Notes

Scope: dashboard 1382 (`.dashboards-1382-page`). Nothing here touches `.container`, the header/footer markup, the Bootstrap grid, the trophy case markup or the leaderboard markup.

## 1. Audit and mapping

| Mockup section | Live slot | Source |
|---|---|---|
| `.hero2#overview` | Row 1 · `col-md-12` · widget 10237 | New HTML (`widgets/10237-hero.html`) |
| `.profile2` / `.p2-card` | Row 2 · `col-md-12` · widget 10238 | New HTML (`widgets/10238-profile.html`) |
| `.card.tc2#trophy-case` | Row 3 left · widget 10229 | Platform markup, CSS only |
| `.slate-card.lb-slate#leaderboard` | Row 3 right · widget 10228 | Platform markup, CSS only |
| `.band2-head` | Row 4 · `col-md-12` · widget 10239 | New HTML (`widgets/10239-band-header.html`) |
| `.ls-card.nom-widget` | Row 5 left · `col-md-6` · widget 10240 | New HTML (`widgets/10240-nominate.html`) |
| `.gc-widget` | Row 5 right · `col-md-6` · widget 10241 | New HTML (`widgets/10241-gift-cards.html`) |
| `.site-header` / `.site-footer` | Live header and footer | CSS restyle only, logo swapped with `::before` |

No new widgets or rows are needed.

### Platform HTML restrictions (the build is written for them)
Your Diffchecker comparison shows the widget editor keeps `class`, `id`, `title`, `href`, and `img` `src`/`alt`/`width`/`height`. It removes `role`, every `aria-*`, `loading`, and inline `<svg>`, and adds `fr-fic fr-dii` to images. I also assumed it strips inline `style` (so no `--i` variables), `data-*` and `tabindex`, since those are not confirmed. The widget HTML therefore uses none of them. How each lost feature is handled:
* **Inline SVG icons (arrows, quick-link icons):** now CSS masks. Buttons use the class `ld-btn--arrow`, and quick links use `ql--credits`, `ql--nominate` and `ql--redeem` (My Account is the default icon).
* **ARIA and roles:** cannot be set from HTML here and there is no script, so they are not restored. Visible text, sr-only text and `title` attributes carry the labels instead.
* **`data-gc="…"` brand hooks:** replaced by classes (`gc-amazon`, `gc-target`, …).
* **Inline `--i` stagger:** removed. The hero uses `:nth-child()`, and the scroll-driven reveals don't need it.
* **`fr-fic fr-dii` on images:** the stylesheet's image rules are more specific than the editor's, so they win. Check the rendered icons once.
* **Empty elements:** the anchors and `.gc-arrows` hold `&nbsp;` so the editor keeps them. CSS collapses them.

### Install
See `README.md`. Short version: push this folder to GitHub, serve it with jsDelivr or GitHub Pages, put that base URL in the loader at the top of widget 10237, then paste the five widgets. The widgets contain no scripts; only HTML and CSS are used.

### Assumptions
* Browsers: current Chrome, Safari, Firefox, Edge. Rules use `:has()` (Chrome 105+, Safari 15.4+, Firefox 121+).
* Redemption state: open (winner view). The locked state is not shipped.
* Name, initials and department are the mockup's sample text, marked with HTML comments.
* The platform sets `html{font-size:10px}`, so the stylesheet uses px only.
* Gift-card art is the mockup's own CSS URLs (giftcards.com and cloudfront), kept as given.
* The five value icons use the extracted fallback files in `assets/`, not the lodestar.com hotlinks, and are drawn as CSS backgrounds.

### Conflicts with the existing CSS and how they are handled
* `body{font-family:Poppins!important}` only hits `<body>`, so Figtree is set on the elements inside the page scope. No `!important`.
* `.fa-chevron-*::before{content:…!important}` forces the glyph, so the trophy arrows need a commented `!important` to swap in the masked arrow.
* The header badge rule `color:#fff!important` needs a commented `!important` to recolour the cart and wish-list count.
* Flipster writes inline `width`/`opacity` on `img` and `height/width` on `.flip-items`. These are overridden with commented `!important`.
* `.col-md-6` floats at 992px. For this page only, 993–1140px is forced to stack so it matches the mockup's 1140px breakpoint.
* `.row` has -8px margins and columns have 8px padding. They are zeroed inside the five widgets only.

### Shared band (rows 4 and 5)
Rows 4 and 5 each get a full-bleed `::before` (`width:100vw; left:50%; margin-left:-50vw`) in tan, behind the content. Row 4 also gets an `::after` with the diagonal slate shape (`clip-path`, height `min(420px,56vw)`) and the faint photo. Both are anchored to the top of row 4, so they do not depend on card heights. Row 4 has `margin-top:96px` and row 5 has `padding-bottom:96px`.

### JS decisions

| Mockup behavior | Decision |
|---|---|
| Reveal on scroll | CSS (`animation-timeline:view()` in `@supports`). Other browsers show the content statically. |
| Credit count-up | Dropped: scripts can't run in widgets, so the static number shows (the CSS entrance animation still plays). The JS is in `optional/` if head access is ever possible. |
| ARIA/role/tabindex stripped by the editor | Not restored. `title` attributes carry labels for the journey list, value tiles and gift-card row. |
| Gift-card arrows and disabled state | CSS only: native `::scroll-button()` in Chromium; swipe and a branded scrollbar elsewhere. No JS arrows or disabled state. |
| Hero parallax, scrollspy `.subnav` | Dropped (no such elements) |
| Header dropdowns, burger, language | Platform |
| Trophy carousel and details view | Platform (Flipster state classes styled) |
| Gold/Silver tier switch, demo bar, toast, `data-demo-link` | Demo only, dropped |

## 2. Placeholders to swap

### Images and URLs
Only one URL needs editing: `REPLACE_WITH_REPO_URL` in the loader at the top of `widgets/10237-hero.html` (one line). The CSS finds images relative to itself (`../assets/`), and the widget HTML contains no image URLs (hero and value icons are CSS backgrounds). Keep the repo folders `css/`, `js/` and `assets/` as they are.

The logo is the white version only. It reads on the slate header and footer, so no dark variant is needed.

### Links

| Placeholder | Where used |
|---|---|
| `/placeholder/nomination-page` | Hero button (10237), "Nominate" quick link (10238), five value tiles and the button (10240) |
| `/placeholder/my-account` | "My Account" quick link (10238) |
| `/placeholder/credit-ledger` | "My Credits" quick link (10238) |
| `/gallery` | "View All" and "Go to the redemption gallery" (10241) |
| `#overview`, `#nominate`, `#trophy-case`, `#leaderboard`, `#gift-cards` | Real in-page anchors, keep |

`/placeholder/trophy-case` is not used because the mockup has no link to it.

### Template tags and dynamic data
* `%CREDIT_BALANCE%` is in 10238 with the "Credits" label outside the tag. The tag's `col-xs-12` output is neutralised and styled as `.cw-num`.
* Sample text to swap for real tags: "AC", "Alex Chen", "Claims Operations" (10238).

## 3. Fidelity report

* **Not visually verified.** The sandbox has no usable browser, so I could not render the page or compare it to the mockup. I checked brace/paren balance, JS syntax, and that every widget class exists in the stylesheet. Please review on the live page.
* **Leaderboard title.** The live title stays "Badge Leaders", and CSS cannot change the text. The "Standing" eyebrow is a `::before` on `.panel-body`. Proposed fix: rename the widget title in the platform to "Trophy leaderboard".
* **Trophy case.** "Earned" and "Your trophy case" are pseudo-elements, as in the mockup. The state classes do not need `--d`, so no rule depends on it. If the live carousel shows a motion the mockup doesn't (for example 3D tilt), it comes from the platform script.
* **Snapshot inline styles.** The `background-image:var(--sf-img-*)` and `!important` background declarations on badge images are SingleFile artifacts and are not reproduced. The `width` and `opacity` inline styles may be real, so they are overridden with a commented `!important`.
* **`#leaderboard` anchor.** The trophy case and leaderboard have GUID ids, so both anchors sit at the end of widget 10238. On desktop this lands correctly. When the columns stack (≤1140px), `#leaderboard` lands on the trophy case card above it. Alternative: link to the platform ids (`#e1fb0b1d-0015-cc1c-490b-5360749e28df` for the trophy case, `#b6d3bd3b-ed8c-6c5d-51b8-36c0a0ca32ff` for the leaderboard). Those come from the snapshot and may differ on the live page.
* **Header.** The live hamburger is always visible, and the text menus (Dashboards, Language, the gallery link) hide at ≤1160px to follow the mockup. The platform's own breakpoints (992, 768, 480) still control its mobile header. The menu markup is unchanged. The sidebar navigation's inner markup is not in the snapshot, so its styling is best effort.
* **Logo swap.** A `::before` draws the logo and the original `img` is visually hidden, not removed, so the link and alt text stay. Print stylesheets may drop CSS backgrounds, and the logo disappears if the hosted URL fails.
* **Reveal on scroll.** It uses `animation-timeline:view()` (Chromium 115+, Safari 26). Firefox shows the content without the motion. The hero uses time-based entrance animation instead.
* **Leaderboard row stagger.** `--i` is generated with `:nth-child()` (rows 1–10, then 10 for later rows).
* **Gift-card art.** The faces use the mockup's remote images. Hosting them is safer if those hosts block hotlinking.
* **Accessibility without ARIA.** The regions, carousel role and `tabindex` are missing. The sr-only text on gift cards, visible text and `title` attributes remain. Chromium and Firefox make scrollable areas keyboard-focusable on their own.
* **Focus ring.** The mockup's focus-visible rule also changes `border-radius`. I kept only the outline, because the radius change would reshape round elements on focus.
