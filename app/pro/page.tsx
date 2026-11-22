import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDown, ArrowLeft, BookOpen, Check, Heart, Lightbulb, Target } from 'lucide-react';
import { LumiMascot } from '../../src/components/mascot/LumiMascot';
import { AppStateProvider } from '../../src/context/AppStateContext';
import { FreeAccountAction } from './FreeAccountAction';
import styles from './pro.module.css';

export const metadata: Metadata = {
  title: 'Porównanie planów | JASNE E8',
  description: 'Zobacz, co daje darmowe konto JASNE E8 i jakie funkcje planujemy w Pass E8 Pro.',
};

const freeFeatures = [
  'Dostępne lekcje matematyki z teorią i przykładami',
  'Zadania zamknięte ze wskazówkami i rozwiązaniami',
  'Zapisane zadania i powtórki z Banku błędów',
  'Odzyskiwanie serc w Misji ratunkowej',
];

const proFeatures = [
  { icon: Heart, title: 'Więcej prób w jednej sesji', detail: 'Rozwiązywanie zadań bez limitu serc.' },
  { icon: Lightbulb, title: 'Pomoc w zadaniach otwartych', detail: 'Analiza toku rozwiązania i wskazówka od AI Tutora. Limit analiz ustalimy przed premierą.' },
  { icon: Target, title: 'Powtórki dopasowane do błędów', detail: 'Propozycje zadań z tematów, które sprawiają Ci trudność.' },
];

export default function ProPage() {
  return (
    <AppStateProvider>
      <main className={styles.page}>
        <header className={styles.top}>
          <Link href="/" className={styles.back}><ArrowLeft size={18} aria-hidden="true" /> Wróć do nauki</Link>
          <span className="font-display font-extrabold">JASNE E8</span>
        </header>

        <section className={styles.hero} aria-labelledby="pro-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Matematyka do egzaminu ósmoklasisty</p>
            <h1 id="pro-title">Wiesz, co umiesz.<br /><em>Poćwicz to, co trudne.</em></h1>
            <p>Rozwiązuj zadania w swoim tempie. Zobacz, co daje darmowe konto i jak planujemy rozbudować naukę w Pass E8 Pro.</p>
            <a href="#plany" className={styles.jump}>Porównaj plany <ArrowDown size={17} aria-hidden="true" /></a>
          </div>
          <div className={styles.art} aria-hidden="true">
            <div className={styles.mascot}><LumiMascot mood="happy" size="xl" /></div>
          </div>
        </section>

        <section id="plany" aria-labelledby="plans-title">
          <h2 id="plans-title" className={styles.sectionTitle}>Dwa plany nauki</h2>
          <div className={styles.plans}>
            <article className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.icon}><BookOpen size={22} aria-hidden="true" /></span>
                <span className={styles.status}>Dostępne teraz</span>
              </div>
              <h3>Bezpłatne konto ucznia</h3>
              <p className={styles.cardSubtitle}>Lekcje, zadania i powtórki</p>
              <ul className={styles.features}>
                {freeFeatures.map((feature) => (
                  <li key={feature}><Check size={19} aria-hidden="true" /><span>{feature}</span></li>
                ))}
              </ul>
              <FreeAccountAction />
            </article>
            <article className={`${styles.card} ${styles.proCard}`}>
              <div className={styles.cardTop}>
                <span className={styles.icon}><Target size={22} aria-hidden="true" /></span>
                <span className={styles.status}>W przygotowaniu</span>
              </div>
              <h3>Pass E8 Pro</h3>
              <p className={styles.cardSubtitle}>Darmowe konto + planowane narzędzia</p>
              <ul className={styles.features}>
                {proFeatures.map(({ icon: Icon, title, detail }) => (
                  <li key={title}>
                    <Icon size={19} aria-hidden="true" />
                    <div><strong>{title}</strong><p>{detail}</p></div>
                  </li>
                ))}
              </ul>
              <p className={styles.note}>Zakres, cena i warunki dostępu pojawią się przed premierą.</p>
            </article>
          </div>
        </section>
      </main>
    </AppStateProvider>
  );
}