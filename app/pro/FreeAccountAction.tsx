'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { CloudAccountModal, useCloudAuthUser } from '../../src/components/auth/CloudAccountModal';
import styles from './pro.module.css';

export function FreeAccountAction() {
  const { configured, loading, user } = useCloudAuthUser();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (!configured || user) {
    return (
      <Link href="/" className={styles.freeAction}>
        Przejdź do aplikacji <ArrowRight size={17} aria-hidden="true" />
      </Link>
    );
  }

  return (
    <>
      <button type="button" className={styles.freeAction} disabled={loading} onClick={() => setOpen(true)}>
        Zaloguj się lub załóż konto <ArrowRight size={17} aria-hidden="true" />
      </button>
      {open && (
        <CloudAccountModal
          open
          onClose={() => setOpen(false)}
          onSuccess={() => router.push('/')}
          showPlanLink={false}
        />
      )}
    </>
  );
}