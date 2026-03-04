import * as React from 'react';
import * as Vibe from 'react-vibe-state';

import GlobalState from '@/src/global-state';

import styles from './index.module.css';

//

export const ChangeUserRole = React.memo(function ChangeUserRole() {
  const snap = Vibe.useSnapshot(GlobalState);
  
  const users = snap.selectors.users.getUsers();
  
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(null);
  const [newRole, setNewRole] = React.useState<'admin' | 'user' | 'guest'>('user');
  
  //
  
  const selectedUser = selectedUserId !== null 
    ? snap.selectors.users.getUserById(selectedUserId) 
    : null;

  const handleSubmit = () => {
    if (selectedUserId === null)
      return;
    
    GlobalState.actions.users.updateUser(selectedUserId, { role: newRole });
    setSelectedUserId(null);
    setNewRole('user');
  };

  //
  
  if (!users.length) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>👤</div>
        <div className={styles.emptyText}>No users available</div>
        <div className={styles.emptyHint}>Add some users first to change their roles</div>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.field}>
        <label className={styles.label}>Select User</label>
        <select
          value={selectedUserId ?? ''}
          onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value, 10) : null)}
          className={styles.select}
        >
          <option value="">Choose a user...</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>
      </div>
      
      {selectedUser && (
        <div className={styles.userPreview}>
          <span className={styles.previewName}>{selectedUser.name}</span>
          <span className={`${styles.previewRole} ${styles[`role${selectedUser.role}`]}`}>
            {selectedUser.role}
          </span>
        </div>
      )}
      
      <div className={styles.field}>
        <label className={styles.label}>New Role</label>
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value as 'admin' | 'user' | 'guest')}
          className={styles.select}
          disabled={!selectedUserId}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="guest">Guest</option>
        </select>
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={!selectedUserId}
        className={styles.submitButton}
      >
        Change Role
      </button>
    </div>
  );
});
