import React from 'react';
import { AppStateProvider } from '../src/context/AppStateContext';
import { AppShell } from '../src/components/layout/AppShell';

export default function HomePage() {
  return (
    <AppStateProvider>
      <AppShell />
    </AppStateProvider>
  );
}
