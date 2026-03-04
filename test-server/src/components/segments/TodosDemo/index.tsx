import * as React from 'react';

import GlobalState from '@/src/global-state';

import styles from './index.module.css';

//

/**
 * Demonstration of array management and filtering.
 */
export const TodosDemo = React.memo(function TodosDemo() {
  const snap = GlobalState.useSnapshot("todos");

  //
  
  const handleAddTodo = () => {
    if (snap.state.draftText.trim())
      GlobalState.actions.todos.addTodo(snap.state.draftText);
  };
  
  const filteredTodos = snap.selectors.getFilteredTodos();
  
  //
  
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Todos Demo</h2>
      
      <div className={styles.inputGroup}>
        <input
          type="text"
          value={snap.state.draftText}
          onChange={(e) => GlobalState.actions.todos.setDraftText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
          placeholder="Enter new todo... (synced across tabs!)"
          className={styles.input}
        />
        <button
          onClick={handleAddTodo}
          className={styles.addButton}
        >
          Add
        </button>
      </div>
      
      <div className={styles.filterButtons}>
        {(['all', 'active', 'completed'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => GlobalState.actions.todos.setFilter(filter)}
            className={`${styles.filterButton} ${
              snap.state.filter === filter ? styles.filterButtonActive : styles.filterButtonInactive
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
      
      <div className={styles.todoList}>
        {filteredTodos.length === 0 ? (
          <div className={styles.emptyMessage}>
            No todos to display
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div key={todo.id} className={styles.todoItem}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => GlobalState.actions.todos.toggleTodo(todo.id)}
                className={styles.checkbox}
              />
              <span className={`${styles.todoText} ${todo.completed ? styles.todoTextCompleted : ''}`}>
                {todo.text}
              </span>
              <button
                onClick={() => GlobalState.actions.todos.removeTodo(todo.id)}
                className={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
      
      {snap.state.items.some((t) => t.completed) && (
        <button
          onClick={() => GlobalState.actions.todos.clearCompleted()}
          className={styles.clearCompletedButton}
        >
          Clear Completed
        </button>
      )}
    </div>
  );
});
