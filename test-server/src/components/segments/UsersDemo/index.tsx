import * as React from 'react';

import GlobalState from '@/src/global-state';

import { AddNewUser } from './components/AddNewUser';
import { ChangeUserRole } from './components/ChangeUserRole';
import { UserList } from './components/UserList';

import styles from './index.module.css';

//

export const UsersDemo = React.memo(function UsersDemo() {
  const snap = GlobalState.useSnapshot("users");
  
  //
  
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Users Demo</h2>
      
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${snap.state.activeTab === 'addUser' ? styles.tabActive : ''}`}
          onClick={() => GlobalState.actions.users.setActiveTab('addUser')}
        >
          Add User
        </button>
        <button
          className={`${styles.tab} ${snap.state.activeTab === 'changeRole' ? styles.tabActive : ''}`}
          onClick={() => GlobalState.actions.users.setActiveTab('changeRole')}
        >
          Change Role
        </button>
      </div>
      
      <div className={styles.tabContent}>
        {snap.state.activeTab === 'addUser' && <AddNewUser />}
        {snap.state.activeTab === 'changeRole' && <ChangeUserRole />}
      </div>
      
      <div className={styles.divider} />
      
      <UserList />
    </div>
  );
});
