import * as RVS from 'react-vibe-state';

//

export interface Slice {
  count: number;
  lastUpdated: number;
  incrementCount: number;
  decrementCount: number;
}

//

/**
 * Counter slice - demonstration of basic state management and synchronization.
 */
export default RVS.createSlice({
  key: 'counter',
  
  initial: (): Slice => ({
    count: 0,
    lastUpdated: Date.now(),
    incrementCount: 0,
    decrementCount: 0,
  }),

  //
  
  actions: {
    increment() {
      this.count++;
      this.incrementCount++;
      this.lastUpdated = Date.now();
    },
    
    decrement() {
      this.count--;
      this.decrementCount++;
      this.lastUpdated = Date.now();
    },
    
    setCount(value: number) {
      this.count = value;
      this.lastUpdated = Date.now();
    },
    
    clear() {
      this.count = 0;
      this.lastUpdated = Date.now();
      this.incrementCount = 0;
      this.decrementCount = 0;
    }
  }
});
