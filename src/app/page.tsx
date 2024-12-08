'use client';

import dynamic from 'next/dynamic';

const Scheduler = dynamic(() => import('./components/Scheduler'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

export default function Page() {
  return <Scheduler />;
}