import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import * as todoService from './api/todos';
import { USER_ID } from './api/todos';
import { UserWarning } from './UserWarning';
import { Todo } from './types/Todo';
import { FilterType } from './types/FilterTypes';
import Footer from './components/Footer';
import TodoList from './components/TodoList';
import Header from './components/Header';

const getFilteredTodos = (todos: Todo[], filter: FilterType) => {
  switch (filter) {
    case FilterType.active:
      return todos.filter(todo => !todo.completed);

    case FilterType.completed:
      return todos.filter(todo => todo.completed);

    default:
      return todos;
  }
};

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filterType, setFilterType] = useState<FilterType>(FilterType.all);
  const [errorMessage, setErrorMessage] = useState<string | null>('');

  const [newTodo, setNewTodo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmiting] = useState(false);
  const [todoIds, setTodoIds] = useState<number[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [isTodoDeleted, setIsTodoDeleted] = useState(false);

  const visibleTodos = getFilteredTodos(todos, filterType);

  const unCompletedTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  useEffect(() => {
    setIsLoading(true);

    todoService
      .getTodos()
      .then(setTodos)
      .catch(() => setErrorMessage('Unable to load todos'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (isTodoDeleted) {
      setIsTodoDeleted(false);
    }
  }, [isTodoDeleted]);

  const deleteTodo = (todoId: number) => {
    setTodoIds(prevIds => [...prevIds, todoId]);
    setIsLoading(true);

    return todoService
      .deleteTodo(todoId)
      .then(() => {
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        );

        setIsTodoDeleted(true);
      })
      .catch(() => {
        setTodos(todos);
        setErrorMessage('Unable to delete a todo');
      })
      .finally(() => {
        setTodoIds(prevIds => prevIds.filter(tId => todoId !== tId));
        setIsLoading(false);
      });
  };

  const addTodo = (todo: Todo) => {
    setIsLoading(true);

    return todoService
      .createTodo(todo)
      .then(newTodoData => {
        setTodos(prevTodos => [...prevTodos, newTodoData]);
        setNewTodo('');
      })
      .catch(() => {
        setErrorMessage('Unable to add a todo');
      })
      .finally(() => setIsLoading(false));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newTodoTitle = newTodo.trim();

    if (newTodoTitle === '') {
      setErrorMessage('Title should not be empty');

      return;
    }

    const newTodoItem = {
      id: 0,
      title: newTodoTitle,
      completed: false,
      userId: USER_ID,
    };

    setTempTodo(newTodoItem);

    setIsSubmiting(true);

    addTodo(newTodoItem).finally(() => {
      setIsSubmiting(false);
      setTempTodo(null);
    });
  };

  const updateTodo = (updatedTodo: Todo) => {
    setTodoIds(prevIds => [...prevIds, updatedTodo.id]);
    setIsLoading(true);

    todoService
      .updateTodo(updatedTodo)
      .then(todo => {
        setTodos(currentTodos => {
          const newTodos = [...currentTodos];
          const index = newTodos.findIndex(t => t.id === updatedTodo.id);

          newTodos.splice(index, 1, todo);

          return newTodos;
        });
      })

      .catch(() => setErrorMessage('Unable to update a todo'))
      .finally(() => {
        setTodoIds(prevIds => prevIds.filter(tId => updatedTodo.id !== tId));
        setIsLoading(false);
      });
  };

  const toggleTodoStatus = async (toggleTodo: Todo) => {
    try {
      setTodoIds(prevIds => [...prevIds, toggleTodo.id]);
      setIsLoading(true);

      const changedTodo = { ...toggleTodo, completed: !toggleTodo.completed };

      updateTodo(changedTodo);
    } catch (error) {
      setErrorMessage('Unable to update todo status');
    } finally {
      setTodoIds(prevIds => prevIds.filter(tId => tId !== toggleTodo.id));
      setIsLoading(false);
    }
  };

  const toggleAllTodos = async () => {
    const areAllCompleted = todos.every(todo => todo.completed);

    const updatedTodos = todos.map(todo => ({
      ...todo,
      completed: !areAllCompleted,
    }));

    for (const todo of updatedTodos) {
      setIsLoading(true);
      setTodoIds(prevIds => [...prevIds, todo.id]);
      try {
        updateTodo(todo);
      } catch {
        setErrorMessage('Unable to update todos');
      } finally {
        setTodoIds(prevIds => prevIds.filter(tId => tId !== todo.id));
        setIsLoading(false);
      }
    }
  };

  const deleteAllCompleted = async () => {
    try {
      setIsLoading(true);

      if (completedTodos.length === 0) {
        return;
      }

      completedTodos.map(todo => deleteTodo(todo.id));

      setTodos(todos.filter(todo => !todo.completed));
    } finally {
      setIsLoading(false);
    }
  };

  if (errorMessage) {
    setTimeout(() => setErrorMessage(null), 3000);
  }

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>
      <div className="todoapp__content">
        <Header
          newTodo={newTodo}
          setNewTodo={setNewTodo}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isLoading={isLoading}
          isTodoDeleted={isTodoDeleted}
          toggleAllTodos={toggleAllTodos}
          unCompletedTodos={unCompletedTodos}
        />
        <TodoList
          todos={visibleTodos}
          deleteTodo={deleteTodo}
          todoIds={todoIds}
          tempTodo={tempTodo}
          toggleTodoStatus={toggleTodoStatus}
          isLoading={isLoading}
          setTodoIds={setTodoIds}
        />
        {todos.length > 0 && (
          <Footer
            unCompletedCount={unCompletedTodos.length}
            filterType={filterType}
            setFilterType={setFilterType}
            completedTodosCount={completedTodos.length}
            deleteAllCompleted={deleteAllCompleted}
          />
        )}
      </div>
      {/* Error notification */}
      <div
        data-cy="ErrorNotification"
        className={cn(
          'notification is-danger is-light has-text-weight-normal',
          { hidden: !errorMessage },
        )}
      >
        <button data-cy="HideErrorButton" type="button" className="delete" />
        {errorMessage}
      </div>
    </div>
  );
};
