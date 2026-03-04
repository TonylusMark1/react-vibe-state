import * as React from 'react';

import GlobalState from '@/src/global-state';

import styles from './index.module.css';

//

export const IdEditor = React.memo(function IdEditor() {
  const snap = GlobalState.useSnapshot();
  
  const [diceRolling, setDiceRolling] = React.useState(false);
  
  const inputRef = React.useRef<HTMLInputElement>(null);
  const cursorPosRef = React.useRef<number | null>(null);
  
  //

  React.useLayoutEffect(() => {
    if (cursorPosRef.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorPosRef.current, cursorPosRef.current);
      cursorPosRef.current = null;
    }
  }, [snap.state.id]);

  //

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    cursorPosRef.current = e.target.selectionStart;
    GlobalState.actions.setId(e.target.value);
  };

  const handleRandomize = () => {
    GlobalState.actions.randomizeId();
    setDiceRolling(true);
  };

  //

  return (
    <div className={styles.idGroup}>
      <div className={styles.badge}>
        <span className={styles.idLabel}>Id:</span>
        <input
          ref={inputRef}
          type="text"
          value={snap.state.id}
          onChange={handleIdChange}
          className={styles.idInput}
          placeholder="your-id"
        />
      </div>
      <button
        onClick={handleRandomize}
        className={styles.randomizeButton}
        title="Generate random ID"
      >
        <span 
          className={`${styles.diceIcon} ${diceRolling ? styles.diceRolling : ''}`}
          onAnimationEnd={() => setDiceRolling(false)}
        >
          🎲
        </span>
      </button>
    </div>
  );
});
