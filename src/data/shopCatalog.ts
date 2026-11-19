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
    name: 'Słuchawki Gamingowe',
    description: 'Pełne wyciszenie przed arkuszem i basowe podbicie Combo.',
    price: 150,
    rarity: 'common',
    slot: 'headgear',
    slotValue: 'gaming_headphones',
  },
  {
    id: 'head_street_cap',
    category: 'mascot',
    name: 'Czapka Street E8',
    description: 'Miejski sznyt z daszkiem przekręconym w stronę sukcesu.',
    price: 180,
    rarity: 'common',
    slot: 'headgear',
    slotValue: 'street_cap',
  },
  {
    id: 'eye_pixel_glasses',
    category: 'mascot',
    name: 'Okulary Pixelowe 8-bit',
    description: 'Klasyczny arcade-look dla graczy, którzy widzą pułapki CKE.',
    price: 220,
    rarity: 'rare',
    slot: 'eyewear',
    slotValue: 'pixel_glasses',
  },
  {
    id: 'skin_ice_crystal',
    category: 'mascot',
    name: 'Skórka: Lodowy Kryształ',
    description: 'Chłodny spokój podczas rozwiązywania najtrudniejszych brył.',
    price: 260,
    rarity: 'rare',
    slot: 'colorScheme',
    slotValue: 'ice_crystal',
  },
  {
    id: 'eye_cyber_goggles',
    category: 'mascot',
    name: 'Gogle Cyber-Alchemika',
    description: 'Optyczny HUD skanujący wzory potęg i pierwiastków.',
    price: 320,
    rarity: 'rare',
    slot: 'eyewear',
    slotValue: 'cyber_goggles',
  },
  {
    id: 'skin_crimson_comet',
    category: 'mascot',
    name: 'Skórka: Karmazynowa Kometa',
    description: 'Ognista barwa korpusu Lumi rozgrzana do serii x3.0.',
    price: 380,
    rarity: 'epic',
    slot: 'colorScheme',
    slotValue: 'crimson_comet',
  },
  {
    id: 'head_master_crown',
    category: 'mascot',
    name: 'Korona Mistrza E8',
    description: 'Złote insygnium dla tych, którzy celują w 90–100% na egzaminie.',
    price: 550,
    rarity: 'epic',
    slot: 'headgear',
    slotValue: 'master_crown',
  },
  {
    id: 'aura_plasma_ring',
    category: 'mascot',
    name: 'Aura Plazmowego Pierścienia',
    description: 'Geometryczna orbita energii za postacią Lumi.',
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
    description: 'Wyświetlany dumnie pod Twoją ksywką na Karcie Gracza.',
    price: 120,
    rarity: 'common',
    slot: 'playerTitle',
    slotValue: 'fraction_slayer',
  },
  {
    id: 'frame_emerald_impulse',
    category: 'profile',
    name: 'Ramka: Szmaragdowy Impuls',
    description: 'Energetyczna, podwójna obwódka awatara w Profilu.',
    price: 140,
    rarity: 'common',
    slot: 'profileFrame',
    slotValue: 'emerald_impulse_frame',
  },
  {
    id: 'title_night_owl',
    category: 'profile',
    name: 'Tytuł: „Nocny Marek”',
    description: 'Dla mistrzów wieczornych 5-minutowych sesji z Lumi.',
    price: 180,
    rarity: 'rare',
    slot: 'playerTitle',
    slotValue: 'night_owl',
  },
  {
    id: 'title_cke_sniper',
    category: 'profile',
    name: 'Tytuł: „Sniper CKE”',
    description: 'Zero pudła w zadaniach zamkniętych i otwartych.',
    price: 300,
    rarity: 'rare',
    slot: 'playerTitle',
    slotValue: 'cke_sniper',
  },
  {
    id: 'frame_gold_ring',
    category: 'profile',
    name: 'Ramka: Złoty Pierścień E8',
    description: 'Bursztynowo-złota oprawa godna wysokiej Rangi E8.',
    price: 340,
    rarity: 'epic',
    slot: 'profileFrame',
    slotValue: 'gold_ring_frame',
  },
  {
    id: 'title_pythagoras_lord',
    category: 'profile',
    name: 'Tytuł: „Władca Pitagorasa”',
    description: 'Każda przeciwprostokątna kłania się w pas.',
    price: 450,
    rarity: 'epic',
    slot: 'playerTitle',
    slotValue: 'pythagoras_lord',
  },
  {
    id: 'frame_cyber_plasma',
    category: 'profile',
    name: 'Ramka: Cyber-Plazma',
    description: 'Najwyższa oprawa profilu z wielowarstwowym obrysem.',
    price: 620,
    rarity: 'legendary',
    slot: 'profileFrame',
    slotValue: 'cyber_plasma_frame',
  },

  // 3. Wspomagacze (Drogie / Strategiczne)
  {
    id: 'booster_streak_shield',
    category: 'boosters',
    name: 'Tarcza Serii (Streak Shield)',
    description:
      'Chroni Twoją dzienną serię przez 1 pominięty dzień. Maksymalnie 2 sztuki w zapasie.',
    price: 450,
    rarity: 'epic',
    boosterKind: 'streak_shield',
  },
  {
    id: 'booster_heart_refill',
    category: 'boosters',
    name: 'Doładowanie +1 Serca',
    description:
      'Natychmiast przywraca 1 utracone serce (do maks. 5/5). Pamiętaj: Misja Ratunkowa jest zawsze darmowa!',
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
