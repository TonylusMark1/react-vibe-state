import { SyncIndicator } from '@/src/components/misc/SyncIndicator';
import { CosmicBackground } from '@/src/components/misc/CosmicBackground';

import { Header } from '@/src/components/segments/Header';
import { Footer } from '@/src/components/segments/Footer';
import { CounterDemo } from '@/src/components/segments/CounterDemo';
import { TodosDemo } from '@/src/components/segments/TodosDemo';
import { MessagesDemo } from '@/src/components/segments/MessagesDemo';
import { UsersDemo } from '@/src/components/segments/UsersDemo';

import styles from './index.module.css';

//

export function App() {
  return (
    <div className={styles.container}>
      <CosmicBackground />
      <SyncIndicator />

      <div className={styles.grid}>
        <Header />
        <CounterDemo />
        <MessagesDemo />
        <UsersDemo />
        <TodosDemo />
        <Footer />
      </div>
    </div>
  );
}
