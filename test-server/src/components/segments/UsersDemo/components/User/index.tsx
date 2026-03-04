import * as React from 'react';

import GlobalState from '@/src/global-state';

import styles from './index.module.css';

//

interface UserProps {
  userId: number;
  selected: boolean;
}

export const User = React.memo(function User(props: UserProps) {
  const snap = GlobalState.useSnapshot("users");

  //
  
  const user = snap.selectors.getUserById(props.userId);
  
  if (!user)
    return null;

  //
  
  const formattedDate = new Date(user.lastActive).toLocaleString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: 'short',
  });

  //
  
  return (
    <div 
      className={`${styles.container} ${props.selected ? styles.selected : ''}`}
      onClick={() => GlobalState.actions.users.selectUser(props.userId)}
    >
      <div className={styles.main}>
        <div className={styles.avatar}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        
        <div className={styles.info}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{user.name}</span>
            <span className={`${styles.role} ${styles[`role${user.role}`]}`}>
              {user.role}
            </span>
          </div>
          
          <div className={styles.meta}>
            <span className={styles.id}>ID: {user.id}</span>
            <span className={styles.separator}>•</span>
            <span className={styles.lastActive}>{formattedDate}</span>
          </div>
        </div>
      </div>
      
      <div className={styles.actions}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            GlobalState.actions.users.updateLastActive(props.userId);
          }}
          className={styles.actionButton}
          title="Update activity"
        >
          ↻
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            GlobalState.actions.users.removeUser(props.userId);
          }}
          className={styles.deleteButton}
          title="Delete user"
        >
          ✕
        </button>
      </div>
    </div>
  );
});
