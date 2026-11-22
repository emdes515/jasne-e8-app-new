'use client';

import React, { useMemo, useState } from 'react';
import { Award, CheckCircle2, Flame, Medal, Target, Trophy } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { buildLeaderboard, type RankingPlayer } from '../../data/rankingMock';
import { getRankForXp } from '../../lib/gamification';
import { PLAYER_TITLE_LABELS } from '../../data/shopCatalog';
import { LumiMascot } from '../mascot/LumiMascot';
import { BottomSheet } from '../ui/BottomSheet';

export function RankingView() {
  const { state } = useAppState();
  const [selectedPlayer, setSelectedPlayer] = useState<(RankingPlayer & { rank: number; rating: number }) | null>(null);

  const leaderboard = useMemo(() => buildLeaderboard(state), [state]);
  const myEntry = leaderboard.find((p) => p.isCurrentUser);

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <header className="study-feature p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold font-display text-[var(--accent-text)]">
            <Trophy className="w-4 h-4" />
            <span>Liga E8 · Podgląd rankingu</span>
          </div>
          <h1 className="page-heading">Ranking uczniów</h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Zobacz swój wynik na tle przykładowych graczy. Punkty E8 łączą XP, serię dni i skuteczność.
          </p>
        </div>

        {myEntry && (
          <div className="rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--accent-primary)]/60 px-4 py-2.5 text-right shrink-0">
            <div className="text-[11px] font-bold text-[var(--text-secondary)]">Twoja pozycja</div>
            <div className="text-2xl font-extrabold font-display text-[var(--accent-text)] tabular-nums">
              #{myEntry.rank}
            </div>
            <div className="text-[11px] font-bold text-[var(--text-primary)] tabular-nums">
              {myEntry.rating} pkt E8
            </div>
          </div>
        )}
      </header>

      {/* Leaderboard List */}
      <section aria-label="Tabela rankingu" className="study-panel divide-y divide-[var(--border-subtle)] overflow-hidden">
        {leaderboard.map((player) => {
          const isTop3 = player.rank <= 3;
          const medalColor =
            player.rank === 1
              ? 'text-[var(--medal-gold)]'
              : player.rank === 2
              ? 'text-[var(--medal-silver)]'
              : player.rank === 3
              ? 'text-[var(--medal-bronze)]'
              : 'text-[var(--text-secondary)]';

          return (
            <button
              key={player.uid}
              type="button"
              onClick={() => setSelectedPlayer(player)}
              className={`w-full px-3.5 sm:px-5 py-3 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                player.isCurrentUser
                  ? 'bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)]/15'
                  : 'hover:bg-[var(--bg-elevated)]/70'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-7 text-center font-extrabold font-display tabular-nums shrink-0 ${medalColor}`}>
                  {isTop3 ? <Medal className="w-5 h-5 mx-auto" /> : `#${player.rank}`}
                </div>

                <div className="shrink-0">
                  <LumiMascot
                    mood={player.rank === 1 ? 'celebrate' : 'happy'}
                    loadout={player.loadout}
                    size="xs"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm sm:text-base font-extrabold font-display text-[var(--text-primary)] truncate">
                      {player.nickname}
                    </span>
                    {player.isCurrentUser && (
                      <span className="rounded-full bg-[var(--accent-primary)] px-2 py-0.5 text-[10px] font-extrabold font-display text-[var(--on-accent)] shrink-0">
                        TY
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[var(--text-secondary)] tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      <Flame className="w-3 h-3 text-[var(--combo-fire)]" />
                      {player.streakDays} dni
                    </span>
                    <span>{player.totalTasksSolved} zadań</span>
                    <span>{player.accuracyPercent}% celności</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm sm:text-base font-extrabold font-display text-[var(--accent-text)] tabular-nums">
                  {player.rating}
                </div>
                <div className="text-[10px] font-bold text-[var(--text-secondary)]">pkt E8</div>
              </div>
            </button>
          );
        })}
      </section>

      {/* Player Profile Modal */}
      <BottomSheet
        open={selectedPlayer !== null}
        onClose={() => setSelectedPlayer(null)}
        title={selectedPlayer ? `${selectedPlayer.nickname} · #${selectedPlayer.rank}` : 'Profil gracza'}
        subtitle={
          selectedPlayer
            ? `${PLAYER_TITLE_LABELS[selectedPlayer.loadout.playerTitle]} · ${getRankForXp(selectedPlayer.xp).currentRank.name}`
            : undefined
        }
      >
        {selectedPlayer && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 flex items-center gap-4">
              <LumiMascot
                mood="cool"
                loadout={selectedPlayer.loadout}
                size="md"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="text-xs font-extrabold uppercase tracking-wider font-display text-[var(--accent-text)]">
                  {getRankForXp(selectedPlayer.xp).currentRank.name}
                </div>
                <div className="text-xl font-extrabold font-display text-[var(--text-primary)] tabular-nums">
                  {selectedPlayer.rating} pkt E8
                </div>
                <div className="text-xs text-[var(--text-secondary)] tabular-nums">
                  {selectedPlayer.xp} XP · {PLAYER_TITLE_LABELS[selectedPlayer.loadout.playerTitle]}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 text-center">
                <Flame className="w-4 h-4 text-[var(--combo-fire)] mx-auto mb-1" />
                <div className="text-base font-extrabold font-display tabular-nums">{selectedPlayer.streakDays}</div>
                <div className="text-[11px] text-[var(--text-secondary)]">Dni serii</div>
              </div>
              <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 text-center">
                <CheckCircle2 className="w-4 h-4 text-[var(--success)] mx-auto mb-1" />
                <div className="text-base font-extrabold font-display tabular-nums">{selectedPlayer.totalTasksSolved}</div>
                <div className="text-[11px] text-[var(--text-secondary)]">Zadań</div>
              </div>
              <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 text-center">
                <Target className="w-4 h-4 text-[var(--info)] mx-auto mb-1" />
                <div className="text-base font-extrabold font-display tabular-nums">{selectedPlayer.accuracyPercent}%</div>
                <div className="text-[11px] text-[var(--text-secondary)]">Skuteczność</div>
              </div>
            </div>

            <div className="rounded-xl bg-[var(--bg-canvas)]/70 border border-[var(--border-subtle)] px-3.5 py-2.5 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <Award className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
              <span>To podgląd ligi. Twoje statystyki pochodzą z tego urządzenia.</span>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
