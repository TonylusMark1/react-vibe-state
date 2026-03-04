import * as React from 'react';

import GlobalState from '@/src/global-state';

import styles from './index.module.css';

//

/**
 * Demonstration of basic state management and counter synchronization.
 */
export const CounterDemo = React.memo(function CounterDemo() {
  const snap = GlobalState.useSnapshot("counter");

  //

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Counter Demo</h2>
      
      <div className={styles.count}>
        {snap.state.count}
      </div>
      
      <div className={styles.buttons}>
        <button
          onClick={() => GlobalState.actions.counter.increment()}
          className={`${styles.button} ${styles.buttonIncrement}`}
        >
          Increment (+)
        </button>
        
        <button
          onClick={() => GlobalState.actions.counter.decrement()}
          className={`${styles.button} ${styles.buttonDecrement}`}
        >
          Decrement (-)
        </button>
        
        <button
          onClick={() => GlobalState.actions.counter.clear()}
          className={`${styles.button} ${styles.buttonReset}`}
        >
          Reset Counter
        </button>
      </div>
      
      <div className={styles.stats}>
        <div>Total increments: {snap.state.incrementCount}</div>
        <div>Total decrements: {snap.state.decrementCount}</div>
        <div>Last updated: {new Date(snap.state.lastUpdated).toLocaleTimeString()}</div>
      </div>
    </div>
  );
});
