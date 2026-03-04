import * as React from 'react';

import GlobalState from '@/src/global-state';

import styles from './index.module.css';

//

export const AddNewUser = React.memo(function AddNewUser() { 
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState<'admin' | 'user' | 'guest'>('user');
  
  //
  
  const handleSubmit = () => {
    if (!name.trim())
      return;
    
    GlobalState.actions.users.addUser(name.trim(), role);
    setName('');
    setRole('user');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter')
      handleSubmit();
  };

  //
  
  return (
    <div className={styles.container}>
      <div className={styles.field}>
        <label className={styles.label}>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter user name..."
          className={styles.input}
        />
      </div>
      
      <div className={styles.field}>
        <label className={styles.label}>Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'admin' | 'user' | 'guest')}
          className={styles.select}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="guest">Guest</option>
        </select>
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={!name.trim()}
        className={styles.submitButton}
      >
        Add User
      </button>
    </div>
  );
});
