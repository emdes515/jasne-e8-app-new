// src/data/shopCatalog.ts

import {
  LumiColorSchemeId,
  PlayerTitleId,
  ProfileFrameId,
  ShopItemDefinition,
} from '../types/domain';

export const FREE_STARTER_ITEM_IDS: string[] = [
  'skin_gold_spark',
  'skin_blue_wave',
  'skin_emerald_pulse',
  'frame_default',
  'title_novice',
];

export const SHOP_CATALOG: ShopItemDefinition[] = [
  // 1. Maskotka (Akcesoria i Kolory Lumi)
  {
    id: 'head_gaming_headphones',
    category: 'mascot',
    name: 'Słuchawki',
    description: 'Nauszne słuchawki dla Lumi.',
    price: 150,
    rarity: 'common',
    slot: 'headgear',
    slotValue: 'gaming_headphones',
  },
  {
    id: 'head_street_cap',
    category: 'mascot',
    name: 'Czapka z daszkiem',
    description: 'Niebieska czapka z daszkiem w stylu street.',
    price: 180,
    rarity: 'common',
    slot: 'headgear',
    slotValue: 'street_cap',
  },
  {
    id: 'eye_pixel_glasses',
    category: 'mascot',
    name: 'Okulary 8-bit',
    description: 'Pikselowe oprawki dla Lumi.',
    price: 220,
    rarity: 'rare',
    slot: 'eyewear',
    slotValue: 'pixel_glasses',
  },
  {
    id: 'skin_ice_crystal',
    category: 'mascot',
    name: 'Skórka: Lodowy Kryształ',
    description: 'Jasnoniebieski kolor Lumi.',
    price: 260,
    rarity: 'rare',
    slot: 'colorScheme',
    slotValue: 'ice_crystal',
  },
  {
    id: 'eye_cyber_goggles',
    category: 'mascot',
    name: 'Gogle Cyber-Alchemika',
    description: 'Gogle z niebieską szybką.',
    price: 320,
    rarity: 'rare',
    slot: 'eyewear',
    slotValue: 'cyber_goggles',
  },
  {
    id: 'skin_crimson_comet',
    category: 'mascot',
    name: 'Skórka: Karmazynowa Kometa',
    description: 'Czerwony kolor Lumi.',
    price: 380,
    rarity: 'epic',
    slot: 'colorScheme',
    slotValue: 'crimson_comet',
  },
  {
    id: 'head_master_crown',
    category: 'mascot',
    name: 'Korona Mistrza E8',
    description: 'Złota korona dla Lumi.',
    price: 550,
    rarity: 'epic',
    slot: 'headgear',
    slotValue: 'master_crown',
  },
  {
    id: 'aura_plasma_ring',
    category: 'mascot',
    name: 'Aura Plazmowego Pierścienia',
    description: 'Świetlny pierścień za Lumi.',
    price: 750,
    rarity: 'legendary',
    slot: 'aura',
    slotValue: 'plasma_ring',
  },

  // 2. Ramki & Tytuły Profilu
  {
    id: 'title_fraction_slayer',
    category: 'profile',
    name: 'Tytuł: „Pogromca Ułamków”',
    description: 'Tytuł wyświetlany pod ksywką.',
    price: 120,
    rarity: 'common',
    slot: 'playerTitle',
    slotValue: 'fraction_slayer',
  },
  {
    id: 'frame_emerald_impulse',
    category: 'profile',
    name: 'Ramka: Szmaragdowy Impuls',
    description: 'Podwójna zielona ramka profilu.',
    price: 140,
    rarity: 'common',
    slot: 'profileFrame',
    slotValue: 'emerald_impulse_frame',
  },
  {
    id: 'title_night_owl',
    category: 'profile',
    name: 'Tytuł: „Nocny Marek”',
    description: 'Tytuł do profilu.',
    price: 180,
    rarity: 'rare',
    slot: 'playerTitle',
    slotValue: 'night_owl',
  },
  {
    id: 'title_cke_sniper',
    category: 'profile',
    name: 'Tytuł: „Sniper CKE”',
    description: 'Tytuł do profilu.',
    price: 300,
    rarity: 'rare',
    slot: 'playerTitle',
    slotValue: 'cke_sniper',
  },
  {
    id: 'frame_gold_ring',
    category: 'profile',
    name: 'Ramka: Złoty Pierścień E8',
    description: 'Złota ramka profilu.',
    price: 340,
    rarity: 'epic',
    slot: 'profileFrame',
    slotValue: 'gold_ring_frame',
  },
  {
    id: 'title_pythagoras_lord',
    category: 'profile',
    name: 'Tytuł: „Władca Pitagorasa”',
    description: 'Tytuł do profilu.',
    price: 450,
    rarity: 'epic',
    slot: 'playerTitle',
    slotValue: 'pythagoras_lord',
  },
  {
    id: 'frame_cyber_plasma',
    category: 'profile',
    name: 'Ramka: Cyber-Plazma',
    description: 'Niebieska ramka z kilkoma obwódkami.',
    price: 620,
    rarity: 'legendary',
    slot: 'profileFrame',
    slotValue: 'cyber_plasma_frame',
  },

  // 3. Wspomagacze (Drogie / Strategiczne)
  {
    id: 'booster_streak_shield',
    category: 'boosters',
    name: 'Tarcza serii',
    description:
      'Chroni Twoją dzienną serię przez 1 pominięty dzień. Maksymalnie 2 sztuki w zapasie.',
    price: 450,
    rarity: 'epic',
    boosterKind: 'streak_shield',
  },
  {
    id: 'booster_heart_refill',
    category: 'boosters',
    name: 'Dodatkowe serce',
    description:
      'Przywraca jedno serce, do limitu pięciu. Serce można też odzyskać w misji ratunkowej.',
    price: 80,
    rarity: 'common',
    boosterKind: 'heart_refill',
  },

  // 4. Pakiety Premium / Mikropłatności — Wkrótce (Faza 2)
  {
    id: 'prem_shield_bundle',
    category: 'premium',
    name: 'Pakiet Tarcza Serii ×2 + 500 Monet',
    description:
      'Podwójne zabezpieczenie serii na gorący tydzień w szkole plus zapas monet na kosmetyki.',
    price: 0,
    pricePLN: '14,99 zł',
    rarity: 'epic',
    comingSoon: true,
  },
  {
    id: 'prem_founder_pack',
    category: 'premium',
    name: 'Pakiet Założyciela Lumi',
    description:
      'Unikalny strój Lumi Założyciela, tytuł „Pionier E8” oraz 1200 monet na personalizację.',
    price: 0,
    pricePLN: '24,99 zł',
    rarity: 'legendary',
    comingSoon: true,
  },
];

export const PLAYER_TITLE_LABELS: Record<PlayerTitleId, string> = {
  novice_title: 'Adept JASNE E8',
  fraction_slayer: 'Pogromca Ułamków',
  night_owl: 'Nocny Marek',
  cke_sniper: 'Sniper CKE',
  pythagoras_lord: 'Władca Pitagorasa',
};

export const LUMI_COLOR_LABELS: Record<LumiColorSchemeId, string> = {
  gold_spark: 'Złota Iskra',
  blue_wave: 'Błękitna Fala',
  emerald_pulse: 'Szmaragdowy Impuls',
  ice_crystal: 'Lodowy Kryształ',
  crimson_comet: 'Karmazynowa Kometa',
};

export const PROFILE_FRAME_LABELS: Record<ProfileFrameId, string> = {
  default_frame: 'Standardowa Ramka',
  emerald_impulse_frame: 'Szmaragdowy Impuls',
  gold_ring_frame: 'Złoty Pierścień E8',
  cyber_plasma_frame: 'Cyber-Plazma',
};
