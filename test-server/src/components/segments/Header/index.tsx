import * as React from 'react';

import GlobalState from '@/src/global-state';

import { IdEditor } from './components/IdEditor';

import styles from './index.module.css';

//

export const Header = React.memo(function Header() {
  return (
    <div className={styles.root}>
      <h1 className={styles.title}>
        React Vibe State - Test Server
      </h1>
      <p className={styles.subtitle}>
        State management
      </p>

      <div className={styles.crossTabAlert}>
        <div className={styles.crossTabTitle}>
          🚀 Test Cross-Tab Sync
        </div>
        <div className={styles.crossTabDescription}>
          Open this page in multiple tabs to see real-time synchronization!
        </div>
      </div>

      <IdEditor />
      
      <button
        onClick={() => GlobalState.reset()}
        className={styles.resetButton}
      >
        🔄 Reset All State
      </button>
    </div>
  );
});
