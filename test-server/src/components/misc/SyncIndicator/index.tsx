import * as React from 'react';

import GlobalState from '@/src/global-state';

import styles from './index.module.css';

//

/**
 * Sync indicator showing state changes in real time.
 */
export const SyncIndicator = React.memo(function SyncIndicator() {
  const snap = GlobalState.useSnapshot();

  const [hasChanged, setHasChanged] = React.useState(false);
  const prevStateRef = React.useRef(JSON.stringify(snap.state));

  //
  
  React.useEffect(() => {
    const currentState = JSON.stringify(snap.state);

    if (currentState !== prevStateRef.current) {
      setHasChanged(true);
      prevStateRef.current = currentState;
      
      const timer = setTimeout(() => {
        setHasChanged(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [snap.state]);

  //
  
  return (
    <div className={`${styles.container} ${hasChanged ? styles.syncing : styles.synced}`}>
      {hasChanged ? '🔄 Syncing...' : '✓ Synced'}
    </div>
  );
});
