export type TodoPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TodoStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  todoId: string;
  createdAt: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  status: TodoStatus;
  priority: TodoPriority;
  subtasks: SubTask[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  targetDate: string;
  priority?: TodoPriority;
  status?: TodoStatus;
}
