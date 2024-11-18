import React, { useState } from 'react';
import { Todo } from '../types/Todo';
import * as Methods from '../api/todos';
import classNames from 'classnames';
import '../styles/todo.scss';

interface TodoItemProps {
  todo: Todo;
  deleteTodo: (todoId: number) => void;
  toggleTodo: (todoId: number) => void;
  loadingTodoId: number | null;
  updateTodo: (todoId: number, updatedFields: Partial<Todo>) => Promise<Todo>;
  setError: (error: string | null) => void;
  error: string | null;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  deleteTodo,
  toggleTodo,
  loadingTodoId,
  updateTodo,
  setError,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [isSaving, setIsSaving] = useState(false);

  const renameTodo = async () => {
    const trimmedTitle = editedTitle.trim();

    if (isSaving || trimmedTitle === '') {
      return;
    }

    setIsSaving(true);
    setError(null);

    if (trimmedTitle !== todo.title) {
      try {
        await updateTodo(todo.id, { title: trimmedTitle });
        const updatedTodo = await Methods.updateTodo(todo.id, {
          title: trimmedTitle,
        });

        updateTodo(todo.id, { title: updatedTodo.title });
        setIsEditing(false);
      } catch (error) {
        setError('Unable to update a todo');
        setIsEditing(true);
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (editedTitle.trim() === '') {
        deleteTodo(todo.id);
      } else if (editedTitle !== todo.title) {
        renameTodo();
      } else {
        setIsEditing(false);
      }
    }

    if (e.key === 'Escape') {
      setEditedTitle(todo.title);
      setIsEditing(false);
    }
  };

  const handleBlur = async () => {
    if (editedTitle.trim() === '') {
      deleteTodo(todo.id);
    } else if (editedTitle !== todo.title) {
      await renameTodo();
    } else {
      setIsEditing(false);
    }
  };

  const toggleTodoStatus = () => {
    setIsSaving(true);

    Methods.updateTodo(todo.id, { completed: !todo.completed })
      .then(() => {
        toggleTodo(todo.id);
      })
      .catch(() => {
        setError('Unable to update a todo');
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <div
      className={classNames('todo', { completed: todo.completed })}
      data-cy="Todo"
      key={todo.id}
    >
      <label htmlFor={`todo-status-${todo.id}`} className="todo__status-label">
        {''}
        <input
          id={`todo-status-${todo.id}`}
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={() => toggleTodoStatus()}
        />
      </label>

      {isEditing ? (
        <input
          type="text"
          className="todo__title-field"
          data-cy="TodoTitleField"
          value={editedTitle}
          placeholder="Empty todo will be deleted"
          onChange={e => setEditedTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyUp={handleKeyUp}
          autoFocus
        />
      ) : (
        <span
          data-cy="TodoTitle"
          className="todo__title"
          onDoubleClick={() => setIsEditing(true)}
        >
          {todo.title}
        </span>
      )}

      {!isEditing && (
        <button
          type="button"
          className="todo__remove"
          data-cy="TodoDelete"
          onClick={() => deleteTodo(todo.id)}
        >
          ×
        </button>
      )}

      <div
        data-cy="TodoLoader"
        className={`modal overlay ${loadingTodoId === todo.id || isSaving ? 'is-active' : ''}`}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
