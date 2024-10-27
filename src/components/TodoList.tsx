import React from 'react';
import { Todo } from '../types/Todo';
import TodoItem from './TodoItem';

type Props = {
  todos: Todo[];
  deleteTodo: (id: number) => void;
  todoIds: number[];
  tempTodo?: Todo | null;
  toggleTodoStatus: (todo: Todo) => void;
  isLoading: boolean;
  setTodoIds: React.Dispatch<React.SetStateAction<number[]>>;
};

const TodoList: React.FC<Props> = ({
  todos,
  deleteTodo,
  todoIds,
  tempTodo,
  toggleTodoStatus,
  isLoading,
  setTodoIds,
}) => (
  <section className="todoapp__main" data-cy="TodoList">
    {todos.map(todo => (
      <TodoItem
        key={todo.id}
        todo={todo}
        deleteTodo={deleteTodo}
        todoIds={todoIds}
        toggleTodoStatus={toggleTodoStatus}
        isLoading={isLoading}
        setTodoIds={setTodoIds}
      />
    ))}

    {tempTodo && (
      <TodoItem
        tempTodo={tempTodo}
        key={tempTodo.id}
        todo={tempTodo}
        deleteTodo={deleteTodo}
        todoIds={todoIds}
        toggleTodoStatus={toggleTodoStatus}
        isLoading={isLoading}
        setTodoIds={setTodoIds}
      />
    )}
  </section>
);

export default TodoList;
