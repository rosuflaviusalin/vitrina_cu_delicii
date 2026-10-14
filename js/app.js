// Logica paginii: afișează meniurile din js/menu.js, ține coșul și trimite comanda pe WhatsApp.
(function () {
  "use strict";

  const SHOP = window.SHOP;
  const MENUS = window.MENUS;
  const STORAGE_KEY = "vitrina-cos-v1";

  if (!Element.prototype.replaceChildren) {
    Element.prototype.replaceChildren = function (...nodes) {
      while (this.firstChild) this.removeChild(this.firstChild);
      this.append(...nodes);
    };
  }

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Index produs după id, ca să găsim rapid numele și prețul.
  const PRODUCTS = new Map();
  MENUS.forEach((menu) =>
    menu.groups.forEach((group) =>
      group.items.forEach((item) => PRODUCTS.set(item.id, { ...item, menu: menu.title, inOffers: menu.offers !== false && item.offers !== false }))
    )
  );

  // 12 → „12”, 2.5 → „2,50”, 11.99 → „11,99”. Virgula o punem noi, nu depindem de limba browserului.
  const num = (n) => {
    const r = Math.round(n * 100) / 100;
    return Number.isInteger(r) ? String(r) : r.toFixed(2).replace(".", ",");
  };
  const lei = (n) => `${num(n)} lei`;
  const produse = (n) => (n === 1 ? "1 produs" : `${n} produse`);

  // ---------- Coș ----------

  const cart = new Map(); // id -> cantitate

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      saved.forEach(([id, qty]) => {
        // Ignorăm produsele care între timp au dispărut din meniu.
        if (PRODUCTS.has(id) && Number.isInteger(qty) && qty > 0) cart.set(id, Math.min(qty, 99));
      });
    } catch (_) { /* stocare indisponibilă: coșul pornește gol */ }
  }

  function saveCart() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...cart])); } catch (_) {}
  }

  function setQty(id, qty) {
    if (qty <= 0) cart.delete(id);
    else cart.set(id, Math.min(qty, 99));
    saveCart();
    updateItemControl(id);
    updateSummary();
    if (cartDialog.open) renderCart();
  }

  const cartCount = () => [...cart.values()].reduce((a, b) => a + b, 0);

  // ---------- Oferte ----------

  const OFFERS = SHOP.offers || {};
  const FRIDAY_FROM_HOUR = 11;
  const BUY = 5; // la 5 produse cumpărate, al 6-lea e gratuit

  // Ziua și ora din Oravița, indiferent de fusul orar al telefonului.
  function shopClock() {
    const now = new Date();
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Bucharest", weekday: "short", hour: "numeric", hourCycle: "h23",
      }).formatToParts(now);
      const get = (type) => parts.find((x) => x.type === type).value;
      const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
      return { day, hour: Number(get("hour")) % 24 };
    } catch (_) {
      return { day: now.getDay(), hour: now.getHours() };
    }
  }

  function isHalfPrice() {
    if (!OFFERS.fridayHalfPrice) return false;
    const { day, hour } = shopClock();
    return day === 5 && hour >= FRIDAY_FROM_HOUR;
  }

  let halfPrice = isHalfPrice();

  // Jumătate de preț, rotunjit la 50 de bani (5,5 lei → 3 lei).
  const unitPrice = (p) => (halfPrice && p.inOffers ? Math.round(p.price) / 2 : p.price);

  // Coșul cu prețurile de acum: liniile, produsele gratuite (5+1) și totalul.
  // Ofertele nu se cumulează: vinerea după 11:00 se aplică doar jumătatea de preț.
  function pricing() {
    const lines = [...cart].map(([id, qty]) => {
      const p = PRODUCTS.get(id);
      const each = unitPrice(p);
      return { id, p, qty, each, sum: each * qty };
    });
    const free = [];   // { p, qty }
    const almost = []; // familiile unde mai lipsește un produs
    if (OFFERS.fivePlusOne && !halfPrice) {
      const families = new Map();
      lines.forEach((l) => {
        if (!l.p.inOffers || !l.p.family) return;
        const units = families.get(l.p.family) || [];
        for (let i = 0; i < l.qty; i++) units.push(l.p);
        families.set(l.p.family, units);
      });
      families.forEach((units, family) => {
        const freeCount = Math.floor(units.length / (BUY + 1));
        if (units.length % (BUY + 1) === BUY) almost.push(family);
        units.sort((a, b) => a.price - b.price).slice(0, freeCount).forEach((p) => {
          const same = free.find((f) => f.p === p);
          if (same) same.qty++;
          else free.push({ p, qty: 1 });
        });
      });
    }
    const subtotal = lines.reduce((sum, l) => sum + l.sum, 0);
    const discount = free.reduce((sum, f) => sum + f.p.price * f.qty, 0);
    return { lines, free, almost, total: subtotal - discount };
  }

  const cartTotal = () => pricing().total;

  // ---------- Meniuri ----------

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else node.setAttribute(k, v);
    }
    children.flat().forEach((c) => c != null && node.append(c));
    return node;
  }

  function renderMenus() {
    const root = $("[data-menus]");
    MENUS.forEach((menu) => {
      const section = el("section", { class: "menu", id: menu.id, "aria-labelledby": `${menu.id}-title` },
        el("header", { class: "menu__head" },
          el("h2", { id: `${menu.id}-title`, text: menu.title }),
          menu.intro ? el("p", { text: menu.intro }) : null
        ),
        el("div", { class: "menu__body" },
          menu.groups.map((group) =>
            el("div", { class: "menu-group" },
              el("h3", { text: group.title }),
              el("ul", { class: "items" }, group.items.map(renderItem))
            )
          )
        )
      );
      root.append(section);
    });
  }

  function renderItem(item) {
    const nameId = `nume-${item.id}`;
    return el("li", { class: "item", "data-item": item.id },
      el("div", { class: "item__name", id: nameId },
        item.name,
        item.tag ? el("span", { class: "item__tag", text: item.tag }) : null
      ),
      item.desc ? el("p", { class: "item__desc", text: item.desc }) : null,
      item.allergens || item.frozen || item.nutrition === "pe ambalaj"
        ? el("p", { class: "item__info" },
            item.allergens && item.allergens.length ? el("span", { text: `Alergeni: ${item.allergens.join(", ")}.` }) : null,
            item.frozen ? el("span", { text: "Produs din produs congelat." }) : null,
            item.nutrition === "pe ambalaj" ? el("span", { text: "Valori nutriționale: pe ambalaj." }) : null
          )
        : null,
      item.nutrition && typeof item.nutrition === "object" ? nutritionTable(item.nutrition) : null,
      el("div", { class: "item__side" },
        el("p", { class: "item__price", "data-price": item.id }),
        el("div", { class: "item__control", "data-control": item.id })
      )
    );
  }

  // Tabel pliabil cu valori nutriționale orientative, la 100 g.
  function nutritionTable(n) {
    const g = (v) => `${Number.isInteger(v) ? v : v.toFixed(1).replace(".", ",")} g`;
    const rows = [
      ["Energie", `${Math.round(n.kcal * 4.184)} kJ / ${n.kcal} kcal`],
      ["Grăsimi", g(n.fat)],
      ["– din care acizi grași saturați", g(n.saturated)],
      ["Glucide", g(n.carbs)],
      ["– din care zaharuri", g(n.sugars)],
      ["Proteine", g(n.protein)],
      ["Sare", g(n.salt)],
    ];
    return el("details", { class: "item__nutrition" },
      el("summary", { text: "Valori nutriționale orientative" }),
      el("table", {},
        el("caption", { text: "La 100 g" }),
        el("tbody", {}, rows.map(([k, v]) => el("tr", {}, el("th", { scope: "row", text: k }), el("td", { text: v }))))
      ),
      el("p", { text: "Valori medii pentru acest tip de produs, nu rezultatul analizei produselor noastre." })
    );
  }

  const UNITS_HIDDEN_IN_MENU = ["buc.", "meniu", "felie"];

  function updatePrice(id) {
    const p = PRODUCTS.get(id);
    const each = unitPrice(p);
    const node = $(`[data-price="${id}"]`);
    if (!node) return;
    node.replaceChildren(
      ...(each !== p.price ? [el("s", { class: "item__old", text: num(p.price) }), " "] : []),
      num(each),
      el("small", { text: " lei" }),
      // Gramajul sau volumul lângă preț; „buc.”, „meniu” și „felie” nu spun nimic în plus.
      p.unit && !UNITS_HIDDEN_IN_MENU.includes(p.unit) ? el("small", { class: "item__unit", text: `/ ${p.unit}` }) : ""
    );
  }

  function stepper(id, label) {
    const qty = cart.get(id) || 0;
    return el("div", { class: "stepper", role: "group", "aria-label": `Cantitate ${label}` },
      el("button", { type: "button", "data-dec": id, "aria-label": `Scade cantitatea: ${label}`, text: "−" }),
      el("output", { "aria-live": "polite", text: String(qty) }),
      el("button", { type: "button", "data-inc": id, "aria-label": `Mărește cantitatea: ${label}`, text: "+" })
    );
  }

  function updateItemControl(id) {
    const slot = $(`[data-control="${id}"]`);
    if (!slot) return;
    const item = PRODUCTS.get(id);
    const hadFocus = slot.contains(document.activeElement) ? document.activeElement : null;
    const focusWhich = hadFocus && (hadFocus.hasAttribute("data-dec") ? "dec" : "inc");

    slot.replaceChildren(
      cart.has(id)
        ? stepper(id, item.name)
        : el("button", { type: "button", class: "add-button", "data-add": id, "aria-describedby": `nume-${id}`, text: "Adaugă" })
    );

    // Păstrăm focusul pe un control logic după ce butoanele s-au schimbat.
    if (hadFocus) {
      const next = cart.has(id)
        ? $(focusWhich === "dec" ? "[data-dec]" : "[data-inc]", slot)
        : $("[data-add]", slot);
      next && next.focus();
    }
  }

  // ---------- Rezumat, bară și mesaj scurt ----------

  const countBadge = $("[data-cart-count]");
  const cartBar = $("[data-cart-bar]");

  function updateSummary() {
    const count = cartCount();
    const total = cartTotal();
    countBadge.textContent = String(count);
    countBadge.setAttribute("aria-label", produse(count));
    cartBar.hidden = count === 0;
    $("[data-cart-bar-count]").textContent = produse(count);
    $("[data-cart-bar-total]").textContent = lei(total);
  }

  let toastTimer;
  function toast(message) {
    const t = $("[data-toast]");
    t.textContent = message;
    t.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-visible"), 1800);
  }

  // După ce s-a adăugat un produs: anunță când oferta 5+1 e aproape sau tocmai s-a aplicat.
  function offerHint(id) {
    const p = PRODUCTS.get(id);
    if (!OFFERS.fivePlusOne || halfPrice || !p.inOffers || !p.family) return "";
    const n = [...cart].reduce((sum, [i, q]) => sum + (PRODUCTS.get(i).family === p.family ? q : 0), 0);
    if (n % (BUY + 1) === BUY) return `Mai luați un produs din ${p.family} și cel mai ieftin e gratuit`;
    if (n % (BUY + 1) === 0) return `Oferta 5+1: un produs din ${p.family} e gratuit`;
    return "";
  }

  function bump() {
    countBadge.classList.remove("is-bumped");
    void countBadge.offsetWidth; // repornește animația
    countBadge.classList.add("is-bumped");
  }

  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    const remove = e.target.closest("[data-remove]");

    if (add) {
      const id = add.dataset.add;
      setQty(id, 1);
      bump();
      toast(offerHint(id) || `${PRODUCTS.get(id).name} — adăugat în coș`);
    } else if (inc) {
      setQty(inc.dataset.inc, (cart.get(inc.dataset.inc) || 0) + 1);
      bump();
      const hint = offerHint(inc.dataset.inc);
      if (hint) toast(hint);
    } else if (dec) {
      setQty(dec.dataset.dec, (cart.get(dec.dataset.dec) || 0) - 1);
    } else if (remove) {
      const id = remove.dataset.remove;
      setQty(id, 0);
      toast(`${PRODUCTS.get(id).name} — scos din coș`);
    }
  });

  // ---------- Dialogul coșului ----------

  const cartDialog = $("[data-cart]");
  const form = $("[data-order-form]");

  function renderCart() {
    const list = $("[data-cart-items]");
    const focusedId = document.activeElement && cartDialog.contains(document.activeElement)
      ? (document.activeElement.dataset.inc || document.activeElement.dataset.dec) : null;
    const focusedKind = focusedId && (document.activeElement.hasAttribute("data-inc") ? "inc" : "dec");

    const priced = pricing();
    list.replaceChildren(
      ...priced.lines.map(({ id, p, each, sum }) => {
        return el("li", { class: "cart-line" },
          el("div", {},
            el("p", { class: "cart-line__name", text: p.name }),
            el("p", { class: "cart-line__each" },
              each !== p.price ? el("s", { text: lei(p.price) }) : null,
              each !== p.price ? " " : null,
              `${lei(each)} / ${p.unit}`
            )
          ),
          el("p", { class: "cart-line__sum", text: lei(sum) }),
          el("div", { class: "cart-line__controls" },
            stepper(id, p.name),
            el("button", { type: "button", class: "link-button", "data-remove": id, text: "Șterge" })
          )
        );
      })
    );

    const empty = cart.size === 0;
    $("[data-cart-empty]").hidden = !empty;
    $("[data-cart-total]").textContent = lei(priced.total);
    $("[data-cart-offers]").replaceChildren(
      ...(halfPrice && priced.lines.some((l) => l.p.inOffers)
        ? [el("p", { class: "cart-offer" }, el("span", {}, el("strong", { text: "Vinerea dulce: " }), "jumătate de preț la patiserie."))]
        : []),
      ...priced.free.map((f) =>
        el("p", { class: "cart-offer cart-offer--free" },
          el("span", {}, el("strong", { text: "Gratuit, oferta 5+1: " }), `${f.qty}× ${f.p.name}`),
          el("span", { class: "cart-offer__sum", text: `−${lei(f.p.price * f.qty)}` })
        )
      ),
      ...priced.almost.map((family) =>
        el("p", { class: "cart-offer cart-offer--hint", text: `Mai luați un produs din ${family} și cel mai ieftin vă iese gratuit.` })
      )
    );
    form.hidden = empty;

    if (focusedId) {
      const again = $(`[data-${focusedKind}="${focusedId}"]`, list);
      (again || $("[data-close-cart]")).focus();
    } else if (cartDialog.contains(document.activeElement) === false && cartDialog.open) {
      $("[data-close-cart]").focus();
    }
  }

  // <dialog> există din iOS 15.4 / Chrome 37; pe telefoane mai vechi îl simulăm.
  const nativeDialog = typeof cartDialog.showModal === "function";
  let backdrop = null;

  function openCart() {
    renderCart();
    if (nativeDialog) {
      cartDialog.showModal();
    } else {
      cartDialog.setAttribute("open", "");
      cartDialog.classList.add("is-fallback");
      backdrop = el("div", { class: "cart-backdrop" });
      backdrop.addEventListener("click", closeCart);
      document.body.append(backdrop);
      $("[data-close-cart]").focus();
    }
    document.documentElement.style.overflow = "hidden";
  }

  function closeCart() {
    if (nativeDialog) cartDialog.close();
    else if (cartDialog.hasAttribute("open")) {
      cartDialog.removeAttribute("open");
      if (backdrop) backdrop.remove();
      onCartClosed();
    }
  }

  function onCartClosed() {
    document.documentElement.style.overflow = "";
    const opener = $(".cart-button");
    opener && opener.focus({ preventScroll: true });
  }

  cartDialog.addEventListener("close", onCartClosed);

  if (!nativeDialog) {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeCart();
    });
  }

  $$("[data-open-cart]").forEach((b) => b.addEventListener("click", openCart));
  $("[data-close-cart]").addEventListener("click", closeCart);

  // Click pe fundalul întunecat închide coșul.
  cartDialog.addEventListener("click", (e) => {
    if (e.target === cartDialog) closeCart();
  });

  // ---------- Trimitere pe WhatsApp ----------

  // Formatul cerut de patiserie:
  //   Comandă nouă:
  //   2× Pizza slice – 14 lei
  //   Total: 18 lei
  //   Ridicare: pauza de la 10:50
  //   Nume: Popescu
  //   Prenume: Andrei
  // Cu oferte, înainte de total apar și rânduri ca:
  //   1× Gogoașă Oreo gratuit, oferta 5+1 – −5 lei
  //   Reducere de vineri inclusă: jumătate de preț la patiserie
  function buildMessage(data) {
    halfPrice = isHalfPrice(); // ora trimiterii decide reducerea de vineri
    const priced = pricing();
    const lines = ["Comandă nouă:"];
    priced.lines.forEach(({ p, qty, sum }) => lines.push(`${qty}× ${p.name} – ${lei(sum)}`));
    priced.free.forEach((f) => lines.push(`${f.qty}× ${f.p.name} gratuit, oferta 5+1 – −${lei(f.p.price * f.qty)}`));
    if (halfPrice && priced.lines.some((l) => l.p.inOffers)) {
      lines.push("Reducere de vineri inclusă: jumătate de preț la patiserie");
    }
    lines.push(`Total: ${lei(priced.total)}`);
    lines.push(`Ridicare: ${data.pickup}`);
    lines.push(`Nume: ${data.lastname}`);
    lines.push(`Prenume: ${data.firstname}`);
    if (data.notes) lines.push(`Observații: ${data.notes}`);
    return lines.join("\n");
  }

  const REQUIRED = [
    ["pickup", "Scrieți când doriți comanda, de exemplu „pauza mare”, „ora 13” sau „acum”."],
    ["lastname", "Scrieți numele de familie."],
    ["firstname", "Scrieți prenumele."],
  ];

  // Oprește la primul câmp gol, arată mesajul sub el și mută focusul acolo.
  function validate() {
    let firstInvalid = null;
    REQUIRED.forEach(([field, message]) => {
      const input = form.elements[field];
      const error = $(`[data-error-for="${field}"]`);
      const empty = !input.value.trim();
      error.textContent = empty ? message : "";
      if (empty) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
      if (empty && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  REQUIRED.forEach(([field]) => {
    form.elements[field].addEventListener("input", (e) => {
      if (e.target.value.trim()) {
        e.target.removeAttribute("aria-invalid");
        $(`[data-error-for="${field}"]`).textContent = "";
      }
    });
  });

  // Pe telefon deschidem linkul în aceeași filă: e varianta care pornește aplicația WhatsApp
  // și în browserele din Facebook/Instagram, unde ferestrele noi sunt adesea blocate.
  const isTouch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (cart.size === 0 || !validate()) return;

    const data = {
      pickup: form.elements.pickup.value.trim(),
      lastname: form.elements.lastname.value.trim(),
      firstname: form.elements.firstname.value.trim(),
      notes: form.elements.notes.value.trim(),
    };
    const url = `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(buildMessage(data))}`;
    const signalSent = signalOrder();

    // Comanda a plecat spre WhatsApp: pagina revine la starea inițială înainte de navigare,
    // ca la întoarcere (inclusiv din cache-ul „înapoi” al browserului) coșul să fie gol.
    resetAll();
    toast("Comanda a fost trimisă în WhatsApp");

    if (isTouch) {
      // Safari anulează cererile în curs când pagina pleacă spre WhatsApp, așa că așteptăm semnalul
      // (cel mult 800 ms). Coșul e deja gol, deci o a doua apăsare între timp nu mai trimite nimic.
      signalSent.then(() => { window.location.href = url; });
    } else {
      // Pe desktop pagina rămâne deschisă, iar fereastra nouă trebuie deschisă imediat, din click.
      const win = window.open(url, "_blank");
      if (win) win.opener = null;
      else window.location.href = url; // fereastra nouă a fost blocată
    }
  });

  // Semnal anonim pentru statistici: o cerere către /comanda-trimisa.txt cu totalul și numărul de produse,
  // fără nume sau alte date despre client. Se vede în statisticile găzduirii; comanda reală rămâne mesajul WhatsApp.
  // Întoarce o promisiune rezolvată când semnalul a ajuns sau după cel mult 800 ms.
  function signalOrder() {
    const total = Math.round(pricing().total * 100) / 100;
    const signal = `/comanda-trimisa.txt?total=${total}&produse=${cartCount()}`;
    let sent;
    try {
      sent = fetch(signal, { keepalive: true, cache: "no-store" }).catch(() => {});
    } catch (_) {
      const img = new Image();
      sent = new Promise((done) => { img.onload = img.onerror = done; });
      img.src = signal;
    }
    return Promise.race([sent, new Promise((done) => setTimeout(done, 800))]);
  }

  // Coș gol, formular gol, coșul închis, pagina sus.
  function resetAll() {
    cart.clear();
    saveCart();
    MENUS.forEach((m) => m.groups.forEach((g) => g.items.forEach((i) => updateItemControl(i.id))));
    updateSummary();
    form.reset();
    REQUIRED.forEach(([field]) => {
      form.elements[field].removeAttribute("aria-invalid");
      $(`[data-error-for="${field}"]`).textContent = "";
    });
    closeCart();
    // Salt instant (nu derulare lină), ca poziția să fie deja 0 când se deschide WhatsApp.
    // Evenimentul „close” al dialogului vine asincron, iar Safari nu derulează cât timp
    // pagina are încă overflow: hidden — deblocăm aici, imediat.
    const root = document.documentElement;
    root.style.overflow = "";
    root.style.scrollBehavior = "auto";
    // Fără „#fastfood” în adresă și fără poziția veche restaurată de browser la întoarcere.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    window.scrollTo(0, 0);
    root.style.scrollBehavior = "";
  }

  // ---------- Navigare: evidențiază meniul vizibil ----------

  function watchSections() {
    const links = $$("[data-nav]");
    if (!("IntersectionObserver" in window)) return;
    const visible = new Map();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((en) => visible.set(en.target.id, en.isIntersecting));
      const current = MENUS.map((m) => m.id).find((id) => visible.get(id));
      links.forEach((a) => {
        if (a.dataset.nav === current) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    MENUS.forEach((m) => observer.observe(document.getElementById(m.id)));
  }

  // ---------- Date de contact și hartă ----------

  function fillShopInfo() {
    $("[data-address]").textContent = SHOP.address;
    const phone = $("[data-phone-link]");
    phone.textContent = `Telefon ${SHOP.phoneDisplay}`;
    phone.href = `tel:+${SHOP.whatsapp}`;
    $("[data-phone-text]").textContent = SHOP.phoneDisplay;
    $("[data-hours]").replaceChildren(
      ...SHOP.hours.flatMap(([days, time]) => [el("dt", { text: days }), el("dd", { text: time })])
    );
    const q = encodeURIComponent(SHOP.mapsQuery);
    $("[data-map]").src = `https://www.google.com/maps?q=${q}&z=17&output=embed`;
    $("[data-directions]").href = `https://www.google.com/maps/search/?api=1&query=${q}`;
    $("[data-year]").textContent = String(new Date().getFullYear());
  }

  // ---------- Cartonașele cu oferte ----------

  function updateOffers() {
    const friday = $("[data-offer=\"friday\"]");
    const five = $("[data-offer=\"five\"]");
    if (friday) {
      friday.hidden = !OFFERS.fridayHalfPrice;
      friday.classList.toggle("is-active", halfPrice);
    }
    if (five) five.hidden = !OFFERS.fivePlusOne;
  }

  // Dacă pagina stă deschisă peste ora 11:00 de vineri (sau peste miezul nopții), schimbăm prețurile.
  function watchClock() {
    setInterval(() => {
      const now = isHalfPrice();
      if (now === halfPrice) return;
      halfPrice = now;
      PRODUCTS.forEach((_, id) => updatePrice(id));
      updateSummary();
      updateOffers();
      if (cartDialog.open) renderCart();
    }, 30000);
  }

  // ---------- Pornire ----------

  loadCart();
  renderMenus();
  MENUS.forEach((m) => m.groups.forEach((g) => g.items.forEach((i) => { updateItemControl(i.id); updatePrice(i.id); })));
  updateSummary();
  updateOffers();
  watchClock();
  fillShopInfo();
  watchSections();
  // Versiunile anterioare țineau minte numele clientului; îl ștergem.
  try {
    localStorage.removeItem(`${STORAGE_KEY}-client`);
    localStorage.removeItem(`${STORAGE_KEY}-nume`);
  } catch (_) {}
})();
