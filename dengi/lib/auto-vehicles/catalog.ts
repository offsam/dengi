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

/** Популярные марки и модели (США / мир) */
export const VEHICLE_CATALOG: VehicleCatalogEntry[] = [
  // —— Вымышленная марка приложения ——
  entry("voltara-prism", "Voltara", "Prism", "sport-coupe", ["prism", "voltara", "voltara prism"], "Coupe"),

  // —— Acura ——
  entry("acura-integra", "Acura", "Integra", "sedan", ["integra", "acura integra"]),
  entry("acura-tlx", "Acura", "TLX", "sedan", ["tlx", "acura tlx"]),
  entry("acura-mdx", "Acura", "MDX", "suv-mid", ["mdx", "acura mdx"]),
  entry("acura-rdx", "Acura", "RDX", "suv-compact", ["rdx", "acura rdx"]),
  entry("acura-zdx", "Acura", "ZDX", "suv-compact", ["zdx", "acura zdx"]),

  // —— Alfa Romeo ——
  entry("alfa-giulia", "Alfa Romeo", "Giulia", "sedan", ["giulia", "alfa giulia"]),
  entry("alfa-stelvio", "Alfa Romeo", "Stelvio", "suv-compact", ["stelvio"]),
  entry("alfa-tonale", "Alfa Romeo", "Tonale", "suv-compact", ["tonale"]),

  // —— Audi ——
  entry("audi-a3", "Audi", "A3", "sedan", ["a3", "audi a3"]),
  entry("audi-a4", "Audi", "A4", "sedan", ["a4", "audi a4"]),
  entry("audi-a5-coupe", "Audi", "A5", "sport-coupe", ["a5", "audi a5", "a5 coupe"], "Coupe", "A5"),
  entry("audi-a5-sportback", "Audi", "A5", "hatchback", ["a5 sportback"], "Sportback", "A5"),
  entry("audi-a6", "Audi", "A6", "sedan", ["a6", "audi a6"]),
  entry("audi-a7", "Audi", "A7", "sedan", ["a7", "audi a7"]),
  entry("audi-a8", "Audi", "A8", "sedan", ["a8", "audi a8"]),
  entry("audi-q3", "Audi", "Q3", "suv-compact", ["q3", "audi q3"]),
  entry("audi-q5", "Audi", "Q5", "suv-compact", ["q5", "audi q5"]),
  entry("audi-q7", "Audi", "Q7", "suv-mid", ["q7", "audi q7"]),
  entry("audi-q8", "Audi", "Q8", "suv-mid", ["q8", "audi q8"]),
  entry("audi-e-tron", "Audi", "e-tron", "suv-mid", ["e-tron", "etron", "audi etron"]),
  entry("audi-s4", "Audi", "S4", "sedan", ["s4", "audi s4"]),
  entry("audi-rs5", "Audi", "RS5", "sport-coupe", ["rs5", "audi rs5"], "Coupe"),

  // —— BMW ——
  entry("bmw-2-series", "BMW", "2 Series", "sport-coupe", ["2 series", "bmw 2"]),
  entry("bmw-3-series", "BMW", "3 Series", "sedan", ["3 series", "bmw 3", "320", "330"]),
  entry("bmw-4-series", "BMW", "4 Series", "sport-coupe", ["4 series", "bmw 4"]),
  entry("bmw-5-series", "BMW", "5 Series", "sedan", ["5 series", "bmw 5"]),
  entry("bmw-7-series", "BMW", "7 Series", "sedan", ["7 series", "bmw 7"]),
  entry("bmw-x1", "BMW", "X1", "suv-compact", ["x1", "bmw x1"]),
  entry("bmw-x3", "BMW", "X3", "suv-compact", ["x3", "bmw x3"]),
  entry("bmw-x5", "BMW", "X5", "suv-mid", ["x5", "bmw x5"]),
  entry("bmw-x7", "BMW", "X7", "suv-mid", ["x7", "bmw x7"]),
  entry("bmw-m4", "BMW", "M4", "sport-coupe", ["m4", "bmw m4"]),
  entry("bmw-z4", "BMW", "Z4", "sport-coupe", ["z4", "bmw z4"]),
  entry("bmw-i4", "BMW", "i4", "sedan", ["i4", "bmw i4"]),
  entry("bmw-ix", "BMW", "iX", "suv-mid", ["ix", "bmw ix"]),

  // —— Buick ——
  entry("buick-encore-gx", "Buick", "Encore GX", "suv-compact", ["encore gx", "encore"]),
  entry("buick-envision", "Buick", "Envision", "suv-compact", ["envision"]),
  entry("buick-enclave", "Buick", "Enclave", "suv-mid", ["enclave"]),

  // —— Cadillac ——
  entry("cadillac-ct4", "Cadillac", "CT4", "sedan", ["ct4", "cadillac ct4"]),
  entry("cadillac-ct5", "Cadillac", "CT5", "sedan", ["ct5", "cadillac ct5"]),
  entry("cadillac-xt4", "Cadillac", "XT4", "suv-compact", ["xt4"]),
  entry("cadillac-xt5", "Cadillac", "XT5", "suv-compact", ["xt5"]),
  entry("cadillac-xt6", "Cadillac", "XT6", "suv-mid", ["xt6"]),
  entry("cadillac-escalade", "Cadillac", "Escalade", "suv-mid", ["escalade"]),
  entry("cadillac-lyriq", "Cadillac", "Lyriq", "suv-mid", ["lyriq", "cadillac lyriq"]),

  // —— Chevrolet ——
  entry("chevy-malibu", "Chevrolet", "Malibu", "sedan", ["malibu", "chevy malibu"]),
  entry("chevy-equinox", "Chevrolet", "Equinox", "suv-compact", ["equinox"]),
  entry("chevy-blazer", "Chevrolet", "Blazer", "suv-compact", ["blazer"]),
  entry("chevy-traverse", "Chevrolet", "Traverse", "suv-mid", ["traverse"]),
  entry("chevy-tahoe", "Chevrolet", "Tahoe", "suv-mid", ["tahoe"]),
  entry("chevy-suburban", "Chevrolet", "Suburban", "suv-mid", ["suburban"]),
  entry("chevy-trax", "Chevrolet", "Trax", "suv-compact", ["trax"]),
  entry("chevy-silverado", "Chevrolet", "Silverado", "truck", ["silverado"]),
  entry("chevy-colorado", "Chevrolet", "Colorado", "truck", ["colorado"]),
  entry("chevy-camaro", "Chevrolet", "Camaro", "sport-coupe", ["camaro"]),
  entry("chevy-corvette", "Chevrolet", "Corvette", "sports-super", ["corvette"]),
  entry("chevy-bolt", "Chevrolet", "Bolt EUV", "hatchback", ["bolt", "bolt euv"]),

  // —— Chrysler ——
  entry("chrysler-pacifica", "Chrysler", "Pacifica", "suv-mid", ["pacifica", "chrysler pacifica"]),
  entry("chrysler-300", "Chrysler", "300", "sedan", ["300", "chrysler 300"]),

  // —— Dodge ——
  entry("dodge-charger", "Dodge", "Charger", "sedan", ["charger", "dodge charger"]),
  entry("dodge-challenger", "Dodge", "Challenger", "sport-coupe", ["challenger"]),
  entry("dodge-durango", "Dodge", "Durango", "suv-mid", ["durango"]),
  entry("dodge-hornet", "Dodge", "Hornet", "suv-compact", ["hornet", "dodge hornet"]),

  // —— Fiat ——
  entry("fiat-500e", "Fiat", "500e", "hatchback", ["500e", "fiat 500"]),

  // —— Ford ——
  entry("ford-mustang", "Ford", "Mustang", "sport-coupe", ["mustang"]),
  entry("ford-mustang-mach-e", "Ford", "Mustang Mach-E", "suv-compact", ["mach-e", "mach e", "mustang mach-e"]),
  entry("ford-focus", "Ford", "Focus", "hatchback", ["focus", "ford focus"]),
  entry("ford-fusion", "Ford", "Fusion", "sedan", ["fusion", "ford fusion"]),
  entry("ford-escape", "Ford", "Escape", "suv-compact", ["escape"]),
  entry("ford-bronco", "Ford", "Bronco", "suv-compact", ["bronco"]),
  entry("ford-bronco-sport", "Ford", "Bronco Sport", "suv-compact", ["bronco sport"]),
  entry("ford-edge", "Ford", "Edge", "suv-compact", ["edge"]),
  entry("ford-explorer", "Ford", "Explorer", "suv-mid", ["explorer"]),
  entry("ford-expedition", "Ford", "Expedition", "suv-mid", ["expedition"]),
  entry("ford-maverick", "Ford", "Maverick", "truck", ["maverick"]),
  entry("ford-ranger", "Ford", "Ranger", "truck", ["ranger"]),
  entry("ford-f150", "Ford", "F-150", "truck", ["f-150", "f150"]),

  // —— Genesis ——
  entry("genesis-g70", "Genesis", "G70", "sedan", ["g70", "genesis g70"]),
  entry("genesis-g80", "Genesis", "G80", "sedan", ["g80"]),
  entry("genesis-g90", "Genesis", "G90", "sedan", ["g90"]),
  entry("genesis-gv70", "Genesis", "GV70", "suv-compact", ["gv70"]),
  entry("genesis-gv80", "Genesis", "GV80", "suv-mid", ["gv80"]),

  // —— GMC ——
  entry("gmc-terrain", "GMC", "Terrain", "suv-compact", ["terrain"]),
  entry("gmc-acadia", "GMC", "Acadia", "suv-mid", ["acadia"]),
  entry("gmc-yukon", "GMC", "Yukon", "suv-mid", ["yukon"]),
  entry("gmc-canyon", "GMC", "Canyon", "truck", ["canyon", "gmc canyon"]),
  entry("gmc-sierra", "GMC", "Sierra", "truck", ["sierra"]),

  // —— Honda ——
  entry("honda-civic", "Honda", "Civic", "sedan", ["civic", "honda civic"]),
  entry("honda-accord", "Honda", "Accord", "sedan", ["accord"]),
  entry("honda-insight", "Honda", "Insight", "sedan", ["insight"]),
  entry("honda-crv", "Honda", "CR-V", "suv-compact", ["cr-v", "crv"]),
  entry("honda-hrv", "Honda", "HR-V", "suv-compact", ["hr-v", "hrv"]),
  entry("honda-pilot", "Honda", "Pilot", "suv-mid", ["pilot"]),
  entry("honda-passport", "Honda", "Passport", "suv-mid", ["passport"]),
  entry("honda-odyssey", "Honda", "Odyssey", "suv-mid", ["odyssey", "honda odyssey"]),
  entry("honda-ridgeline", "Honda", "Ridgeline", "truck", ["ridgeline"]),
  entry("honda-prologue", "Honda", "Prologue", "suv-compact", ["prologue"]),

  // —— Hyundai ——
  entry("hyundai-elantra", "Hyundai", "Elantra", "sedan", ["elantra"]),
  entry("hyundai-sonata", "Hyundai", "Sonata", "sedan", ["sonata"]),
  entry("hyundai-kona", "Hyundai", "Kona", "suv-compact", ["kona"]),
  entry("hyundai-tucson", "Hyundai", "Tucson", "suv-compact", ["tucson"]),
  entry("hyundai-santa-fe", "Hyundai", "Santa Fe", "suv-mid", ["santa fe"]),
  entry("hyundai-palisade", "Hyundai", "Palisade", "suv-mid", ["palisade"]),
  entry("hyundai-venue", "Hyundai", "Venue", "suv-compact", ["venue"]),
  entry("hyundai-ioniq-5", "Hyundai", "Ioniq 5", "suv-compact", ["ioniq 5", "ioniq5"]),
  entry("hyundai-ioniq-6", "Hyundai", "Ioniq 6", "sedan", ["ioniq 6", "ioniq6"]),
  entry("hyundai-santa-cruz", "Hyundai", "Santa Cruz", "truck", ["santa cruz"]),

  // —— Infiniti ——
  entry("infiniti-q50", "Infiniti", "Q50", "sedan", ["q50", "infiniti q50"]),
  entry("infiniti-qx50", "Infiniti", "QX50", "suv-compact", ["qx50"]),
  entry("infiniti-qx60", "Infiniti", "QX60", "suv-mid", ["qx60"]),
  entry("infiniti-qx80", "Infiniti", "QX80", "suv-mid", ["qx80"]),

  // —— Jaguar ——
  entry("jaguar-xf", "Jaguar", "XF", "sedan", ["xf", "jaguar xf"]),
  entry("jaguar-f-pace", "Jaguar", "F-PACE", "suv-compact", ["f-pace", "fpace"]),
  entry("jaguar-i-pace", "Jaguar", "I-PACE", "suv-compact", ["i-pace", "ipace"]),

  // —— Jeep ——
  entry("jeep-renegade", "Jeep", "Renegade", "suv-compact", ["renegade"]),
  entry("jeep-compass", "Jeep", "Compass", "suv-compact", ["compass"]),
  entry("jeep-cherokee", "Jeep", "Cherokee", "suv-compact", ["cherokee"]),
  entry("jeep-wrangler", "Jeep", "Wrangler", "suv-compact", ["wrangler"]),
  entry("jeep-grand-cherokee", "Jeep", "Grand Cherokee", "suv-mid", ["grand cherokee"]),
  entry("jeep-wagoneer", "Jeep", "Wagoneer", "suv-mid", ["wagoneer"]),
  entry("jeep-gladiator", "Jeep", "Gladiator", "truck", ["gladiator"]),

  // —— Kia ——
  entry("kia-forte", "Kia", "Forte", "sedan", ["forte", "kia forte"]),
  entry("kia-k5", "Kia", "K5", "sedan", ["k5", "kia k5", "optima"]),
  entry("kia-soul", "Kia", "Soul", "hatchback", ["soul"]),
  entry("kia-seltos", "Kia", "Seltos", "suv-compact", ["seltos"]),
  entry("kia-sportage", "Kia", "Sportage", "suv-compact", ["sportage"]),
  entry("kia-sorento", "Kia", "Sorento", "suv-mid", ["sorento"]),
  entry("kia-telluride", "Kia", "Telluride", "suv-mid", ["telluride"]),
  entry("kia-niro", "Kia", "Niro", "suv-compact", ["niro"]),
  entry("kia-ev6", "Kia", "EV6", "suv-compact", ["ev6"]),
  entry("kia-ev9", "Kia", "EV9", "suv-mid", ["ev9"]),
  entry("kia-carnival", "Kia", "Carnival", "suv-mid", ["carnival", "kia carnival"]),
  entry("kia-stinger", "Kia", "Stinger", "sedan", ["stinger"]),

  // —— Land Rover ——
  entry("land-rover-defender", "Land Rover", "Defender", "suv-mid", ["defender"]),
  entry("land-rover-discovery", "Land Rover", "Discovery", "suv-mid", ["discovery"]),
  entry("land-rover-range-rover", "Land Rover", "Range Rover", "suv-mid", ["range rover"]),
  entry("land-rover-range-rover-sport", "Land Rover", "Range Rover Sport", "suv-mid", ["range rover sport"]),
  entry("land-rover-evoque", "Land Rover", "Range Rover Evoque", "suv-compact", ["evoque", "range rover evoque"]),

  // —— Lexus ——
  entry("lexus-is", "Lexus", "IS", "sedan", ["is", "lexus is"]),
  entry("lexus-es", "Lexus", "ES", "sedan", ["lexus es", "es"]),
  entry("lexus-ux", "Lexus", "UX", "suv-compact", ["ux", "lexus ux"]),
  entry("lexus-nx", "Lexus", "NX", "suv-compact", ["nx", "lexus nx"]),
  entry("lexus-rx", "Lexus", "RX", "suv-mid", ["lexus rx", "rx"]),
  entry("lexus-tx", "Lexus", "TX", "suv-mid", ["tx", "lexus tx"]),
  entry("lexus-gx", "Lexus", "GX", "suv-mid", ["gx", "lexus gx"]),
  entry("lexus-lx", "Lexus", "LX", "suv-mid", ["lx", "lexus lx"]),
  entry("lexus-lc", "Lexus", "LC", "sport-coupe", ["lc", "lexus lc"]),

  // —— Lincoln ——
  entry("lincoln-corsair", "Lincoln", "Corsair", "suv-compact", ["corsair"]),
  entry("lincoln-nautilus", "Lincoln", "Nautilus", "suv-compact", ["nautilus"]),
  entry("lincoln-aviator", "Lincoln", "Aviator", "suv-mid", ["aviator"]),
  entry("lincoln-navigator", "Lincoln", "Navigator", "suv-mid", ["navigator"]),

  // —— Lucid ——
  entry("lucid-air", "Lucid", "Air", "sedan", ["lucid air", "air"]),

  // —— Mazda ——
  entry("mazda-mazda3", "Mazda", "Mazda3", "sedan", ["mazda3", "mazda 3"]),
  entry("mazda-mazda6", "Mazda", "Mazda6", "sedan", ["mazda6", "mazda 6"]),
  entry("mazda-cx30", "Mazda", "CX-30", "suv-compact", ["cx-30", "cx30"]),
  entry("mazda-cx5", "Mazda", "CX-5", "suv-compact", ["cx-5", "cx5"]),
  entry("mazda-cx50", "Mazda", "CX-50", "suv-compact", ["cx-50", "cx50"]),
  entry("mazda-cx90", "Mazda", "CX-90", "suv-mid", ["cx-90", "cx90"]),

  // —— Mercedes-Benz ——
  entry("mercedes-a-class", "Mercedes-Benz", "A-Class", "sedan", ["a-class", "a class"]),
  entry("mercedes-c-class", "Mercedes-Benz", "C-Class", "sedan", ["c-class", "c class", "c300"]),
  entry("mercedes-e-class", "Mercedes-Benz", "E-Class", "sedan", ["e-class", "e class"]),
  entry("mercedes-s-class", "Mercedes-Benz", "S-Class", "sedan", ["s-class", "s class"]),
  entry("mercedes-gla", "Mercedes-Benz", "GLA", "suv-compact", ["gla"]),
  entry("mercedes-glc", "Mercedes-Benz", "GLC", "suv-compact", ["glc"]),
  entry("mercedes-gle", "Mercedes-Benz", "GLE", "suv-mid", ["gle"]),
  entry("mercedes-gls", "Mercedes-Benz", "GLS", "suv-mid", ["gls"]),
  entry("mercedes-g-class", "Mercedes-Benz", "G-Class", "suv-mid", ["g-class", "g wagon", "g-wagon"]),
  entry("mercedes-eqs", "Mercedes-Benz", "EQS", "sedan", ["eqs"]),
  entry("mercedes-eqe", "Mercedes-Benz", "EQE", "sedan", ["eqe"]),

  // —— Mini ——
  entry("mini-cooper", "Mini", "Cooper", "hatchback", ["mini cooper", "cooper"]),
  entry("mini-countryman", "Mini", "Countryman", "suv-compact", ["countryman", "mini countryman"]),

  // —— Mitsubishi ——
  entry("mitsubishi-mirage", "Mitsubishi", "Mirage", "hatchback", ["mirage"]),
  entry("mitsubishi-outlander", "Mitsubishi", "Outlander", "suv-compact", ["outlander"]),
  entry("mitsubishi-eclipse-cross", "Mitsubishi", "Eclipse Cross", "suv-compact", ["eclipse cross"]),

  // —— Nissan ——
  entry("nissan-versa", "Nissan", "Versa", "sedan", ["versa"]),
  entry("nissan-sentra", "Nissan", "Sentra", "sedan", ["sentra"]),
  entry("nissan-altima", "Nissan", "Altima", "sedan", ["altima"]),
  entry("nissan-maxima", "Nissan", "Maxima", "sedan", ["maxima"]),
  entry("nissan-kicks", "Nissan", "Kicks", "suv-compact", ["kicks"]),
  entry("nissan-rogue", "Nissan", "Rogue", "suv-compact", ["rogue"]),
  entry("nissan-murano", "Nissan", "Murano", "suv-compact", ["murano"]),
  entry("nissan-pathfinder", "Nissan", "Pathfinder", "suv-mid", ["pathfinder"]),
  entry("nissan-armada", "Nissan", "Armada", "suv-mid", ["armada"]),
  entry("nissan-leaf", "Nissan", "Leaf", "hatchback", ["leaf"]),
  entry("nissan-ariya", "Nissan", "Ariya", "suv-compact", ["ariya"]),
  entry("nissan-frontier", "Nissan", "Frontier", "truck", ["frontier"]),
  entry("nissan-z", "Nissan", "Z", "sport-coupe", ["370z", "nissan z", "z car"]),

  // —— Polestar ——
  entry("polestar-2", "Polestar", "2", "sedan", ["polestar 2"]),
  entry("polestar-3", "Polestar", "3", "suv-mid", ["polestar 3"]),

  // —— Porsche ——
  entry("porsche-718", "Porsche", "718", "sport-coupe", ["718", "boxster", "cayman"]),
  entry("porsche-911", "Porsche", "911", "sports-super", ["911", "porsche 911"]),
  entry("porsche-panamera", "Porsche", "Panamera", "sedan", ["panamera"]),
  entry("porsche-taycan", "Porsche", "Taycan", "sedan", ["taycan"]),
  entry("porsche-macan", "Porsche", "Macan", "suv-compact", ["macan"]),
  entry("porsche-cayenne", "Porsche", "Cayenne", "suv-mid", ["cayenne"]),

  // —— Ram ——
  entry("ram-1500", "Ram", "1500", "truck", ["ram 1500"]),
  entry("ram-2500", "Ram", "2500", "truck", ["ram 2500"]),
  entry("ram-promaster", "Ram", "ProMaster", "truck", ["promaster"]),

  // —— Rivian ——
  entry("rivian-r1t", "Rivian", "R1T", "truck", ["r1t", "rivian r1t"]),
  entry("rivian-r1s", "Rivian", "R1S", "suv-mid", ["r1s", "rivian r1s"]),

  // —— Subaru ——
  entry("subaru-impreza", "Subaru", "Impreza", "sedan", ["impreza"]),
  entry("subaru-legacy", "Subaru", "Legacy", "sedan", ["legacy"]),
  entry("subaru-wrx", "Subaru", "WRX", "sedan", ["wrx"]),
  entry("subaru-crosstrek", "Subaru", "Crosstrek", "suv-compact", ["crosstrek"]),
  entry("subaru-forester", "Subaru", "Forester", "suv-compact", ["forester"]),
  entry("subaru-outback", "Subaru", "Outback", "wagon", ["outback"]),
  entry("subaru-ascent", "Subaru", "Ascent", "suv-mid", ["ascent"]),
  entry("subaru-brz", "Subaru", "BRZ", "sport-coupe", ["brz"]),

  // —— Tesla ——
  entry("tesla-model-3", "Tesla", "Model 3", "sedan", ["model 3", "model3"]),
  entry("tesla-model-s", "Tesla", "Model S", "sedan", ["model s"]),
  entry("tesla-model-x", "Tesla", "Model X", "suv-mid", ["model x"]),
  entry("tesla-model-y", "Tesla", "Model Y", "suv-compact", ["model y", "modely"]),
  entry("tesla-cybertruck", "Tesla", "Cybertruck", "truck", ["cybertruck"]),

  // —— Toyota ——
  entry("toyota-corolla", "Toyota", "Corolla", "sedan", ["corolla"]),
  entry("toyota-corolla-cross", "Toyota", "Corolla Cross", "suv-compact", ["corolla cross"]),
  entry("toyota-camry", "Toyota", "Camry", "sedan", ["camry", "toyota camry"]),
  entry("toyota-prius", "Toyota", "Prius", "hatchback", ["prius"]),
  entry("toyota-crown", "Toyota", "Crown", "sedan", ["crown", "toyota crown"]),
  entry("toyota-gr86", "Toyota", "GR86", "sport-coupe", ["gr86", "86"]),
  entry("toyota-rav4", "Toyota", "RAV4", "suv-compact", ["rav4", "rav 4"]),
  entry("toyota-venza", "Toyota", "Venza", "suv-compact", ["venza"]),
  entry("toyota-highlander", "Toyota", "Highlander", "suv-mid", ["highlander"]),
  entry("toyota-4runner", "Toyota", "4Runner", "suv-mid", ["4runner", "4 runner"]),
  entry("toyota-sequoia", "Toyota", "Sequoia", "suv-mid", ["sequoia"]),
  entry("toyota-sienna", "Toyota", "Sienna", "suv-mid", ["sienna"]),
  entry("toyota-tacoma", "Toyota", "Tacoma", "truck", ["tacoma"]),
  entry("toyota-tundra", "Toyota", "Tundra", "truck", ["tundra"]),
  entry("toyota-bz4x", "Toyota", "bZ4X", "suv-compact", ["bz4x", "bz4"]),

  // —— Volkswagen ——
  entry("vw-golf", "Volkswagen", "Golf", "hatchback", ["golf"]),
  entry("vw-jetta", "Volkswagen", "Jetta", "sedan", ["jetta"]),
  entry("vw-passat", "Volkswagen", "Passat", "sedan", ["passat"]),
  entry("vw-arteon", "Volkswagen", "Arteon", "sedan", ["arteon"]),
  entry("vw-taos", "Volkswagen", "Taos", "suv-compact", ["taos"]),
  entry("vw-tiguan", "Volkswagen", "Tiguan", "suv-compact", ["tiguan"]),
  entry("vw-atlas", "Volkswagen", "Atlas", "suv-mid", ["atlas"]),
  entry("vw-atlas-cross-sport", "Volkswagen", "Atlas Cross Sport", "suv-mid", ["atlas cross sport"]),
  entry("vw-id4", "Volkswagen", "ID.4", "suv-compact", ["id.4", "id4"]),

  // —— Volvo ——
  entry("volvo-s60", "Volvo", "S60", "sedan", ["s60"]),
  entry("volvo-s90", "Volvo", "S90", "sedan", ["s90"]),
  entry("volvo-v60", "Volvo", "V60", "wagon", ["v60"]),
  entry("volvo-xc40", "Volvo", "XC40", "suv-compact", ["xc40"]),
  entry("volvo-xc60", "Volvo", "XC60", "suv-compact", ["xc60"]),
  entry("volvo-xc90", "Volvo", "XC90", "suv-mid", ["xc90"]),
  entry("volvo-ex30", "Volvo", "EX30", "suv-compact", ["ex30"]),
  entry("volvo-ex90", "Volvo", "EX90", "suv-mid", ["ex90"]),
];

const catalogById = new Map(VEHICLE_CATALOG.map((item) => [item.id, item]));

export function getVehicleCatalogEntry(id: string) {
  return catalogById.get(id) ?? null;
}

export function getVehicleModelsForMake(make: string) {
  return VEHICLE_CATALOG.filter((item) => item.make === make);
}

export function getVehicleCatalogTitle(entry: VehicleCatalogEntry) {
  return entry.trim ? `${entry.make} ${entry.model} ${entry.trim}` : `${entry.make} ${entry.model}`;
}

export function findVehicleCatalogEntry(text: string) {
  const haystack = text.toLowerCase();
  let best: { entry: VehicleCatalogEntry; score: number } | null = null;

  for (const item of VEHICLE_CATALOG) {
    const candidates = [
      item.id.replace(/-/g, " "),
      `${item.make} ${item.model}`.toLowerCase(),
      getVehicleCatalogTitle(item).toLowerCase(),
      ...item.aliases.map((alias) => alias.toLowerCase()),
    ];

    for (const candidate of candidates) {
      if (!candidate || !haystack.includes(candidate)) {
        continue;
      }

      const score = candidate.length;
      if (!best || score > best.score) {
        best = { entry: item, score };
      }
    }
  }

  return best?.entry ?? null;
}

export const VEHICLE_CATALOG_MAKES = [...new Set(VEHICLE_CATALOG.map((item) => item.make))].sort();
