// Meniul afișat pe pagină, după meniul tipărit al magazinului.
// Fiecare produs are un `id` unic (folosit în coș), `name`, `desc`, `unit` (gramaj/volum) și `price` în lei
// (număr întreg sau cu jumătate de leu, de ex. 6.5).
// Puneți `tag: "nou"` sau `tag: "specialitatea casei"` pentru o mică etichetă lângă nume.
// `family` grupează produsele de același fel pentru oferta 5+1 (la 5 covrigi, al 6-lea covrig e gratuit).
// Produsele fără `family` și meniurile cu `offers: false` (fast-food și băuturi) nu intră în nicio ofertă.
// Un singur produs se scoate din oferta de vineri cu `offers: false` (de exemplu meniul sandviș + suc).

window.SHOP = {
  name: "Vitrina cu Delicii",
  motto: "Gust de neuitat, în inima Oraviței",
  phoneDisplay: "0731 306 015",
  whatsapp: "40731306015", // format internațional, fără + și fără spații
  address: "Str. 1 Decembrie 1918 nr. 49, Oravița, Caraș-Severin",
  mapsQuery: "Strada 1 Decembrie 1918 49, Oravița, Caraș-Severin, Romania",
  // Ofertele: puneți `false` ca să opriți una.
  offers: {
    fridayHalfPrice: true, // vinerea, de la ora 11:00 (ora României), jumătate de preț
    fivePlusOne: false,    // la 5 produse din aceeași familie, cel mai ieftin dintre 6 e gratuit
  },
  hours: [
    ["Luni – Vineri", "07:00 – 14:30"],
    ["Sâmbătă – Duminică", "Închis"],
  ],
};

window.MENUS = [
  {
    id: "patiserie",
    title: "Patiserie",
    intro: "Dulce sau sărat, pentru micul dejun, pauză sau desert.",
    groups: [
      {
        title: "Croissante și covrigi",
        items: [
          { id: "p-croissant-unt", name: "Croissant cu unt", desc: "", unit: "buc.", price: 5, family: "croissante" },
          { id: "p-croissant-ciocolata", name: "Croissant cu ciocolată", desc: "", unit: "buc.", price: 6, family: "croissante" },
          { id: "p-croissant-zmeura", name: "Croissant cu zmeură", desc: "", unit: "buc.", price: 6, family: "croissante" },
          { id: "p-covrig-seminte", name: "Covrig cu semințe", desc: "", unit: "buc.", price: 3, family: "covrigi" },
          { id: "p-covrig-sare", name: "Covrig cu sare", desc: "", unit: "buc.", price: 3, family: "covrigi" },
          { id: "p-covrig-cascaval", name: "Covrig cu cașcaval", desc: "", unit: "buc.", price: 4, family: "covrigi" },
          { id: "p-covridog", name: "Covridog", desc: "Crenvurști în corn.", unit: "buc.", price: 6, family: "covridog și covriking" },
          { id: "p-covriking", name: "Covriking", desc: "Șuncă și cașcaval în corn.", unit: "buc.", price: 8, family: "covridog și covriking" },
        ],
      },
      {
        title: "Sandvișuri și pizza",
        items: [
          { id: "p-sandvis-mic-salam", name: "Mini sandviș cu salam", desc: "Ciabatta junior, 2 felii de salam, brânză cheddar, cartofi prăjiți, sosuri.", unit: "buc.", price: 8, family: "sandvișuri", tag: "nou" },
          { id: "p-sandvis-mic-sunca", name: "Mini sandviș cu șuncă", desc: "Ciabatta junior, 2 felii de șuncă, brânză cheddar, cartofi prăjiți, sosuri.", unit: "buc.", price: 8, family: "sandvișuri", tag: "nou" },
          { id: "p-sandvis-sunca", name: "Sandviș cu șuncă", desc: "Ciabatta maxi, 3 felii de șuncă, brânză cheddar, salată verde, roșii, castraveți.", unit: "buc.", price: 12, family: "sandvișuri" },
          { id: "p-sandvis-salam", name: "Sandviș cu salam", desc: "Ciabatta maxi, 4 felii de salam, brânză cheddar, salată verde, roșii, castraveți.", unit: "buc.", price: 12, family: "sandvișuri" },
          { id: "p-sandvis-muschi", name: "Sandviș cu mușchi file", desc: "Ciabatta maxi, 3 felii de mușchi file, brânză cheddar, salată verde, roșii, castraveți.", unit: "buc.", price: 12, family: "sandvișuri" },
          { id: "p-pizza-felie", name: "Felie de pizza", desc: "Blat, șuncă, salam, ciuperci, măsline, mozzarella.", unit: "felie", price: 10, family: "pizza" },
          { id: "p-pizza-caprese", name: "Pizza caprese", desc: "Blat, mozzarella, roșii.", unit: "buc.", price: 6, family: "pizza" },
        ],
      },
      {
        title: "Foietaje",
        items: [
          { id: "p-strudel-sunca", name: "Ștrudel rustic cu șuncă", desc: "Șuncă, brânză, ceapă.", unit: "buc.", price: 8, family: "foietaje" },
          { id: "p-merdenea-branza", name: "Merdenea cu brânză", desc: "", unit: "buc.", price: 5, family: "foietaje" },
          { id: "p-cos-zmeura-quark", name: "Coș cu zmeură și brânză quark", desc: "", unit: "130 g", price: 7, family: "foietaje", tag: "nou" },
          { id: "p-mini-cascaval", name: "Mini cu cașcaval", desc: "Se vând la cântar. Fiecare bucată din coș înseamnă 100 g.", unit: "100 g", price: 5.5, family: "produse la cântar" },
          { id: "p-pernute-branza", name: "Pernuțe cu brânză", desc: "Se vând la cântar. Fiecare bucată din coș înseamnă 100 g.", unit: "100 g", price: 5.5, family: "produse la cântar" },
          { id: "p-pernute-visine", name: "Pernuțe cu vișine și mascarpone", desc: "Se vând la cântar. Fiecare bucată din coș înseamnă 100 g.", unit: "100 g", price: 5.5, family: "produse la cântar" },
        ],
      },
      {
        title: "Gogoși",
        items: [
          { id: "p-gogoasa-fistic", name: "Gogoașă cu fistic", desc: "", unit: "buc.", price: 6, family: "gogoși" },
          { id: "p-gogoasa-biscoff", name: "Gogoașă Biscoff", desc: "", unit: "buc.", price: 6, family: "gogoși" },
          { id: "p-gogoasa-zmeura", name: "Gogoașă cu zmeură", desc: "", unit: "buc.", price: 6, family: "gogoși" },
          { id: "p-gogoasa-ciocolata", name: "Gogoașă cu ciocolată", desc: "", unit: "buc.", price: 5, family: "gogoși" },
          { id: "p-gogoasa-capsuni", name: "Gogoașă cu căpșuni", desc: "", unit: "buc.", price: 5, family: "gogoși" },
          { id: "p-gogoasa-oreo", name: "Gogoașă Oreo", desc: "", unit: "buc.", price: 5, family: "gogoși" },
          { id: "p-gogoasa-nutella", name: "Gogoașă cu Nutella", desc: "", unit: "buc.", price: 5, family: "gogoși" },
        ],
      },
      {
        title: "Cofetărie",
        items: [
          { id: "p-savarina", name: "Savarină", desc: "", unit: "buc.", price: 10, family: "prăjituri" },
          { id: "p-ecler", name: "Ecler", desc: "", unit: "buc.", price: 7, family: "prăjituri" },
          { id: "p-mini-amandina", name: "Mini amandină", desc: "", unit: "buc.", price: 6, family: "prăjituri" },
          { id: "p-snickers", name: "Prăjitură Snickers", desc: "", unit: "buc.", price: 6, family: "prăjituri" },
          { id: "p-philadelphia-mango", name: "Philadelphia cu mango", desc: "", unit: "buc.", price: 10, family: "prăjituri" },
          { id: "p-philadelphia", name: "Philadelphia", desc: "", unit: "buc.", price: 10, family: "prăjituri" },
          { id: "p-profiterol", name: "Profiterol", desc: "", unit: "buc.", price: 10, family: "prăjituri" },
          { id: "p-tarta-fructe", name: "Tartă cu fructe", desc: "", unit: "buc.", price: 6.5, family: "prăjituri" },
        ],
      },
    ],
  },
  {
    id: "fastfood",
    title: "Fast-food",
    offers: false, // fast-food-ul nu intră în oferta de vineri
    intro: "Burgeri și meniuri crispy, pentru o masă rapidă.",
    groups: [
      {
        title: "Burgeri și sandvișuri",
        items: [
          { id: "f-plescavita-porc", name: "Pleșcaviță de porc", desc: "Chiflă, chiftea de porc, salată verde, salată de varză, ceapă caramelizată, cartofi prăjiți, sosuri.", unit: "400 g", price: 22, family: "burgeri" },
          { id: "f-burger-pui", name: "Burger de pui", desc: "Chiflă, chiftea de pui, brânză cheddar, salată verde, salată de varză, cartofi prăjiți, sosuri.", unit: "300 g", price: 20, family: "burgeri" },
          { id: "f-snitel-pui", name: "Șnițel de pui în chiflă", desc: "Chiflă, șnițel de pui, salată verde, salată de varză, cartofi prăjiți, sosuri.", unit: "300 g", price: 20, family: "burgeri" },
          { id: "f-burger-crispy", name: "Burger crispy de pui", desc: "Chiflă, 2 bucăți crispy, brânză cheddar, salată verde, salată de varză, cartofi prăjiți, sosuri.", unit: "300 g", price: 22, family: "burgeri" },
          { id: "f-burger-vita", name: "Burger de vită", desc: "Chiflă, chiftea de vită, brânză cheddar, bacon, castraveți murați, ceapă caramelizată, cartofi prăjiți, sosuri.", unit: "300 g", price: 30, family: "burgeri" },
          { id: "f-cartofi", name: "Cartofi prăjiți cu sos", desc: "", unit: "porție", price: 6, family: "cartofi prăjiți" },
        ],
      },
      {
        title: "Meniuri",
        items: [
          { id: "p-meniu-sandvis-suc", name: "Meniu mini sandviș + suc", desc: "Un mini sandviș cu salam sau șuncă și un suc. Scrieți la observații ce sandviș și ce suc doriți.", unit: "meniu", price: 11.99, tag: "nou", offers: false },
          { id: "f-meniu-mini-crispy", name: "Meniu mini crispy de pui", desc: "Crispy de pui 2 bucăți, cartofi pai 100 g, salată de varză, sos de usturoi.", unit: "meniu", price: 16, family: "meniuri crispy" },
          { id: "f-meniu-mega-crispy", name: "Meniu mega crispy de pui", desc: "Crispy de pui 4 bucăți, cartofi pai 200 g, salată de varză, sos de usturoi.", unit: "meniu", price: 26, family: "meniuri crispy" },
          { id: "f-meniu-mini-aripioare", name: "Meniu mini aripioare crispy", desc: "Aripioare crispy de pui 4 bucăți, cartofi pai 100 g, salată de varză, sos de usturoi.", unit: "meniu", price: 16, family: "meniuri crispy" },
          { id: "f-meniu-mega-aripioare", name: "Meniu mega aripioare crispy", desc: "Aripioare crispy de pui 8 bucăți, cartofi pai 200 g, salată de varză, sos de usturoi.", unit: "meniu", price: 26, family: "meniuri crispy" },
        ],
      },
    ],
  },
  {
    id: "bauturi",
    title: "Băuturi",
    offers: false,
    intro: "Cafea pentru dimineață și sucuri reci pentru restul zilei.",
    groups: [
      {
        title: "Calde",
        items: [
          { id: "b-macchiato", name: "Macchiato", desc: "", unit: "pahar", price: 5 },
          { id: "b-cappuccino", name: "Cappuccino", desc: "", unit: "pahar", price: 5 },
          { id: "b-cafea-neagra", name: "Cafea neagră", desc: "", unit: "pahar", price: 5 },
          { id: "b-sirop", name: "Sirop pentru cafea", desc: "Se adaugă la orice cafea. Scrieți aroma dorită la observații.", unit: "porție", price: 1 },
        ],
      },
      {
        title: "Reci",
        items: [
          { id: "b-apa-minerala", name: "Apă minerală", desc: "", unit: "0,5 l", price: 5 },
          { id: "b-apa-plata", name: "Apă plată", desc: "", unit: "0,5 l", price: 5 },
          { id: "b-cola", name: "Coca-Cola", desc: "", unit: "0,5 l", price: 8 },
          { id: "b-cola-doza", name: "Coca-Cola la doză", desc: "", unit: "0,33 l", price: 6 },
          { id: "b-fanta", name: "Fanta", desc: "", unit: "0,5 l", price: 8 },
          { id: "b-fanta-doza", name: "Fanta la doză", desc: "", unit: "0,33 l", price: 6 },
          { id: "b-pepsi", name: "Pepsi", desc: "", unit: "0,5 l", price: 8 },
          { id: "b-pepsi-doza", name: "Pepsi la doză", desc: "", unit: "0,33 l", price: 6 },
          { id: "b-prigat", name: "Prigat", desc: "", unit: "0,5 l", price: 8 },
          { id: "b-nestea", name: "Nestea", desc: "", unit: "0,5 l", price: 8 },
          { id: "b-fruti-fresh", name: "Fruti Fresh la doză", desc: "", unit: "0,33 l", price: 5 },
        ],
      },
    ],
  },
];
