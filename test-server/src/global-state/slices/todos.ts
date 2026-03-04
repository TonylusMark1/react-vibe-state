import * as RVS from 'react-vibe-state';

//

export interface Slice {
  items: Todo[];
  filter: 'all' | 'active' | 'completed';
  draftText: string;
}

//

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

//

/**
 * Todos slice — demonstration of array management and filtering.
 */
export default RVS.createSlice({
  key: 'todos',

  initial: (): Slice => ({
    items: [],
    filter: 'all',
    draftText: '',
  }),

  //
  
  selectors: {
    getFilteredTodos() {
      switch (this.filter) {
        case 'active':
          return this.items.filter((t) => !t.completed);
        case 'completed':
          return this.items.filter((t) => t.completed);
        default:
          return this.items;
      }
    }
  },
  
  actions: {
    addTodo(text: string) {
      const newTodo: Todo = {
        id: `${Date.now()}-${Math.random()}`,
        text,
        completed: false,
        createdAt: Date.now(),
      };
      this.items.push(newTodo);
      this.draftText = '';
    },
    
    toggleTodo(id: string) {
      const todo = this.items.find((t) => t.id === id);
      if (todo)
        todo.completed = !todo.completed;
    },
    
    removeTodo(id: string) {
      const index = this.items.findIndex((t) => t.id === id);
      if (index !== -1)
        this.items.splice(index, 1);
    },
    
    setFilter(filter: 'all' | 'active' | 'completed') {
      this.filter = filter;
    },
    
    setDraftText(text: string) {
      this.draftText = text;
    },
    
    clearCompleted() {
      this.items = this.items.filter((t) => !t.completed);
    }
  }
});
