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
      group.items.forEach((item) => PRODUCTS.set(item.id, { ...item, menu: menu.title }))
    )
  );

  const lei = (n) => `${n.toLocaleString("ro-RO")} lei`;
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
  const cartTotal = () => [...cart].reduce((sum, [id, qty]) => sum + PRODUCTS.get(id).price * qty, 0);

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
      el("p", { class: "item__unit", text: item.unit }),
      el("div", { class: "item__side" },
        el("p", { class: "item__price" }, String(item.price), el("small", { text: " lei" })),
        el("div", { class: "item__control", "data-control": item.id })
      )
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
      toast(`${PRODUCTS.get(id).name} — adăugat în coș`);
    } else if (inc) {
      setQty(inc.dataset.inc, (cart.get(inc.dataset.inc) || 0) + 1);
      bump();
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

    list.replaceChildren(
      ...[...cart].map(([id, qty]) => {
        const p = PRODUCTS.get(id);
        return el("li", { class: "cart-line" },
          el("div", {},
            el("p", { class: "cart-line__name", text: p.name }),
            el("p", { class: "cart-line__each", text: `${lei(p.price)} / ${p.unit}` })
          ),
          el("p", { class: "cart-line__sum", text: lei(p.price * qty) }),
          el("div", { class: "cart-line__controls" },
            stepper(id, p.name),
            el("button", { type: "button", class: "link-button", "data-remove": id, text: "Șterge" })
          )
        );
      })
    );

    const empty = cart.size === 0;
    $("[data-cart-empty]").hidden = !empty;
    $("[data-cart-total]").textContent = lei(cartTotal());
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
  function buildMessage(data) {
    const lines = ["Comandă nouă:"];
    for (const [id, qty] of cart) {
      const p = PRODUCTS.get(id);
      lines.push(`${qty}× ${p.name} – ${lei(p.price * qty)}`);
    }
    lines.push(`Total: ${lei(cartTotal())}`);
    lines.push(`Ridicare: ${data.pickup}`);
    lines.push(`Nume: ${data.lastname}`);
    lines.push(`Prenume: ${data.firstname}`);
    if (data.notes) lines.push(`Observații: ${data.notes}`);
    return lines.join("\n");
  }

  const REQUIRED = [
    ["pickup", "Scrieți când ridicați comanda, de exemplu „pauza de la 10:50”."],
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

    // Comanda a plecat spre WhatsApp: pagina revine la starea inițială înainte de navigare,
    // ca la întoarcere (inclusiv din cache-ul „înapoi” al browserului) coșul să fie gol.
    resetAll();
    toast("Comanda a fost trimisă în WhatsApp");

    if (isTouch) {
      window.location.href = url;
    } else {
      const win = window.open(url, "_blank");
      if (win) win.opener = null;
      else window.location.href = url; // fereastra nouă a fost blocată
    }
  });

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

  // ---------- Pornire ----------

  loadCart();
  renderMenus();
  MENUS.forEach((m) => m.groups.forEach((g) => g.items.forEach((i) => updateItemControl(i.id))));
  updateSummary();
  fillShopInfo();
  watchSections();
  // Versiunile anterioare țineau minte numele clientului; îl ștergem.
  try {
    localStorage.removeItem(`${STORAGE_KEY}-client`);
    localStorage.removeItem(`${STORAGE_KEY}-nume`);
  } catch (_) {}
})();
