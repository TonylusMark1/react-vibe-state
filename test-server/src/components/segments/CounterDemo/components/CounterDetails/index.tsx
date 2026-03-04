import * as React from 'react';

import GlobalState from '@/src/global-state';

import styles from './index.module.css';

//

export const CounterDetails = React.memo(function CounterDetails() {
  const snap = GlobalState.useSnapshot("counter");

  //

  return (
    <div className={styles.stats}>
      <div>Total increments: {snap.state.incrementCount}</div>
      <div>Total decrements: {snap.state.decrementCount}</div>
      <div>Last updated: {new Date(snap.state.lastUpdated).toLocaleTimeString()}</div>
    </div>
  );
});
