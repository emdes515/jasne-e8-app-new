'use client';

import React from 'react';
import { motion } from 'motion/react';
import { BookType, Globe, Lock, ArrowRight, FileText } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import {
  ENGLISH_PREVIEW_CHAPTERS,
  POLISH_PREVIEW_CHAPTERS,
} from '../../data/mathLessonMock';
import {
  STAGGER_CONTAINER_VARIANTS,
  STAGGER_ITEM_VARIANTS,
} from '../../lib/motionPresets';
import { LumiMascot } from '../mascot/LumiMascot';
import { TactileButton } from '../ui/TactileButton';

export function SubjectComingSoonView() {
  const { state, setSubject } = useAppState();
  const isPolish = state.activeSubject === 'polish';

  const subjectTitle = isPolish ? 'Język Polski E8' : 'Język Angielski E8';
  const accentColor = isPolish ? '#F43F5E' : '#10B981';
  const contextPreviewTitle = isPolish
    ? 'Ściąga Lektur & Form (Wkrótce)'
    : 'Bank Zwrotów & Czasów (Wkrótce)';
  const contextPreviewDesc = isPolish
    ? 'Szybkie karty bohaterów, motywów literackich z lektur obowiązkowych (Kamienie na szaniec, Pan Tadeusz, Dziady cz. II, Mały Książę, Balladyna) oraz gotowe szablony rozprawki i przemówienia.'
    : 'Podręczny zestaw czasów angielskich, reakcji językowych i zwrotów do e-maila egzaminacyjnego E8 — dostępny w tym miejscu zamiast matematycznych wzorów.';

  const chapters = isPolish
    ? POLISH_PREVIEW_CHAPTERS
    : ENGLISH_PREVIEW_CHAPTERS;

  const IconComp = isPolish ? BookType : Globe;

  return (
    <motion.div
      variants={STAGGER_CONTAINER_VARIANTS}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Top Banner */}
      <motion.section
        variants={STAGGER_ITEM_VARIANTS}
        className="rounded-3xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] shadow-[0_6px_0_0_var(--border-3d-edge)] p-5 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <LumiMascot
            mood="cool"
            loadout={state.loadout}
            size="md"
          />

          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold font-display mb-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
              <span style={{ color: accentColor }}>
                Moduł w budowie — Faza 2
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold font-display text-[var(--text-primary)] mb-2">
              {subjectTitle} — Mapa Ścieżki
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
              Moduł w budowie — w Fazie 1 wszystkie mechaniki (teorię Bento,
              Combo, AI Tutora, Misję Ratunkową i Mini-Arkusz) testujemy na
              pełnej ścieżce <strong>Matematyki E8</strong>.
            </p>

            <TactileButton
              variant="primary"
              size="md"
              onClick={() => setSubject('math')}
            >
              <span>Przełącz na Matematykę E8</span>
              <ArrowRight className="w-4 h-4" />
            </TactileButton>
          </div>
        </div>
      </motion.section>

      {/* Contextual Preview Slot (replaces "Wzory E8" which is strictly hidden for Polish/English!) */}
      <motion.section
        variants={STAGGER_ITEM_VARIANTS}
        className="rounded-3xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] shadow-[0_5px_0_0_var(--border-3d-edge)] p-5"
      >
        <div className="flex items-start gap-3.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-[#080C16]"
            style={{ backgroundColor: accentColor }}
          >
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--accent-text)]">
              Narzędzie kontekstowe przedmiotu (zamiast Wzorów E8)
            </div>
            <h2 className="text-base font-extrabold font-display text-[var(--text-primary)] mt-0.5">
              {contextPreviewTitle}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              {contextPreviewDesc}
            </p>
          </div>
        </div>
      </motion.section>

      {/* Preview Chapters Map */}
      <motion.section
        variants={STAGGER_ITEM_VARIANTS}
        className="space-y-3"
      >
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold font-display text-[var(--text-secondary)]">
            Zapowiedź działów w {subjectTitle}
          </h2>
          <IconComp className="w-4 h-4 text-[var(--text-secondary)]" />
        </div>

        {chapters.map((ch) => (
          <div
            key={ch.chapterNumber}
            className="p-4 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] shadow-[0_4px_0_0_var(--border-3d-edge)] flex items-center justify-between gap-4 opacity-90"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center font-extrabold font-display text-sm text-[var(--text-secondary)] shrink-0">
                {ch.chapterNumber}
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--accent-text)]">
                  Dział {ch.chapterNumber} · {ch.badge}
                </div>
                <h3 className="text-base font-extrabold font-display text-[var(--text-primary)]">
                  {ch.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {ch.subtitle}
                </p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
              <Lock className="w-4 h-4" />
            </div>
          </div>
        ))}
      </motion.section>
    </motion.div>
  );
}
