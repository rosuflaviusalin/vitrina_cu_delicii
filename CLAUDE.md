# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A mobile-first web menu for **Vitrina cu Delicii**, a family pastry shop and fast-food place at Str. 1 Decembrie 1918 nr. 49, Oravița (Caraș-Severin). It is housed in a nearly 200-year-old Austro-Hungarian building with a hand-carved wooden door and shop window. Customers scan a QR code, browse three menus (Patiserie, Fast-food, Băuturi), build an order in a cart, and send it as a pre-filled WhatsApp message to the shop's number (0731 306 015). There is no backend: an order exists only as that WhatsApp message.

Most visitors use a phone, and the site must work on every phone, including old iPhones (pre-iOS 15.4, which lack `<dialog>`) and the in-app browsers of Facebook and Instagram. It must stay hostable for free on a static host (Netlify, Vercel or GitHub Pages).

The owner specified the WhatsApp message format. Keep it exactly like this (`×` directly after the number, en dash `–` before the price):

```
Comandă nouă:
2× Pizza slice – 14 lei
1× Covrig cu brânză – 4 lei
Total: 18 lei
Ridicare: pauza mare
Nume: Popescu
Prenume: Andrei
```

An `Observații: …` line is appended only when the customer fills in the optional notes field. When an offer applies, extra lines go right before `Total:`: `1× Gogoașă Oreo gratuit, oferta 5+1 – −5 lei` for each free item, or `Reducere de vineri inclusă: jumătate de preț, fără băuturi și fără meniul mini sandviș + suc` on Friday (the item lines then already show the halved prices).

Two offers, set by the owner:
- **Vinerea dulce:** on Fridays from 11:00 Romanian time (`Europe/Bucharest`, not the phone's time zone), everything except drinks and items marked `offers: false` (the 11,99 lei sandwich + drink combo) is half price. The time the order is sent decides. Each unit price is halved and rounded to 0.50 lei (5,5 → 3).
- **5+1:** for every 6 products of the same `family` (6 covrigi, 6 burgeri…), the cheapest is free. Families are narrow on purpose, so 5 covrigi never earn a cake. Drinks are excluded.
- The offers never stack: on Friday from 11:00 only the half price applies.

All user-facing copy is Romanian, with correct diacritics (ă, â, î, ș, ț — comma-below, not cedilla) and formal address ("dumneavoastră", "Alegeți"). Motto: "Gust de neuitat, în inima Oraviței". Some products are frozen, so copy must not claim that everything is fresh, homemade or made each morning. Menu products come from the shop's printed menu. Opening hours: Monday–Friday 07:00–14:30, closed on weekends. Students order by 10:00 and get delivery to the high school during the long break ("pauza mare"); the offers section and the pickup hint say so.

## Workflow rules (from the owner)

- **After every change, commit and push to `develop`** (`git push origin develop`). Do not ask first. Never commit to or push `main`. Netlify deploys `develop` as production, so a push publishes the change to customers. Run the relevant checks before pushing.
- **Always use diacritics in any text added to the app**: menu items, descriptions, labels, messages, errors, alt text, the WhatsApp message and `<title>`/meta tags. Use ă, â, î, ș, ț, with comma-below ș/ț (U+0219/U+021B), never cedilla ş/ţ.
- The owner writes in Romanian. Reply in Romanian.

## Running and testing

Static site, no build step and no dependencies. Opening `index.html` directly works, because the scripts are classic scripts, not ES modules. Serve the folder to test it like it will run in production:

```bash
python3 -m http.server 8765        # then open http://localhost:8765/ and /qr.html
```

There is no test suite in the repo. For browser checks, use the `webapp-testing` skill: Python Playwright plus `.agents/skills/webapp-testing/scripts/with_server.py --server "python3 -m http.server 8765" --port 8765 -- <python script>`. Playwright is not installed globally, so install it into a throwaway venv. Test the phone devices in WebKit (Safari) and Chromium (Android) using `p.devices[...]` (iPhone SE, Pixel 7 and so on) as well as on desktop. To test the send flow, intercept `https://wa.me/**` with `page.route` for touch devices (same-tab navigation) and stub `window.open` for desktop. Then assert on the decoded `text=` parameter. To simulate old iPhones, delete `HTMLDialogElement.prototype.showModal` in an init script.

The live site is https://vitrinacudelicii.ro/ (Netlify, Netlify DNS). `og:image`, `og:url` and `canonical` use absolute URLs on that domain, because Facebook and WhatsApp ignore relative ones. The share image is `assets/img/og-image.jpg` (1200×630, cropped from `vitrina_cu_delicii_2.JPG`).

Deploy by uploading the folder as-is to any static host (Netlify, GitHub Pages, Cloudflare Pages). Then open `/qr.html` on the live site, which pre-fills its own URL, and print the QR card.

## Architecture

- `js/menu.js`: the only file to edit for content. It sets two globals: `window.SHOP` (name, motto, WhatsApp number in international format without `+`, address, Maps query, hours) and `window.MENUS` (menus → groups → items). `SHOP.offers` switches the two offers on or off, and a menu with `offers: false` (Băuturi) is excluded from both. Each item has a unique `id`, which is the cart key, an offer `family` (except drinks), plus `name`, `desc`, `unit`, `price` (lei; usually whole or half lei, e.g. `6.5`, or `11.99`; non-integer prices show two decimals with a comma: „6,50”, „11,99”) and an optional `tag`. Exception: the address, phone and hours are also written statically in `index.html` (visible markup plus the JSON-LD `Bakery` block in `<head>`), so crawlers and visitors without JavaScript can see them. app.js overwrites the visible copy from `SHOP`, so update both places when this data changes.
- Offers: `pricing()` in app.js is the single place that computes line prices, free items and the total; the menu, cart, bottom bar and WhatsApp message all read from it. A 30-second timer re-renders prices if the page stays open across Friday 11:00. Prices are formatted with `num()`/`lei()` (decimal comma written by hand, so it does not depend on the browser's locale). To test the Friday rule, use `page.clock.install(time=...)` and a non-Romanian `timezone_id`.
- `js/app.js`: an IIFE that renders everything from those globals. Most of `index.html` is empty containers marked with `data-*` hooks that app.js fills, including `data-menus`, the address, hours and the map iframe `src`. Key pieces:
  - The cart is a `Map<id, qty>` persisted to `localStorage` under the key `vitrina-cos-v1`. On load, ids missing from the menu are dropped, so renaming an item's `id` silently empties that line from saved carts.
  - `setQty()` is the single mutation path. It saves the cart, swaps that item's menu control (an "Adaugă" button or a −/+ stepper) and updates the header badge and bottom cart bar. If the cart dialog is open, it re-renders the dialog too.
  - A single delegated click handler on `document` handles the `data-add`, `data-inc`, `data-dec` and `data-remove` buttons, both in the menu and in the cart.
  - The cart is a native `<dialog>` opened with `showModal()`. Where `showModal` is missing, app.js falls back to an `open` attribute, the `.is-fallback` class, a `.cart-backdrop` div and its own Escape handling. app.js also polyfills `Element.prototype.replaceChildren`.
  - The order form has three required fields: `pickup` (free text, e.g. "pauza mare"), `lastname` and `firstname`. A fourth field, `notes`, is optional. `validate()` shows inline errors and focuses the first empty field.
  - `buildMessage()` produces the exact format above. On touch devices (`pointer: coarse`), submit navigates the same tab to `wa.me`, which opens the WhatsApp app and also works in in-app browsers. On desktop it opens a new tab, falling back to same-tab navigation if the pop-up is blocked. Before navigating, submit calls `resetAll()`. It empties the cart (including `localStorage`), resets the form and its errors, closes the dialog, removes the URL hash and jumps to the top. It sets `history.scrollRestoration = "manual"` so that Back from WhatsApp lands on a clean page. Nothing about the customer is stored.
  - The active link in the sticky nav is set with an IntersectionObserver.
- `css/styles.css`: design tokens on `:root`. Colors are taken from the shopfront: walnut and cherry wood, mint facade, mosaic cobalt for prices, and the logo's pink (darkened for contrast) for actions. The fonts are Bodoni Moda for display and Alegreya Sans for body, both from Google Fonts. `--lattice` reproduces the diamond carving on the door pilasters and is reused on the header edge, menu headers, the hero frame, the arched story photo and the cart header. The site is mobile-first, with breakpoints at 760px and 900px. `--header-h` drives `scroll-padding-top` and must change if the sticky header's height changes.
- `qr.html`: a standalone page that generates a printable QR card, using qrcodejs 1.0.0 from cdnjs.
- `assets/img/`: web-ready derivatives. `logo.png` is the original logo with its grey background turned transparent and then cropped. The favicons are cropped from the logo's whisk mark. The `vitrina-N` photos are resized `.webp` files with `.jpg` fallbacks. Originals are in `vitrina_cu_delicii_photos/`; regenerate the derivatives from those originals rather than editing them.

## Project skills

`.claude/skills/*` are symlinks into `.agents/skills/` (pinned in `skills-lock.json`), so edit the files there. Available skills: `frontend-design` (visual direction), `web-design-guidelines` (accessibility/UX review against Vercel's guidelines) and `webapp-testing` (Playwright).
