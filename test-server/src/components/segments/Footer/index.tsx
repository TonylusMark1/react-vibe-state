import * as React from 'react';

import styles from './index.module.css';

//

export const Footer = React.memo(function Footer() {
  return (
    <div className={styles.root}>
      <h3>How It Works:</h3>
      <ul>
        <li><strong>Valtio</strong> - Reactive state management with proxy-based reactivity</li>
        <li><strong>Yjs</strong> - CRDT-based synchronization engine</li>
        <li><strong>IndexedDB</strong> - Persistent storage (survives page reloads)</li>
        <li><strong>BroadcastChannel</strong> - Real-time sync between tabs (same origin)</li>
        <li><strong>Slices</strong> - Organized state with TypeScript type inference</li>
      </ul>

      <div className={styles.tryThisBox}>
        <strong>💡 Try This:</strong> Open this page in 2-3 tabs. Make changes in one tab
        (increment counter, add todos, send messages) and watch them sync instantly to all other tabs!
      </div>
    </div>
  );
});
