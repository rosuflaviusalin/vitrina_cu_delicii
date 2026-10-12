// Meniul afișat pe pagină. Produsele sunt fictive — înlocuiți-le cu cele reale.
// Fiecare produs are un `id` unic (folosit în coș), `name`, `desc`, `unit` (gramaj/volum) și `price` în lei.
// Puneți `tag: "nou"` sau `tag: "specialitatea casei"` pentru o mică etichetă lângă nume.

window.SHOP = {
  name: "Vitrina cu Delicii",
  motto: "Gust de neuitat, în inima Oraviței",
  phoneDisplay: "0766 991 577",
  whatsapp: "40766991577", // format internațional, fără + și fără spații
  address: "Str. 1 Decembrie 1918 nr. 49, Oravița, Caraș-Severin",
  mapsQuery: "Strada 1 Decembrie 1918 49, Oravița, Caraș-Severin, Romania",
  hours: [
    ["Luni – Vineri", "07:00 – 21:00"],
    ["Sâmbătă", "08:00 – 21:00"],
    ["Duminică", "09:00 – 18:00"],
  ],
};

window.MENUS = [
  {
    id: "patiserie",
    title: "Patiserie",
    intro: "Dulce sau sărat, pentru micul dejun, pauză sau desert.",
    groups: [
      {
        title: "Din cuptor",
        items: [
          { id: "p-strudel-mere", name: "Ștrudel cu mere și scorțișoară", desc: "Foaie trasă subțire, mere acrișoare, nucă.", unit: "180 g", price: 12, tag: "specialitatea casei" },
          { id: "p-strudel-branza", name: "Ștrudel cu brânză dulce și stafide", desc: "Brânză de vaci, lămâie, stafide.", unit: "180 g", price: 12 },
          { id: "p-placinta-branza", name: "Plăcintă cu brânză sărată", desc: "Telemea și brânză de vaci în foi rumenite.", unit: "200 g", price: 10 },
          { id: "p-pateu-carne", name: "Pateu cu carne", desc: "Foietaj cu umplutură de porc și vită.", unit: "150 g", price: 9 },
          { id: "p-cornulet-nuca", name: "Cornuleț cu nucă", desc: "Aluat fraged, nucă măcinată cu miere.", unit: "buc.", price: 4 },
          { id: "p-croissant", name: "Croissant cu unt", desc: "Simplu sau cu ciocolată — precizați la observații.", unit: "90 g", price: 8 },
          { id: "p-covrig", name: "Covrig cu susan", desc: "Cald, scos din cuptor.", unit: "buc.", price: 3 },
        ],
      },
      {
        title: "Prăjituri și torturi",
        items: [
          { id: "p-dobos", name: "Felie de tort Dobos", desc: "Blat subțire, cremă de ciocolată, capac de caramel.", unit: "felie", price: 16, tag: "specialitatea casei" },
          { id: "p-esterhazy", name: "Felie de tort Esterházy", desc: "Blat de nucă, cremă de vanilie, glazură pieptănată.", unit: "felie", price: 17 },
          { id: "p-krempita", name: "Cremșnit", desc: "Foietaj, cremă de vanilie, frișcă.", unit: "felie", price: 12 },
          { id: "p-amandina", name: "Amandină", desc: "Blat de cacao însiropat, cremă de ciocolată.", unit: "buc.", price: 11 },
          { id: "p-savarina", name: "Savarină cu frișcă", desc: "Siropată cu rom, frișcă proaspătă.", unit: "buc.", price: 11 },
          { id: "p-papanasi", name: "Papanași cu smântână și dulceață", desc: "Doi papanași, dulceață de afine.", unit: "porție", price: 22, tag: "nou" },
        ],
      },
    ],
  },
  {
    id: "fastfood",
    title: "Fast-food",
    intro: "Pentru o masă rapidă, făcută pe loc, din ingrediente de încredere.",
    groups: [
      {
        title: "Burgeri și sandvișuri",
        items: [
          { id: "f-burger-casa", name: "Burger Vitrina", desc: "Vită 150 g, cheddar, ceapă caramelizată, sos de casă.", unit: "350 g", price: 32, tag: "specialitatea casei" },
          { id: "f-burger-pui", name: "Burger crispy cu pui", desc: "Piept de pui pane, salată iceberg, maioneză cu usturoi.", unit: "320 g", price: 28 },
          { id: "f-shaorma", name: "Shaorma de pui", desc: "În lipie, cu cartofi, varză, sosuri la alegere.", unit: "450 g", price: 27 },
          { id: "f-sandvis-sunca", name: "Sandviș cald cu șuncă și cașcaval", desc: "Pâine de casă rumenită pe grill.", unit: "250 g", price: 18 },
        ],
      },
      {
        title: "Pizza și garnituri",
        items: [
          { id: "f-pizza-casei", name: "Pizza a casei", desc: "Șuncă, ciuperci, porumb, mozzarella.", unit: "32 cm", price: 38 },
          { id: "f-pizza-margherita", name: "Pizza Margherita", desc: "Sos de roșii, mozzarella, busuioc.", unit: "32 cm", price: 32 },
          { id: "f-cartofi", name: "Cartofi prăjiți", desc: "Cu sare de mare sau cu brânză rasă.", unit: "200 g", price: 12 },
          { id: "f-crispy", name: "Crispy strips de pui", desc: "Cinci bucăți, cu sos la alegere.", unit: "250 g", price: 24 },
          { id: "f-sos", name: "Sos suplimentar", desc: "Usturoi, picant, barbeque sau ketchup.", unit: "50 g", price: 3 },
        ],
      },
    ],
  },
  {
    id: "bauturi",
    title: "Băuturi",
    intro: "De la cafeaua de dimineață la limonada de după-amiază.",
    groups: [
      {
        title: "Calde",
        items: [
          { id: "b-espresso", name: "Espresso", desc: "Simplu sau lung.", unit: "40 ml", price: 7 },
          { id: "b-cappuccino", name: "Cappuccino", desc: "Cu lapte spumat.", unit: "180 ml", price: 10 },
          { id: "b-vieneza", name: "Cafea vieneză", desc: "Espresso dublu cu frișcă bătută.", unit: "200 ml", price: 13, tag: "specialitatea casei" },
          { id: "b-ciocolata", name: "Ciocolată caldă", desc: "Densă, cu cacao adevărată.", unit: "250 ml", price: 12 },
          { id: "b-ceai", name: "Ceai de plante", desc: "Tei, mentă sau fructe de pădure.", unit: "300 ml", price: 8 },
        ],
      },
      {
        title: "Reci",
        items: [
          { id: "b-limonada", name: "Limonadă cu mentă", desc: "Lămâie proaspăt stoarsă, miere.", unit: "400 ml", price: 15 },
          { id: "b-fresh", name: "Fresh de portocale", desc: "Stors pe loc.", unit: "300 ml", price: 16 },
          { id: "b-socata", name: "Socată de casă", desc: "Din flori de soc culese din zonă.", unit: "400 ml", price: 12, tag: "nou" },
          { id: "b-apa", name: "Apă minerală sau plată", desc: "", unit: "500 ml", price: 6 },
          { id: "b-suc", name: "Suc la sticlă", desc: "Cola, Fanta sau Sprite.", unit: "330 ml", price: 8 },
        ],
      },
    ],
  },
];
