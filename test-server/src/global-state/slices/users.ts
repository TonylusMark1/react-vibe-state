import * as RVS from 'react-vibe-state';

//

export type ActiveTab = 'addUser' | 'changeRole';

//

export interface Slice {
  map: Record<number, User>;
  nextId: number;
  selectedUserId: number | undefined;
  activeTab: ActiveTab;
}

//

export interface User {
  id: number;
  name: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: number;
  lastActive: number;
}

//

/**
 * Users slice - demonstration of Record<number, T> management with dynamic keys.
 */
export default RVS.createSlice({
  initial: (): Slice => ({
    map: {},
    nextId: 1,
    selectedUserId: undefined,
    activeTab: 'addUser',
  }),

  //
  
  selectors: {
    getUserById(id: number): User | undefined {
      return this.map?.[id];
    },
    
    getUsers(): User[] {
      return Object.values(this.map ?? {});
    },

    getUserIds(): number[] {
      return Object.keys(this.map ?? {}).map(Number);
    }
  },
  
  actions: {
    addUser(name: string, role: 'admin' | 'user' | 'guest' = 'user') {
      const newUser: User = {
        id: this.nextId,
        name,
        role,
        createdAt: Date.now(),
        lastActive: Date.now(),
      };
      this.map[this.nextId] = newUser;
      this.nextId++;
    },
    
    updateUser(id: number, updates: Partial<Omit<User, 'id' | 'createdAt'>>) {
      const user = this.map[id];
      
      if (!user)
        return;
      
      Object.assign(user, updates);
      user.lastActive = Date.now();
    },
    
    removeUser(id: number) {
      delete this.map[id];
      
      if (this.selectedUserId === id)
        this.selectedUserId = undefined;
    },
    
    selectUser(id: number | undefined) {
      this.selectedUserId = id;
    },
    
    updateLastActive(id: number) {
      const user = this.map[id];
      
      if (!user)
        return;
      
      user.lastActive = Date.now();
    },
    
    clearUsers() {
      this.map = {};
      this.selectedUserId = undefined;
      this.nextId = 1;
    },
    
    setActiveTab(tab: ActiveTab) {
      this.activeTab = tab;
    }
  }
});
