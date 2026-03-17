import * as RandomWordSlugs from 'random-word-slugs';

import * as RVS from 'react-vibe-state';

import counterSlice from './slices/counter';
import todosSlice from './slices/todos';
import messagesSlice from './slices/messages';
import usersSlice from './slices/users';

//

export interface State {
  id: string;
}

//

/**
 * Tworzymy test state z wieloma slices.
 */
export default RVS.createState({
  persistAndSync: true,

  name: 'global-state',
  generation: 'gen-2',

  initial: {
    id: RandomWordSlugs.generateSlug(),
  } as State,

  selectors: {
    getId() {
      return this.id;
    },
  },
  
  actions: {
    setId(newId: string) {
      this.id = newId ?? RandomWordSlugs.generateSlug();
    },
    randomizeId() {
      this.id = RandomWordSlugs.generateSlug();
    },
  },

  slices: {
    counter: counterSlice,
    todos: todosSlice,
    messages: messagesSlice,
    users: usersSlice,
  },
});
