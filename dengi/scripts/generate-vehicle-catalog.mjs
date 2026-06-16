#!/usr/bin/env node
/**
 * Generates lib/auto-vehicles/catalog-data.ts from structured US market vehicle data.
 * Run: node scripts/generate-vehicle-catalog.mjs
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "../lib/auto-vehicles/catalog-data.ts");

/** @typedef {import("../lib/auto-vehicles/types.ts").VehicleSilhouetteId} Silhouette */

/** @typedef {{ model: string; silhouette: Silhouette; aliases: string[]; id?: string; trim?: string; imageModel?: string; localImage?: string }} VehicleDef */

/** @param {string} model @param {Silhouette} silhouette @param {string[]} aliases @param {{ id?: string; trim?: string; imageModel?: string; localImage?: string }} [opts] */
function v(model, silhouette, aliases, opts = {}) {
  return { model, silhouette, aliases, ...opts };
}

const MAKE_PREFIX = {
  "Acura": "acura",
  "Alfa Romeo": "alfa",
  "Aston Martin": "aston-martin",
  "Audi": "audi",
  "Bentley": "bentley",
  "BMW": "bmw",
  "Buick": "buick",
  "Cadillac": "cadillac",
  "Chevrolet": "chevy",
  "Chrysler": "chrysler",
  "Dodge": "dodge",
  "Ferrari": "ferrari",
  "Fiat": "fiat",
  "Ford": "ford",
  "Genesis": "genesis",
  "GMC": "gmc",
  "Honda": "honda",
  "Hyundai": "hyundai",
  "Ineos": "ineos",
  "Infiniti": "infiniti",
  "Jaguar": "jaguar",
  "Jeep": "jeep",
  "Kia": "kia",
  "Lamborghini": "lamborghini",
  "Land Rover": "land-rover",
  "Lexus": "lexus",
  "Lincoln": "lincoln",
  "Lotus": "lotus",
  "Lucid": "lucid",
  "Maserati": "maserati",
  "Mazda": "mazda",
  "McLaren": "mclaren",
  "Mercedes-Benz": "mercedes",
  "Mini": "mini",
  "Mitsubishi": "mitsubishi",
  "Nissan": "nissan",
  "Polestar": "polestar",
  "Porsche": "porsche",
  "Ram": "ram",
  "Rivian": "rivian",
  "Rolls-Royce": "rolls-royce",
  "Subaru": "subaru",
  "Tesla": "tesla",
  "Toyota": "toyota",
  "VinFast": "vinfast",
  "Volkswagen": "vw",
  "Volvo": "volvo",
  "Voltara": "voltara",
};

/** @type {{ make: string; vehicles: VehicleDef[] }[]} */
const CATALOG_BY_MAKE = [
  {
    make: "Voltara",
    vehicles: [
      v("Prism", "sport-coupe", ["prism", "voltara", "voltara prism"], { id: "voltara-prism", trim: "Coupe" }),
    ],
  },
  {
    make: "Acura",
    vehicles: [
      v("Integra", "sedan", ["integra", "acura integra"], { id: "acura-integra" }),
      v("Integra", "sedan", ["integra type s"], { trim: "Type S" }),
      v("TLX", "sedan", ["tlx", "acura tlx"], { id: "acura-tlx" }),
      v("TLX", "sedan", ["tlx type s"], { trim: "Type S" }),
      v("MDX", "suv-mid", ["mdx", "acura mdx"], { id: "acura-mdx" }),
      v("MDX", "suv-mid", ["mdx type s"], { trim: "Type S" }),
      v("RDX", "suv-compact", ["rdx", "acura rdx"], { id: "acura-rdx" }),
      v("ZDX", "suv-compact", ["zdx", "acura zdx"], { id: "acura-zdx" }),
      v("ADX", "suv-compact", ["adx", "acura adx"]),
      v("NSX", "sports-super", ["nsx", "acura nsx"]),
      v("ILX", "sedan", ["ilx", "acura ilx"]),
      v("RLX", "sedan", ["rlx", "acura rlx"]),
      v("TSX", "sedan", ["tsx", "acura tsx"]),
    ],
  },
  {
    make: "Alfa Romeo",
    vehicles: [
      v("Giulia", "sedan", ["giulia", "alfa giulia"], { id: "alfa-giulia" }),
      v("Stelvio", "suv-compact", ["stelvio"], { id: "alfa-stelvio" }),
      v("Tonale", "suv-compact", ["tonale"], { id: "alfa-tonale" }),
      v("4C", "sport-coupe", ["4c", "alfa 4c"]),
    ],
  },
  {
    make: "Aston Martin",
    vehicles: [
      v("DB12", "sport-coupe", ["db12", "aston martin db12"]),
      v("DBS", "sport-coupe", ["dbs", "aston martin dbs"]),
      v("Vantage", "sport-coupe", ["vantage", "aston martin vantage"]),
      v("DBX", "suv-mid", ["dbx", "aston martin dbx"]),
      v("DB11", "sport-coupe", ["db11"]),
      v("Vanquish", "sport-coupe", ["vanquish"]),
    ],
  },
  {
    make: "Audi",
    vehicles: [
      v("A3", "sedan", ["a3", "audi a3"], { id: "audi-a3" }),
      v("A4", "sedan", ["a4", "audi a4"], { id: "audi-a4" }),
      v("A5", "sport-coupe", ["a5", "audi a5", "a5 coupe"], { id: "audi-a5-coupe", trim: "Coupe", imageModel: "A5" }),
      v("A5", "hatchback", ["a5 sportback"], { id: "audi-a5-sportback", trim: "Sportback", imageModel: "A5" }),
      v("A6", "sedan", ["a6", "audi a6"], { id: "audi-a6" }),
      v("A7", "sedan", ["a7", "audi a7"], { id: "audi-a7" }),
      v("A8", "sedan", ["a8", "audi a8"], { id: "audi-a8" }),
      v("Q3", "suv-compact", ["q3", "audi q3"], { id: "audi-q3" }),
      v("Q4 e-tron", "suv-compact", ["q4", "q4 e-tron", "q4 etron"]),
      v("Q5", "suv-compact", ["q5", "audi q5"], { id: "audi-q5" }),
      v("Q7", "suv-mid", ["q7", "audi q7"], { id: "audi-q7" }),
      v("Q8", "suv-mid", ["q8", "audi q8"], { id: "audi-q8" }),
      v("e-tron", "suv-mid", ["e-tron", "etron", "audi etron"], { id: "audi-e-tron" }),
      v("e-tron GT", "sedan", ["e-tron gt", "etron gt"]),
      v("S3", "sedan", ["s3", "audi s3"]),
      v("S4", "sedan", ["s4", "audi s4"], { id: "audi-s4" }),
      v("S5", "sport-coupe", ["s5", "audi s5"]),
      v("S6", "sedan", ["s6", "audi s6"]),
      v("S7", "sedan", ["s7", "audi s7"]),
      v("S8", "sedan", ["s8", "audi s8"]),
      v("RS3", "sedan", ["rs3", "audi rs3"]),
      v("RS5", "sport-coupe", ["rs5", "audi rs5"], { id: "audi-rs5", trim: "Coupe" }),
      v("RS6", "wagon", ["rs6", "audi rs6"]),
      v("RS7", "sedan", ["rs7", "audi rs7"]),
      v("RS e-tron GT", "sedan", ["rs e-tron gt", "rs etron gt"]),
      v("SQ5", "suv-compact", ["sq5"]),
      v("SQ7", "suv-mid", ["sq7"]),
      v("SQ8", "suv-mid", ["sq8"]),
      v("TT", "sport-coupe", ["tt", "audi tt"]),
    ],
  },
  {
    make: "Bentley",
    vehicles: [
      v("Continental GT", "sport-coupe", ["continental gt", "bentley continental"]),
      v("Flying Spur", "sedan", ["flying spur", "bentley flying spur"]),
      v("Bentayga", "suv-mid", ["bentayga", "bentley bentayga"]),
      v("Mulsanne", "sedan", ["mulsanne"]),
    ],
  },
  {
    make: "BMW",
    vehicles: [
      v("2 Series", "sport-coupe", ["2 series", "bmw 2"], { id: "bmw-2-series" }),
      v("3 Series", "sedan", ["3 series", "bmw 3", "320", "330"], { id: "bmw-3-series" }),
      v("4 Series", "sport-coupe", ["4 series", "bmw 4"], { id: "bmw-4-series" }),
      v("5 Series", "sedan", ["5 series", "bmw 5"], { id: "bmw-5-series" }),
      v("7 Series", "sedan", ["7 series", "bmw 7"], { id: "bmw-7-series" }),
      v("8 Series", "sport-coupe", ["8 series", "bmw 8"]),
      v("X1", "suv-compact", ["x1", "bmw x1"], { id: "bmw-x1" }),
      v("X2", "suv-compact", ["x2", "bmw x2"]),
      v("X3", "suv-compact", ["x3", "bmw x3"], { id: "bmw-x3" }),
      v("X4", "suv-compact", ["x4", "bmw x4"]),
      v("X5", "suv-mid", ["x5", "bmw x5"], { id: "bmw-x5" }),
      v("X6", "suv-mid", ["x6", "bmw x6"]),
      v("X7", "suv-mid", ["x7", "bmw x7"], { id: "bmw-x7" }),
      v("XM", "suv-mid", ["xm", "bmw xm"]),
      v("Z4", "sport-coupe", ["z4", "bmw z4"], { id: "bmw-z4" }),
      v("M2", "sport-coupe", ["m2", "bmw m2"]),
      v("M3", "sedan", ["m3", "bmw m3"]),
      v("M4", "sport-coupe", ["m4", "bmw m4"], { id: "bmw-m4" }),
      v("M5", "sedan", ["m5", "bmw m5"]),
      v("M8", "sport-coupe", ["m8", "bmw m8"]),
      v("i4", "sedan", ["i4", "bmw i4"], { id: "bmw-i4" }),
      v("i5", "sedan", ["i5", "bmw i5"]),
      v("i7", "sedan", ["i7", "bmw i7"]),
      v("iX", "suv-mid", ["ix", "bmw ix"], { id: "bmw-ix" }),
      v("iX1", "suv-compact", ["ix1"]),
      v("iX3", "suv-compact", ["ix3"]),
    ],
  },
  {
    make: "Buick",
    vehicles: [
      v("Encore GX", "suv-compact", ["encore gx", "encore"], { id: "buick-encore-gx" }),
      v("Envision", "suv-compact", ["envision"], { id: "buick-envision" }),
      v("Enclave", "suv-mid", ["enclave"], { id: "buick-enclave" }),
      v("Encore", "suv-compact", ["encore"]),
      v("LaCrosse", "sedan", ["lacrosse"]),
      v("Regal", "sedan", ["regal", "buick regal"]),
      v("Verano", "sedan", ["verano"]),
    ],
  },
  {
    make: "Cadillac",
    vehicles: [
      v("CT4", "sedan", ["ct4", "cadillac ct4"], { id: "cadillac-ct4" }),
      v("CT5", "sedan", ["ct5", "cadillac ct5"], { id: "cadillac-ct5" }),
      v("XT4", "suv-compact", ["xt4"], { id: "cadillac-xt4" }),
      v("XT5", "suv-compact", ["xt5"], { id: "cadillac-xt5" }),
      v("XT6", "suv-mid", ["xt6"], { id: "cadillac-xt6" }),
      v("Escalade", "suv-mid", ["escalade"], { id: "cadillac-escalade" }),
      v("Lyriq", "suv-mid", ["lyriq", "cadillac lyriq"], { id: "cadillac-lyriq" }),
      v("Celestiq", "sedan", ["celestiq"]),
      v("Optiq", "suv-compact", ["optiq", "cadillac optiq"]),
      v("Vistiq", "suv-mid", ["vistiq"]),
      v("CT6", "sedan", ["ct6"]),
      v("ATS", "sedan", ["ats"]),
      v("CTS", "sedan", ["cts"]),
      v("XTS", "sedan", ["xts"]),
      v("SRX", "suv-compact", ["srx"]),
      v("ELR", "sport-coupe", ["elr"]),
    ],
  },
  {
    make: "Chevrolet",
    vehicles: [
      v("Malibu", "sedan", ["malibu", "chevy malibu"], { id: "chevy-malibu" }),
      v("Equinox", "suv-compact", ["equinox"], { id: "chevy-equinox" }),
      v("Equinox EV", "suv-compact", ["equinox ev"]),
      v("Blazer", "suv-compact", ["blazer"], { id: "chevy-blazer" }),
      v("Blazer EV", "suv-compact", ["blazer ev"]),
      v("Traverse", "suv-mid", ["traverse"], { id: "chevy-traverse" }),
      v("Tahoe", "suv-mid", ["tahoe"], { id: "chevy-tahoe" }),
      v("Suburban", "suv-mid", ["suburban"], { id: "chevy-suburban" }),
      v("Trax", "suv-compact", ["trax"], { id: "chevy-trax" }),
      v("Silverado", "truck", ["silverado"], { id: "chevy-silverado" }),
      v("Silverado EV", "truck", ["silverado ev"]),
      v("Colorado", "truck", ["colorado"], { id: "chevy-colorado" }),
      v("Camaro", "sport-coupe", ["camaro"], { id: "chevy-camaro" }),
      v("Corvette", "sports-super", ["corvette"], { id: "chevy-corvette" }),
      v("Bolt EUV", "hatchback", ["bolt", "bolt euv"], { id: "chevy-bolt" }),
      v("Bolt EV", "hatchback", ["bolt ev"]),
      v("Express", "truck", ["express", "chevy express", "chevrolet express"]),
      v("Impala", "sedan", ["impala"]),
      v("Cruze", "sedan", ["cruze"]),
      v("Sonic", "sedan", ["sonic"]),
      v("Spark", "hatchback", ["spark"]),
      v("Volt", "hatchback", ["volt", "chevy volt"]),
      v("Trailblazer", "suv-compact", ["trailblazer"]),
    ],
  },
  {
    make: "Chrysler",
    vehicles: [
      v("Pacifica", "suv-mid", ["pacifica", "chrysler pacifica"], { id: "chrysler-pacifica" }),
      v("300", "sedan", ["300", "chrysler 300"], { id: "chrysler-300" }),
      v("Voyager", "suv-mid", ["voyager", "chrysler voyager"]),
      v("Town & Country", "suv-mid", ["town and country", "town & country"]),
      v("200", "sedan", ["chrysler 200"]),
    ],
  },
  {
    make: "Dodge",
    vehicles: [
      v("Charger", "sedan", ["charger", "dodge charger"], { id: "dodge-charger" }),
      v("Challenger", "sport-coupe", ["challenger"], { id: "dodge-challenger" }),
      v("Durango", "suv-mid", ["durango"], { id: "dodge-durango" }),
      v("Hornet", "suv-compact", ["hornet", "dodge hornet"], { id: "dodge-hornet" }),
      v("Journey", "suv-compact", ["journey"]),
      v("Grand Caravan", "suv-mid", ["grand caravan"]),
      v("Dart", "sedan", ["dart", "dodge dart"]),
      v("Avenger", "sedan", ["avenger"]),
      v("Viper", "sports-super", ["viper", "dodge viper"]),
    ],
  },
  {
    make: "Ferrari",
    vehicles: [
      v("Roma", "sport-coupe", ["roma", "ferrari roma"]),
      v("Portofino", "sport-coupe", ["portofino", "portofino m"]),
      v("296 GTB", "sport-coupe", ["296", "296 gtb"]),
      v("SF90", "sports-super", ["sf90", "sf90 stradale"]),
      v("Purosangue", "suv-mid", ["purosangue"]),
      v("812 Superfast", "sports-super", ["812", "812 superfast"]),
      v("F8", "sports-super", ["f8", "f8 tributo"]),
      v("488", "sports-super", ["488"]),
    ],
  },
  {
    make: "Fiat",
    vehicles: [
      v("500e", "hatchback", ["500e", "fiat 500"], { id: "fiat-500e" }),
      v("500", "hatchback", ["fiat 500", "500"]),
      v("500L", "suv-compact", ["500l"]),
      v("500X", "suv-compact", ["500x"]),
      v("124 Spider", "sport-coupe", ["124 spider", "fiat 124"]),
    ],
  },
  {
    make: "Ford",
    vehicles: [
      v("Mustang", "sport-coupe", ["mustang"], { id: "ford-mustang" }),
      v("Mustang Mach-E", "suv-compact", ["mach-e", "mach e", "mustang mach-e"], { id: "ford-mustang-mach-e" }),
      v("Focus", "hatchback", ["focus", "ford focus"], { id: "ford-focus" }),
      v("Fusion", "sedan", ["fusion", "ford fusion"], { id: "ford-fusion" }),
      v("Escape", "suv-compact", ["escape"], { id: "ford-escape" }),
      v("Bronco", "suv-compact", ["bronco"], { id: "ford-bronco" }),
      v("Bronco Sport", "suv-compact", ["bronco sport"], { id: "ford-bronco-sport" }),
      v("Edge", "suv-compact", ["edge"], { id: "ford-edge" }),
      v("Explorer", "suv-mid", ["explorer"], { id: "ford-explorer" }),
      v("Expedition", "suv-mid", ["expedition"], { id: "ford-expedition" }),
      v("Maverick", "truck", ["maverick"], { id: "ford-maverick" }),
      v("Ranger", "truck", ["ranger"], { id: "ford-ranger" }),
      v("F-150", "truck", ["f-150", "f150"], { id: "ford-f150" }),
      v("F-150 Lightning", "truck", ["f-150 lightning", "f150 lightning"]),
      v("Super Duty", "truck", ["super duty", "f-250", "f-350", "f250", "f350"]),
      v("Transit", "truck", ["transit", "ford transit"]),
      v("E-Transit", "truck", ["e-transit", "etransit", "ford e-transit"]),
      v("Transit Connect", "truck", ["transit connect"]),
      v("Fiesta", "hatchback", ["fiesta"]),
      v("Taurus", "sedan", ["taurus"]),
      v("Flex", "suv-mid", ["flex"]),
      v("C-Max", "hatchback", ["c-max", "cmax"]),
    ],
  },
  {
    make: "Genesis",
    vehicles: [
      v("G70", "sedan", ["g70", "genesis g70"], { id: "genesis-g70" }),
      v("G80", "sedan", ["g80"], { id: "genesis-g80" }),
      v("G90", "sedan", ["g90"], { id: "genesis-g90" }),
      v("GV60", "suv-compact", ["gv60"]),
      v("GV70", "suv-compact", ["gv70"], { id: "genesis-gv70" }),
      v("GV80", "suv-mid", ["gv80"], { id: "genesis-gv80" }),
      v("Electrified G80", "sedan", ["electrified g80"]),
      v("Electrified GV70", "suv-compact", ["electrified gv70"]),
    ],
  },
  {
    make: "GMC",
    vehicles: [
      v("Terrain", "suv-compact", ["terrain"], { id: "gmc-terrain" }),
      v("Acadia", "suv-mid", ["acadia"], { id: "gmc-acadia" }),
      v("Yukon", "suv-mid", ["yukon"], { id: "gmc-yukon" }),
      v("Yukon XL", "suv-mid", ["yukon xl"]),
      v("Canyon", "truck", ["canyon", "gmc canyon"], { id: "gmc-canyon" }),
      v("Sierra", "truck", ["sierra"], { id: "gmc-sierra" }),
      v("Sierra EV", "truck", ["sierra ev"]),
      v("Hummer EV", "truck", ["hummer ev", "gmc hummer"]),
      v("Savana", "truck", ["savana", "gmc savana"]),
    ],
  },
  {
    make: "Honda",
    vehicles: [
      v("Civic", "sedan", ["civic", "honda civic"], { id: "honda-civic" }),
      v("Accord", "sedan", ["accord"], { id: "honda-accord" }),
      v("Insight", "sedan", ["insight"], { id: "honda-insight" }),
      v("CR-V", "suv-compact", ["cr-v", "crv"], { id: "honda-crv" }),
      v("HR-V", "suv-compact", ["hr-v", "hrv"], { id: "honda-hrv" }),
      v("Pilot", "suv-mid", ["pilot"], { id: "honda-pilot" }),
      v("Passport", "suv-mid", ["passport"], { id: "honda-passport" }),
      v("Odyssey", "suv-mid", ["odyssey", "honda odyssey"], { id: "honda-odyssey" }),
      v("Ridgeline", "truck", ["ridgeline"], { id: "honda-ridgeline" }),
      v("Prologue", "suv-compact", ["prologue"], { id: "honda-prologue" }),
      v("Fit", "hatchback", ["fit", "honda fit"]),
      v("Element", "suv-compact", ["element"]),
      v("S2000", "sport-coupe", ["s2000"]),
      v("Prelude", "sport-coupe", ["prelude"]),
    ],
  },
  {
    make: "Hyundai",
    vehicles: [
      v("Elantra", "sedan", ["elantra"], { id: "hyundai-elantra" }),
      v("Sonata", "sedan", ["sonata"], { id: "hyundai-sonata" }),
      v("Kona", "suv-compact", ["kona"], { id: "hyundai-kona" }),
      v("Kona Electric", "suv-compact", ["kona electric", "kona ev"]),
      v("Tucson", "suv-compact", ["tucson"], { id: "hyundai-tucson" }),
      v("Santa Fe", "suv-mid", ["santa fe"], { id: "hyundai-santa-fe" }),
      v("Palisade", "suv-mid", ["palisade"], { id: "hyundai-palisade" }),
      v("Venue", "suv-compact", ["venue"], { id: "hyundai-venue" }),
      v("Ioniq 5", "suv-compact", ["ioniq 5", "ioniq5"], { id: "hyundai-ioniq-5" }),
      v("Ioniq 6", "sedan", ["ioniq 6", "ioniq6"], { id: "hyundai-ioniq-6" }),
      v("Ioniq 9", "suv-mid", ["ioniq 9", "ioniq9"]),
      v("Santa Cruz", "truck", ["santa cruz"], { id: "hyundai-santa-cruz" }),
      v("Accent", "sedan", ["accent"]),
      v("Veloster", "hatchback", ["veloster"]),
      v("Azera", "sedan", ["azera"]),
      v("Genesis Coupe", "sport-coupe", ["genesis coupe"]),
    ],
  },
  {
    make: "Ineos",
    vehicles: [
      v("Grenadier", "suv-mid", ["grenadier", "ineos grenadier"]),
    ],
  },
  {
    make: "Infiniti",
    vehicles: [
      v("Q50", "sedan", ["q50", "infiniti q50"], { id: "infiniti-q50" }),
      v("Q60", "sport-coupe", ["q60"]),
      v("QX50", "suv-compact", ["qx50"], { id: "infiniti-qx50" }),
      v("QX55", "suv-compact", ["qx55"]),
      v("QX60", "suv-mid", ["qx60"], { id: "infiniti-qx60" }),
      v("QX80", "suv-mid", ["qx80"], { id: "infiniti-qx80" }),
      v("G37", "sedan", ["g37"]),
      v("FX35", "suv-compact", ["fx35", "fx"]),
      v("EX35", "suv-compact", ["ex35"]),
    ],
  },
  {
    make: "Jaguar",
    vehicles: [
      v("XF", "sedan", ["xf", "jaguar xf"], { id: "jaguar-xf" }),
      v("XE", "sedan", ["xe", "jaguar xe"]),
      v("F-PACE", "suv-compact", ["f-pace", "fpace"], { id: "jaguar-f-pace" }),
      v("E-PACE", "suv-compact", ["e-pace", "epace"]),
      v("I-PACE", "suv-compact", ["i-pace", "ipace"], { id: "jaguar-i-pace" }),
      v("F-TYPE", "sport-coupe", ["f-type", "ftype"]),
      v("XJ", "sedan", ["xj", "jaguar xj"]),
    ],
  },
  {
    make: "Jeep",
    vehicles: [
      v("Renegade", "suv-compact", ["renegade"], { id: "jeep-renegade" }),
      v("Compass", "suv-compact", ["compass"], { id: "jeep-compass" }),
      v("Cherokee", "suv-compact", ["cherokee"], { id: "jeep-cherokee" }),
      v("Wrangler", "suv-compact", ["wrangler"], { id: "jeep-wrangler" }),
      v("Grand Cherokee", "suv-mid", ["grand cherokee"], { id: "jeep-grand-cherokee" }),
      v("Grand Wagoneer", "suv-mid", ["grand wagoneer"]),
      v("Wagoneer", "suv-mid", ["wagoneer"], { id: "jeep-wagoneer" }),
      v("Gladiator", "truck", ["gladiator"], { id: "jeep-gladiator" }),
      v("Commander", "suv-mid", ["commander"]),
      v("Patriot", "suv-compact", ["patriot"]),
      v("Liberty", "suv-compact", ["liberty"]),
    ],
  },
  {
    make: "Kia",
    vehicles: [
      v("Forte", "sedan", ["forte", "kia forte"], { id: "kia-forte" }),
      v("K5", "sedan", ["k5", "kia k5", "optima"], { id: "kia-k5" }),
      v("Soul", "hatchback", ["soul"], { id: "kia-soul" }),
      v("Seltos", "suv-compact", ["seltos"], { id: "kia-seltos" }),
      v("Sportage", "suv-compact", ["sportage"], { id: "kia-sportage" }),
      v("Sorento", "suv-mid", ["sorento"], { id: "kia-sorento" }),
      v("Telluride", "suv-mid", ["telluride"], { id: "kia-telluride" }),
      v("Niro", "suv-compact", ["niro"], { id: "kia-niro" }),
      v("EV6", "suv-compact", ["ev6"], { id: "kia-ev6" }),
      v("EV9", "suv-mid", ["ev9"], { id: "kia-ev9" }),
      v("EV3", "suv-compact", ["ev3"]),
      v("Carnival", "suv-mid", ["carnival", "kia carnival"], { id: "kia-carnival" }),
      v("Stinger", "sedan", ["stinger"], { id: "kia-stinger" }),
      v("Rio", "sedan", ["rio"]),
      v("Cadenza", "sedan", ["cadenza"]),
      v("K900", "sedan", ["k900"]),
    ],
  },
  {
    make: "Lamborghini",
    vehicles: [
      v("Huracán", "sports-super", ["huracan", "huracán", "lamborghini huracan"]),
      v("Urus", "suv-mid", ["urus", "lamborghini urus"]),
      v("Revuelto", "sports-super", ["revuelto"]),
      v("Aventador", "sports-super", ["aventador"]),
      v("Gallardo", "sports-super", ["gallardo"]),
    ],
  },
  {
    make: "Land Rover",
    vehicles: [
      v("Defender", "suv-mid", ["defender"], { id: "land-rover-defender" }),
      v("Discovery", "suv-mid", ["discovery"], { id: "land-rover-discovery" }),
      v("Discovery Sport", "suv-compact", ["discovery sport"]),
      v("Range Rover", "suv-mid", ["range rover"], { id: "land-rover-range-rover" }),
      v("Range Rover Sport", "suv-mid", ["range rover sport"], { id: "land-rover-range-rover-sport" }),
      v("Range Rover Velar", "suv-compact", ["velar", "range rover velar"]),
      v("Range Rover Evoque", "suv-compact", ["evoque", "range rover evoque"], { id: "land-rover-evoque" }),
    ],
  },
  {
    make: "Lexus",
    vehicles: [
      v("IS", "sedan", ["is", "lexus is"], { id: "lexus-is" }),
      v("ES", "sedan", ["lexus es", "es"], { id: "lexus-es" }),
      v("UX", "suv-compact", ["ux", "lexus ux"], { id: "lexus-ux" }),
      v("NX", "suv-compact", ["nx", "lexus nx"], { id: "lexus-nx" }),
      v("RX", "suv-mid", ["lexus rx", "rx"], { id: "lexus-rx" }),
      v("TX", "suv-mid", ["tx", "lexus tx"], { id: "lexus-tx" }),
      v("GX", "suv-mid", ["gx", "lexus gx"], { id: "lexus-gx" }),
      v("LX", "suv-mid", ["lx", "lexus lx"], { id: "lexus-lx" }),
      v("LC", "sport-coupe", ["lc", "lexus lc"], { id: "lexus-lc" }),
      v("RC", "sport-coupe", ["rc", "lexus rc"]),
      v("RZ", "suv-compact", ["rz", "lexus rz"]),
      v("LFA", "sports-super", ["lfa"]),
      v("CT", "hatchback", ["ct", "ct200h"]),
      v("GS", "sedan", ["gs", "lexus gs"]),
      v("HS", "sedan", ["hs"]),
    ],
  },
  {
    make: "Lincoln",
    vehicles: [
      v("Corsair", "suv-compact", ["corsair"], { id: "lincoln-corsair" }),
      v("Nautilus", "suv-compact", ["nautilus"], { id: "lincoln-nautilus" }),
      v("Aviator", "suv-mid", ["aviator"], { id: "lincoln-aviator" }),
      v("Navigator", "suv-mid", ["navigator"], { id: "lincoln-navigator" }),
      v("MKZ", "sedan", ["mkz"]),
      v("Continental", "sedan", ["continental", "lincoln continental"]),
      v("MKT", "suv-mid", ["mkt"]),
      v("MKC", "suv-compact", ["mkc"]),
      v("MKX", "suv-compact", ["mkx"]),
    ],
  },
  {
    make: "Lotus",
    vehicles: [
      v("Emira", "sport-coupe", ["emira", "lotus emira"]),
      v("Eletre", "suv-mid", ["eletre", "lotus eletre"]),
      v("Evora", "sport-coupe", ["evora"]),
      v("Elise", "sport-coupe", ["elise"]),
      v("Exige", "sport-coupe", ["exige"]),
    ],
  },
  {
    make: "Lucid",
    vehicles: [
      v("Air", "sedan", ["lucid air", "air"], { id: "lucid-air" }),
      v("Gravity", "suv-mid", ["gravity", "lucid gravity"]),
    ],
  },
  {
    make: "Maserati",
    vehicles: [
      v("Ghibli", "sedan", ["ghibli", "maserati ghibli"]),
      v("Quattroporte", "sedan", ["quattroporte"]),
      v("Levante", "suv-mid", ["levante"]),
      v("Grecale", "suv-compact", ["grecale"]),
      v("GranTurismo", "sport-coupe", ["granturismo", "gran turismo"]),
      v("GranCabrio", "sport-coupe", ["grancabrio", "gran cabrio"]),
      v("MC20", "sports-super", ["mc20"]),
    ],
  },
  {
    make: "Mazda",
    vehicles: [
      v("Mazda3", "sedan", ["mazda3", "mazda 3"], { id: "mazda-mazda3" }),
      v("Mazda6", "sedan", ["mazda6", "mazda 6"], { id: "mazda-mazda6" }),
      v("CX-30", "suv-compact", ["cx-30", "cx30"], { id: "mazda-cx30" }),
      v("CX-5", "suv-compact", ["cx-5", "cx5"], { id: "mazda-cx5" }),
      v("CX-50", "suv-compact", ["cx-50", "cx50"], { id: "mazda-cx50" }),
      v("CX-70", "suv-mid", ["cx-70", "cx70"]),
      v("CX-90", "suv-mid", ["cx-90", "cx90"], { id: "mazda-cx90" }),
      v("MX-5 Miata", "sport-coupe", ["miata", "mx-5", "mx5"]),
      v("MX-30", "suv-compact", ["mx-30", "mx30"]),
      v("RX-8", "sport-coupe", ["rx-8", "rx8"]),
    ],
  },
  {
    make: "McLaren",
    vehicles: [
      v("Artura", "sports-super", ["artura", "mclaren artura"]),
      v("750S", "sports-super", ["750s"]),
      v("720S", "sports-super", ["720s"]),
      v("GT", "sport-coupe", ["mclaren gt"]),
      v("570S", "sports-super", ["570s"]),
      v("765LT", "sports-super", ["765lt"]),
    ],
  },
  {
    make: "Mercedes-Benz",
    vehicles: [
      v("A-Class", "sedan", ["a-class", "a class"], { id: "mercedes-a-class" }),
      v("C-Class", "sedan", ["c-class", "c class", "c300"], { id: "mercedes-c-class" }),
      v("CLA", "sedan", ["cla", "mercedes cla"]),
      v("CLE", "sport-coupe", ["cle", "mercedes cle"]),
      v("E-Class", "sedan", ["e-class", "e class"], { id: "mercedes-e-class" }),
      v("S-Class", "sedan", ["s-class", "s class"], { id: "mercedes-s-class" }),
      v("GLA", "suv-compact", ["gla"], { id: "mercedes-gla" }),
      v("GLB", "suv-compact", ["glb", "mercedes glb"]),
      v("GLC", "suv-compact", ["glc"], { id: "mercedes-glc" }),
      v("GLE", "suv-mid", ["gle"], { id: "mercedes-gle" }),
      v("GLS", "suv-mid", ["gls"], { id: "mercedes-gls" }),
      v("G-Class", "suv-mid", ["g-class", "g wagon", "g-wagon"], { id: "mercedes-g-class" }),
      v("EQS", "sedan", ["eqs"], { id: "mercedes-eqs" }),
      v("EQE", "sedan", ["eqe"], { id: "mercedes-eqe" }),
      v("EQB", "suv-compact", ["eqb", "mercedes eqb"]),
      v("EQS SUV", "suv-mid", ["eqs suv"]),
      v("EQE SUV", "suv-mid", ["eqe suv"]),
      v("AMG GT", "sports-super", ["amg gt", "mercedes amg gt"]),
      v("SL", "sport-coupe", ["sl", "mercedes sl"]),
      v("Sprinter", "truck", ["sprinter", "mercedes sprinter", "mercedes-benz sprinter"]),
      v("eSprinter", "truck", ["esprinter", "e-sprinter", "mercedes esprinter"]),
      v("Metris", "truck", ["metris", "mercedes metris"]),
      v("Maybach S-Class", "sedan", ["maybach", "maybach s-class", "mercedes maybach"]),
      v("Maybach GLS", "suv-mid", ["maybach gls"]),
      v("CLS", "sedan", ["cls"]),
      v("SLC", "sport-coupe", ["slc"]),
    ],
  },
  {
    make: "Mini",
    vehicles: [
      v("Cooper", "hatchback", ["mini cooper", "cooper"], { id: "mini-cooper" }),
      v("Countryman", "suv-compact", ["countryman", "mini countryman"], { id: "mini-countryman" }),
      v("Clubman", "wagon", ["clubman"]),
      v("Convertible", "hatchback", ["mini convertible"]),
    ],
  },
  {
    make: "Mitsubishi",
    vehicles: [
      v("Mirage", "hatchback", ["mirage"], { id: "mitsubishi-mirage" }),
      v("Outlander", "suv-compact", ["outlander"], { id: "mitsubishi-outlander" }),
      v("Outlander Sport", "suv-compact", ["outlander sport"]),
      v("Eclipse Cross", "suv-compact", ["eclipse cross"], { id: "mitsubishi-eclipse-cross" }),
      v("Lancer", "sedan", ["lancer", "evo", "lancer evolution"]),
      v("Montero", "suv-mid", ["montero"]),
    ],
  },
  {
    make: "Nissan",
    vehicles: [
      v("Versa", "sedan", ["versa"], { id: "nissan-versa" }),
      v("Sentra", "sedan", ["sentra"], { id: "nissan-sentra" }),
      v("Altima", "sedan", ["altima"], { id: "nissan-altima" }),
      v("Maxima", "sedan", ["maxima"], { id: "nissan-maxima" }),
      v("Kicks", "suv-compact", ["kicks"], { id: "nissan-kicks" }),
      v("Rogue", "suv-compact", ["rogue"], { id: "nissan-rogue" }),
      v("Rogue Sport", "suv-compact", ["rogue sport"]),
      v("Murano", "suv-compact", ["murano"], { id: "nissan-murano" }),
      v("Pathfinder", "suv-mid", ["pathfinder"], { id: "nissan-pathfinder" }),
      v("Armada", "suv-mid", ["armada"], { id: "nissan-armada" }),
      v("Leaf", "hatchback", ["leaf"], { id: "nissan-leaf" }),
      v("Ariya", "suv-compact", ["ariya"], { id: "nissan-ariya" }),
      v("Frontier", "truck", ["frontier"], { id: "nissan-frontier" }),
      v("Titan", "truck", ["titan", "nissan titan"]),
      v("Z", "sport-coupe", ["370z", "nissan z", "z car"], { id: "nissan-z" }),
      v("GT-R", "sports-super", ["gtr", "gt-r", "nissan gtr"]),
      v("NV200", "truck", ["nv200"]),
      v("NV Passenger", "truck", ["nv passenger", "nv3500"]),
      v("NV Cargo", "truck", ["nv cargo", "nv1500", "nv2500"]),
      v("Cube", "hatchback", ["cube"]),
      v("Juke", "suv-compact", ["juke"]),
      v("Xterra", "suv-compact", ["xterra"]),
    ],
  },
  {
    make: "Polestar",
    vehicles: [
      v("2", "sedan", ["polestar 2"], { id: "polestar-2" }),
      v("3", "suv-mid", ["polestar 3"], { id: "polestar-3" }),
      v("4", "suv-compact", ["polestar 4"]),
    ],
  },
  {
    make: "Porsche",
    vehicles: [
      v("718", "sport-coupe", ["718", "boxster", "cayman"], { id: "porsche-718" }),
      v("911", "sports-super", ["911", "porsche 911"], { id: "porsche-911" }),
      v("Panamera", "sedan", ["panamera"], { id: "porsche-panamera" }),
      v("Taycan", "sedan", ["taycan"], { id: "porsche-taycan" }),
      v("Macan", "suv-compact", ["macan"], { id: "porsche-macan" }),
      v("Cayenne", "suv-mid", ["cayenne"], { id: "porsche-cayenne" }),
      v("918 Spyder", "sports-super", ["918"]),
    ],
  },
  {
    make: "Ram",
    vehicles: [
      v("1500", "truck", ["ram 1500"], { id: "ram-1500" }),
      v("2500", "truck", ["ram 2500"], { id: "ram-2500" }),
      v("3500", "truck", ["ram 3500"]),
      v("ProMaster", "truck", ["promaster", "ram promaster"], { id: "ram-promaster" }),
      v("ProMaster City", "truck", ["promaster city"]),
    ],
  },
  {
    make: "Rivian",
    vehicles: [
      v("R1T", "truck", ["r1t", "rivian r1t"], { id: "rivian-r1t" }),
      v("R1S", "suv-mid", ["r1s", "rivian r1s"], { id: "rivian-r1s" }),
    ],
  },
  {
    make: "Rolls-Royce",
    vehicles: [
      v("Ghost", "sedan", ["ghost", "rolls-royce ghost"]),
      v("Phantom", "sedan", ["phantom", "rolls royce phantom"]),
      v("Cullinan", "suv-mid", ["cullinan"]),
      v("Spectre", "sport-coupe", ["spectre", "rolls-royce spectre"]),
      v("Wraith", "sport-coupe", ["wraith"]),
      v("Dawn", "sport-coupe", ["dawn"]),
    ],
  },
  {
    make: "Subaru",
    vehicles: [
      v("Impreza", "sedan", ["impreza"], { id: "subaru-impreza" }),
      v("Legacy", "sedan", ["legacy"], { id: "subaru-legacy" }),
      v("WRX", "sedan", ["wrx"], { id: "subaru-wrx" }),
      v("Crosstrek", "suv-compact", ["crosstrek"], { id: "subaru-crosstrek" }),
      v("Forester", "suv-compact", ["forester"], { id: "subaru-forester" }),
      v("Outback", "wagon", ["outback"], { id: "subaru-outback" }),
      v("Ascent", "suv-mid", ["ascent"], { id: "subaru-ascent" }),
      v("BRZ", "sport-coupe", ["brz"], { id: "subaru-brz" }),
      v("Solterra", "suv-compact", ["solterra"]),
      v("Tribeca", "suv-mid", ["tribeca"]),
      v("Baja", "truck", ["baja"]),
    ],
  },
  {
    make: "Tesla",
    vehicles: [
      v("Model 3", "sedan", ["model 3", "model3"], { id: "tesla-model-3" }),
      v("Model S", "sedan", ["model s"], { id: "tesla-model-s" }),
      v("Model X", "suv-mid", ["model x"], { id: "tesla-model-x" }),
      v("Model Y", "suv-compact", ["model y", "modely"], { id: "tesla-model-y" }),
      v("Cybertruck", "truck", ["cybertruck"], { id: "tesla-cybertruck" }),
    ],
  },
  {
    make: "Toyota",
    vehicles: [
      v("Corolla", "sedan", ["corolla"], { id: "toyota-corolla" }),
      v("Corolla Cross", "suv-compact", ["corolla cross"], { id: "toyota-corolla-cross" }),
      v("Camry", "sedan", ["camry", "toyota camry"], { id: "toyota-camry" }),
      v("Prius", "hatchback", ["prius"], { id: "toyota-prius" }),
      v("Crown", "sedan", ["crown", "toyota crown"], { id: "toyota-crown" }),
      v("GR86", "sport-coupe", ["gr86", "86"], { id: "toyota-gr86" }),
      v("GR Corolla", "hatchback", ["gr corolla"]),
      v("Supra", "sport-coupe", ["supra", "toyota supra"]),
      v("RAV4", "suv-compact", ["rav4", "rav 4"], { id: "toyota-rav4" }),
      v("Venza", "suv-compact", ["venza"], { id: "toyota-venza" }),
      v("Highlander", "suv-mid", ["highlander"], { id: "toyota-highlander" }),
      v("4Runner", "suv-mid", ["4runner", "4 runner"], { id: "toyota-4runner" }),
      v("Sequoia", "suv-mid", ["sequoia"], { id: "toyota-sequoia" }),
      v("Sienna", "suv-mid", ["sienna"], { id: "toyota-sienna" }),
      v("Tacoma", "truck", ["tacoma"], { id: "toyota-tacoma" }),
      v("Tundra", "truck", ["tundra"], { id: "toyota-tundra" }),
      v("bZ4X", "suv-compact", ["bz4x", "bz4"], { id: "toyota-bz4x" }),
      v("Land Cruiser", "suv-mid", ["land cruiser"]),
      v("Mirai", "sedan", ["mirai"]),
      v("Avalon", "sedan", ["avalon"]),
      v("Yaris", "hatchback", ["yaris"]),
      v("Matrix", "hatchback", ["matrix"]),
      v("FJ Cruiser", "suv-compact", ["fj cruiser"]),
      v("C-HR", "suv-compact", ["c-hr", "chr"]),
      v("Celica", "sport-coupe", ["celica"]),
    ],
  },
  {
    make: "VinFast",
    vehicles: [
      v("VF 8", "suv-mid", ["vf8", "vf 8", "vinfast vf8"]),
      v("VF 9", "suv-mid", ["vf9", "vf 9", "vinfast vf9"]),
      v("VF 7", "suv-compact", ["vf7", "vf 7"]),
    ],
  },
  {
    make: "Volkswagen",
    vehicles: [
      v("Golf", "hatchback", ["golf"], { id: "vw-golf" }),
      v("Jetta", "sedan", ["jetta"], { id: "vw-jetta" }),
      v("Passat", "sedan", ["passat"], { id: "vw-passat" }),
      v("Arteon", "sedan", ["arteon"], { id: "vw-arteon" }),
      v("Taos", "suv-compact", ["taos"], { id: "vw-taos" }),
      v("Tiguan", "suv-compact", ["tiguan"], { id: "vw-tiguan" }),
      v("Atlas", "suv-mid", ["atlas"], { id: "vw-atlas" }),
      v("Atlas Cross Sport", "suv-mid", ["atlas cross sport"], { id: "vw-atlas-cross-sport" }),
      v("ID.4", "suv-compact", ["id.4", "id4"], { id: "vw-id4" }),
      v("ID.Buzz", "suv-mid", ["id.buzz", "idbuzz", "id buzz"]),
      v("Beetle", "hatchback", ["beetle", "vw beetle"]),
      v("CC", "sedan", ["cc", "volkswagen cc"]),
      v("GTI", "hatchback", ["gti", "golf gti"]),
      v("R32", "hatchback", ["r32"]),
    ],
  },
  {
    make: "Volvo",
    vehicles: [
      v("S60", "sedan", ["s60"], { id: "volvo-s60" }),
      v("S90", "sedan", ["s90"], { id: "volvo-s90" }),
      v("V60", "wagon", ["v60"], { id: "volvo-v60" }),
      v("V90", "wagon", ["v90"]),
      v("XC40", "suv-compact", ["xc40"], { id: "volvo-xc40" }),
      v("XC60", "suv-compact", ["xc60"], { id: "volvo-xc60" }),
      v("XC90", "suv-mid", ["xc90"], { id: "volvo-xc90" }),
      v("EX30", "suv-compact", ["ex30"], { id: "volvo-ex30" }),
      v("EX90", "suv-mid", ["ex90"], { id: "volvo-ex90" }),
      v("C40", "suv-compact", ["c40", "c40 recharge"]),
      v("S40", "sedan", ["s40"]),
      v("XC70", "wagon", ["xc70"]),
    ],
  },
];

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildId(make, vehicle) {
  if (vehicle.id) return vehicle.id;
  const prefix = MAKE_PREFIX[make] ?? slugify(make);
  const parts = [prefix, slugify(vehicle.model)];
  if (vehicle.trim) parts.push(slugify(vehicle.trim));
  return parts.join("-");
}

function escapeString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function formatAliases(aliases) {
  return `[${aliases.map((a) => `"${escapeString(a)}"`).join(", ")}]`;
}

function formatEntryCall(make, vehicle, id) {
  const args = [
    `"${escapeString(id)}"`,
    `"${escapeString(make)}"`,
    `"${escapeString(vehicle.model)}"`,
    `"${vehicle.silhouette}"`,
    formatAliases(vehicle.aliases),
  ];
  if (vehicle.trim || vehicle.imageModel || vehicle.localImage) {
    args.push(vehicle.trim ? `"${escapeString(vehicle.trim)}"` : "undefined");
  }
  if (vehicle.imageModel) args.push(`"${escapeString(vehicle.imageModel)}"`);
  if (vehicle.localImage) args.push(`"${escapeString(vehicle.localImage)}"`);
  return `  entry(${args.join(", ")})`;
}

function generate() {
  const seenIds = new Map();
  const lines = [];

  for (const { make, vehicles } of CATALOG_BY_MAKE) {
    lines.push("", `  // —— ${make} ——`);
    for (const vehicle of vehicles) {
      const id = buildId(make, vehicle);
      if (seenIds.has(id)) {
        throw new Error(`Duplicate catalog id "${id}" for ${make} ${vehicle.model}`);
      }
      seenIds.set(id, `${make} ${vehicle.model}`);
      lines.push(`${formatEntryCall(make, vehicle, id)},`);
    }
  }

  const output = `// AUTO-GENERATED by scripts/generate-vehicle-catalog.mjs — do not edit manually
import type { VehicleCatalogEntry } from "./types";

function entry(
  id: string,
  make: string,
  model: string,
  silhouetteId: VehicleCatalogEntry["silhouetteId"],
  aliases: string[],
  trim?: string,
  imageModel?: string,
  localImage?: string
): VehicleCatalogEntry {
  return { id, make, model, trim, silhouetteId, aliases, imageModel, localImage };
}

/** US market vehicle catalog (2024–2026 + common used models) */
export const VEHICLE_CATALOG: VehicleCatalogEntry[] = [
  // —— App fictional brand ——${lines.join("\n")}
];
`;

  writeFileSync(OUT_PATH, output, "utf8");

  const makes = [...new Set([...seenIds.values()].map((v) => v.split(" ")[0]))];
  console.log(`Wrote ${seenIds.size} entries across ${CATALOG_BY_MAKE.length} makes to ${OUT_PATH}`);
  return { entryCount: seenIds.size, makeCount: CATALOG_BY_MAKE.length };
}

const stats = generate();
console.log(`Entries: ${stats.entryCount}, Makes: ${stats.makeCount}`);
