import TableFetch from '@/components/TableFetch';
import { Suspense } from 'react';

export default function Home() {
  return (
    <main>
      <Suspense>
        <TableFetch />
      </Suspense>
    </main>
  );
}
