# 🌊 react-vibe-state

Reactive state management with **automatic persistence** and **cross-tab synchronization**. Use state almost like a plain JavaScript object - persistence and sync happen transparently in the background.

## Features

- **Zero-config persistence** - state automatically saved to IndexedDB
- **Cross-tab sync** - changes instantly propagate between browser tabs via BroadcastChannel
- **Reactive** - powered by Valtio proxy, React components re-render on relevant changes only
- **Type-safe** - full TypeScript support with inferred types for state, selectors, and actions
- **Modular** - organize state with slices, each with own selectors and actions
- **Conflict-free** - CRDT-based sync via Yjs handles concurrent edits gracefully

**Under the hood:**

- [Valtio](https://github.com/pmndrs/valtio) - reactive proxy-based state
- [Yjs](https://github.com/yjs/yjs) - CRDT for conflict-free merging
- [valtio-yjs](https://github.com/dai-shi/valtio-yjs) - two-way binding between Valtio proxy and Yjs doc
- [y-indexeddb](https://github.com/yjs/y-indexeddb) - IndexedDB persistence provider
- [y-webrtc](https://github.com/yjs/y-webrtc) - BroadcastChannel sync (WebRTC disabled)

## Installation

```bash
npm install react-vibe-state
```

**Peer dependency:** React 18 or 19

## Quick Start

```tsx
import { createState } from 'react-vibe-state';

// Create state (singleton, typically in a separate file)
const appState = createState({
  name: 'app',
  initial: { count: 0 },
  selectors: {
    isPositive() { return this.count > 0; },
    doubled() { return this.count * 2; },
  },
  actions: {
    increment() { this.count++; },
    decrement() { this.count--; },
  },
});

// Use in React component
function Counter() {
  const { state, selectors, actions } = appState.useSnapshot();
  
  return (
    <div>
      <span>{state.count} (doubled: {selectors.doubled()})</span>
      <button onClick={actions.increment}>+</button>
      <button onClick={actions.decrement} disabled={!selectors.isPositive()}>-</button>
    </div>
  );
}
```

Open the app in multiple tabs - counter stays in sync automatically.

## API Reference

### `createState(config)`

Creates a reactive state instance. Instances are cached by name (safe for HMR).

```ts
const state = createState({
  name: 'my-state',
  initial: { /* ... */ },
  selectors: { /* ... */ },
  actions: { /* ... */ },
  slices: { /* key: slice, ... */ },
  // ... options
});
```

#### Config Options


| Option                         | Type                         | Default        | Description                                              |
| ------------------------------ | ---------------------------- | -------------- | -------------------------------------------------------- |
| `persistAndSync`               | `boolean`                    | `true`         | Enable browser storage persistence and cross-tab sync |
| `storage`                      | `"indexed-db"`               | `"indexed-db"` | Storage backend                                          |
| `name`                         | `string`                     | *required*     | Unique identifier (letters, numbers, `_`, `-`)           |
| `generation`                   | `string \| null`             | `null`         | Version identifier; changing it purges old data          |
| `initial`                      | `T \| () => T`               | *required*     | Initial state object or factory function                 |
| `selectors`                    | `object`                     | `{}`           | Methods for derived values (`this` = readonly state)     |
| `actions`                      | `object`                     | `{}`           | Methods for mutations (`this` = mutable state)           |
| `slices`                       | `{ [key]: Slice }`           | `{}`           | Object of slices created with `createSlice()`            |
| `readyTimeout`                 | `number`                     | `5000`         | Max ms to wait for storage initialization                |
| `validate`                     | `(state) => boolean`         | `null`         | Validation function for state structure                  |
| `validateOnRemoteUpdate`       | `boolean`                    | `false`        | Validate state after cross-tab updates                   |
| `onReady`                      | `() => void`                 | `null`         | Called when initialization completes                     |
| `onError`                      | `(error) => void`            | `null`         | Called on initialization failure                         |
| `onStorageValidationFail`      | `(state, sliceKey?) => void` | `null`         | Called when stored data fails validation                 |
| `onRemoteUpdateValidationFail` | `(state, sliceKey?) => void` | `null`         | Called before throwing on invalid remote update          |


#### Returned State Instance

**Properties:**


| Property    | Type                        | Description                                                  |
| ----------- | --------------------------- | ------------------------------------------------------------ |
| `state`     | `TRootState & TSlices`      | Mutable proxy - read/write directly or via selectors/actions |
| `selectors` | `object`                    | Bound selector methods (`this` = readonly state)             |
| `actions`   | `object`                    | Bound action methods (`this` = mutable state)                |
| `ready`     | `Promise<void>`             | Resolves when persistence is loaded                          |
| `isReady`   | `boolean`                   | Whether initialization completed                             |
| `storage`   | `"indexed-db" \| undefined` | Used storage type or `undefined` if disabled                 |


**Methods:**


| Method                  | Description                                                  |
| ----------------------- | ------------------------------------------------------------ |
| `useSnapshot()`         | React hook returning `{ state, selectors, actions }`                  |
| `useSnapshot(sliceKey)` | React hook scoped to a specific slice `{ state, selectors, actions }` |
| `reset()`               | Reset entire state to initial values                         |
| `reset(sliceKey)`       | Reset specific slice to initial values                       |


### `createSlice(config)`

Creates a modular slice of state with its own selectors and actions.

```ts
const todosSlice = createSlice({
  initial: { items: [], filter: 'all' },
  selectors: {
    filtered() {
      return this.filter === 'all' 
        ? this.items 
        : this.items.filter(t => t.status === this.filter);
    },
  },
  actions: {
    add(text: string) {
      this.items.push({ id: Date.now(), text, status: 'active' });
    },
  },
});

// Use in createState
const appState = createState({
  name: 'app',
  initial: {},
  slices: { todos: todosSlice },
});

// Access slice
appState.state.todos.items;
appState.actions.todos.add('Buy milk');
appState.selectors.todos.filtered();
```

#### Slice Config Options


| Option                         | Type                 | Default     | Description                                      |
| ------------------------------ | -------------------- | ----------- | ------------------------------------------------ |
| `initial`                      | `T \| () => T`       | *required*  | Initial slice state object or factory function   |
| `selectors`                    | `object`             | `{}`        | Slice-scoped selectors (`this` = slice state)    |
| `actions`                      | `object`             | `{}`        | Slice-scoped actions (`this` = slice state)      |
| `validate`                     | `(state) => boolean` | `undefined` | Slice-specific validation                        |
| `onStorageValidationFail`      | `(state) => void`    | `undefined` | Called when slice storage validation fails       |
| `onRemoteUpdateValidationFail` | `(state) => void`    | `undefined` | Called when slice remote update validation fails |


### `useSnapshot(state)` / `useSnapshot(state, sliceKey)`

Standalone hook alternative to `state.useSnapshot()`.

```tsx
import { useSnapshot } from 'react-vibe-state';

function Component() {
  const { state, selectors, actions } = useSnapshot(appState);
  // or scoped to slice:
  const { state, selectors, actions } = useSnapshot(appState, 'todos');
}
```

> **Note on `actions`:** Actions are included in `useSnapshot()` for convenience, even though semantically they don't operate on the snapshot. Actions always mutate the actual state (not the snapshot), and these mutations trigger reactivity updates across all subscribers.

## Validation & Recovery

```ts
const appState = createState({
  name: 'app',
  initial: { version: 1, data: [] },
  
  validate: (state) => {
    return typeof state.version === 'number' && Array.isArray(state.data);
  },
  
  validateOnRemoteUpdate: true,
    
  onStorageValidationFail: (invalidData) => {
    console.warn('Stored data invalid, using initial state', JSON.stringify(invalidData));
  },
  
  onRemoteUpdateValidationFail: () => {
    // Remote tab sent incompatible data - probably has newer schema, try to reload the page to align
    location.reload();
  },
});
```

**Validation behavior:**

- **Initial state** - if invalid then throws error (fix your code)
- **Stored data** - if invalid then calls `onStorageValidationFail` & falls back to initial
- **Remote updates** (`validateOnRemoteUpdate` must be `true`) - if invalid then calls `onRemoteUpdateValidationFail` & throws error

## Generation (Schema Versioning)

Useful for session-scoped page state. When your state schema changes incompatibly, change the `generation` to purge old data:

```ts
const appState = createState({
  name: 'app',
  generation: 'v2', // Changed from 'v1' - old data will be deleted
  initial: { /* new schema */ },
});
```

## SSR / Server Components

State works in SSR environments - persistence and sync are automatically disabled server-side. The `ready` promise resolves immediately.

## TypeScript

Full type inference for state, selectors, and actions:

```ts
interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
}

interface UsersState {
  list: User[];
  selectedId?: string;
}

const usersSlice = createSlice({
  initial: { list: [], selectedId: undefined } as UsersState,
  selectors: {
    selected() {
      return this.list.find(u => u.id === this.selectedId);
    },         // ^? User | undefined
    admins() {
      return this.list.filter(u => u.role === 'admin');
    },         // ^? User[]
  },
  actions: {
    add(user: User) {
      this.list.push(user);
    },
    select(id: string | undefined) {
      this.selectedId = id;
    },
  },
});

interface AppState {
  theme: 'dark' | 'light';
}

const appState = createState({
  name: 'app',
  initial: { theme: 'dark' } as AppState,
  slices: { users: usersSlice },
});

// All types are inferred
appState.state.theme;                   // 'dark' | 'light'
appState.state.users.list;              // User[]
appState.selectors.users.selected();    // User | undefined
appState.actions.users.add(user);       // add requires (user: User) => void
```

## Browser Support

Requires IndexedDB and BroadcastChannel support. Works in all modern browsers. For older browsers without `indexedDB.databases()` API, an error is thrown - you can conditionally disable persistence:

```ts
createState({
  persistAndSync: typeof indexedDB?.databases === 'function',
  // ...
});
```

## Demo App

> **Note:** Demo app is only available in the [GitHub repository](https://github.com/TonylusMark1/react-vibe-state), not in the npm package.

The `test-server/` directory contains a demo application showcasing all library features:

- **Counter** - basic counter state
- **Todos** - array management with filtering
- **Messages** - real-time message sync
- **Users** - complex slice with selectors

```bash
# Install dependencies
npm install

# Run demo app
npm run dev
```

Open the app in multiple browser tabs to see cross-tab synchronization in action.

## License

ISC