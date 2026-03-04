import * as React from 'react';

import GlobalState from '@/src/global-state';

import { User } from '../User';

import styles from './index.module.css';

//

export const UserList = React.memo(function UserList() {
  const snap = GlobalState.useSnapshot("users");

  const userIds = snap.selectors.getUserIds();
  
  //
  
  if (!userIds.length) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>👤</div>
        <div className={styles.emptyText}>No users yet</div>
        <div className={styles.emptyHint}>Add one to test Record sync!</div>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Users</h3>
        <span className={styles.count}>{userIds.length}</span>
      </div>
      
      <div className={styles.list}>
        {userIds.map((userId) => (
          <User 
            key={userId} 
            userId={userId} 
            selected={snap.state.selectedUserId === userId}
          />
        ))}
      </div>
      
      <div className={styles.footer}>
        <button
          onClick={() => GlobalState.actions.users.clearUsers()}
          className={styles.clearButton}
        >
          Clear All
        </button>
        <div className={styles.nextId}>
          Next ID: {snap.state.nextId}
        </div>
      </div>
    </div>
  );
});
