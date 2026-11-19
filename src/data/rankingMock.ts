import type { AppState, LumiLoadout } from '../types/domain';

export interface RankingPlayer {
  uid: string;
  nickname: string;
  xp: number;
  streakDays: number;
  totalTasksSolved: number;
  accuracyPercent: number;
  loadout: LumiLoadout;
  isCurrentUser?: boolean;
}

const DEFAULT_LOADOUT: LumiLoadout = {
  colorScheme: 'gold_spark',
  headgear: 'none',
  eyewear: 'none',
  aura: 'none',
  profileFrame: 'default_frame',
  playerTitle: 'novice_title',
};

/**
 * Przykładowi gracze do fazy lokalnej (Faza 1).
 * W Fazie 2 zastępowani przez pojedynczy dokument / paczkę `leaderboard/weekly_v1` z Firebase Storage/Firestore (1 read).
 */
export const MOCK_RANKING_PLAYERS: RankingPlayer[] = [
  {
    uid: 'mock-zosia',
    nickname: 'ZosiaMatma',
    xp: 2840,
    streakDays: 14,
    totalTasksSolved: 142,
    accuracyPercent: 91,
    loadout: {
      ...DEFAULT_LOADOUT,
      colorScheme: 'emerald_pulse',
      headgear: 'master_crown',
      aura: 'plasma_ring',
      playerTitle: 'cke_sniper',
    },
  },
  {
    uid: 'mock-kacper',
    nickname: 'Kacper_E8',
    xp: 2190,
    streakDays: 9,
    totalTasksSolved: 118,
    accuracyPercent: 86,
    loadout: {
      ...DEFAULT_LOADOUT,
      colorScheme: 'blue_wave',
      eyewear: 'cyber_goggles',
      headgear: 'gaming_headphones',
      playerTitle: 'fraction_slayer',
    },
  },
  {
    uid: 'mock-maja',
    nickname: 'MajaKwadrat',
    xp: 1640,
    streakDays: 7,
    totalTasksSolved: 94,
    accuracyPercent: 84,
    loadout: {
      ...DEFAULT_LOADOUT,
      colorScheme: 'crimson_comet',
      eyewear: 'pixel_glasses',
      playerTitle: 'night_owl',
    },
  },
  {
    uid: 'mock-tomek',
    nickname: 'TomekPitagoras',
    xp: 1120,
    streakDays: 5,
    totalTasksSolved: 67,
    accuracyPercent: 79,
    loadout: {
      ...DEFAULT_LOADOUT,
      colorScheme: 'ice_crystal',
      headgear: 'street_cap',
      playerTitle: 'pythagoras_lord',
    },
  },
  {
    uid: 'mock-oliwia',
    nickname: 'Oliwia_CKE',
    xp: 680,
    streakDays: 3,
    totalTasksSolved: 41,
    accuracyPercent: 82,
    loadout: {
      ...DEFAULT_LOADOUT,
      colorScheme: 'gold_spark',
      eyewear: 'pixel_glasses',
    },
  },
  {
    uid: 'mock-bartek',
    nickname: 'BartekLogika',
    xp: 310,
    streakDays: 2,
    totalTasksSolved: 22,
    accuracyPercent: 74,
    loadout: {
      ...DEFAULT_LOADOUT,
      colorScheme: 'blue_wave',
    },
  },
  {
    uid: 'mock-julia',
    nickname: 'Julia_100pkt',
    xp: 120,
    streakDays: 1,
    totalTasksSolved: 9,
    accuracyPercent: 78,
    loadout: {
      ...DEFAULT_LOADOUT,
      colorScheme: 'emerald_pulse',
    },
  },
];

export function computeE8Rating(player: Pick<RankingPlayer, 'xp' | 'streakDays' | 'accuracyPercent'>): number {
  return player.xp + player.streakDays * 25 + player.accuracyPercent * 2;
}

export function buildLeaderboard(state: AppState): Array<RankingPlayer & { rank: number; rating: number }> {
  const accuracyPercent = state.accuracyPointsPossible
    ? Math.round((state.accuracyPointsEarned / state.accuracyPointsPossible) * 100)
    : 0;

  const currentUser: RankingPlayer = {
    uid: 'current-user',
    nickname: state.nickname || 'Ty',
    xp: state.xp,
    streakDays: state.streakDays,
    totalTasksSolved: state.totalTasksSolved,
    accuracyPercent,
    loadout: state.loadout,
    isCurrentUser: true,
  };

  const combined = [...MOCK_RANKING_PLAYERS, currentUser]
    .map((p) => ({ ...p, rating: computeE8Rating(p) }))
    .sort((a, b) => b.rating - a.rating || b.xp - a.xp || b.streakDays - a.streakDays);

  return combined.map((p, idx) => ({ ...p, rank: idx + 1 }));
}
