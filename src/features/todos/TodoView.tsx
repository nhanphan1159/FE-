import { useState, type FC } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, DatePicker, Segmented, Spin, Empty, message } from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { todoApi } from '@/services/api';
import { Todo, CreateTodoInput, TodoStatus } from '@/types/todo';
import { TodoItem } from '@/features/todos/components/TodoItem';
import { TodoModal } from '@/features/todos/components/TodoModal';
import { TodoCalendarView } from '@/features/todos/components/TodoCalendarView';

export const TodoView: FC = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filterType, setFilterType] = useState<string>('today');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string>(dayjs().format('YYYY-MM-DD'));

  // Fetch todos data
  const { data: todos = [], isLoading } = useQuery({
    queryKey: ['todos', viewMode, filterType, selectedDate.format('YYYY-MM-DD')],
    queryFn: () => {
      if (viewMode === 'calendar') {
        return todoApi.getTodos({ range: 'all' });
      }
      if (filterType === 'date') {
        return todoApi.getTodos({ date: selectedDate.format('YYYY-MM-DD') });
      }
      return todoApi.getTodos({ range: filterType as 'today' | 'past' | 'future' });
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateTodoInput) => todoApi.createTodo(data),
    onSuccess: async () => {
      message.success('New task created successfully');
      await queryClient.invalidateQueries({ queryKey: ['todos'] });
      await queryClient.refetchQueries({ queryKey: ['todos'] });
      setIsModalOpen(false);
    },
    onError: () => message.error('Failed to create task. Please check backend connection!'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTodoInput> }) =>
      todoApi.updateTodo(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['todos'] });
      await queryClient.refetchQueries({ queryKey: ['todos'] });
      setIsModalOpen(false);
      setEditingTodo(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => todoApi.deleteTodo(id),
    onSuccess: async () => {
      message.success('Task deleted');
      await queryClient.invalidateQueries({ queryKey: ['todos'] });
      await queryClient.refetchQueries({ queryKey: ['todos'] });
    },
  });

  const addSubTaskMutation = useMutation({
    mutationFn: ({ todoId, title }: { todoId: string; title: string }) =>
      todoApi.addSubTask(todoId, title),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['todos'] });
      await queryClient.refetchQueries({ queryKey: ['todos'] });
    },
  });

  const toggleSubTaskMutation = useMutation({
    mutationFn: (subTaskId: string) => todoApi.toggleSubTask(subTaskId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['todos'] });
      await queryClient.refetchQueries({ queryKey: ['todos'] });
    },
  });

  const deleteSubTaskMutation = useMutation({
    mutationFn: (subTaskId: string) => todoApi.deleteSubTask(subTaskId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['todos'] });
      await queryClient.refetchQueries({ queryKey: ['todos'] });
    },
  });

  // Statistics
  const totalTasks = todos.length;
  const completedTasks = todos.filter((t: Todo) => t.status === 'COMPLETED').length;
  const pendingTasks = totalTasks - completedTasks;

  const handleStatusChange = (id: string, status: TodoStatus) => {
    updateMutation.mutate({ id, data: { status } });
  };

  const handleModalSubmit = (data: CreateTodoInput, editId?: string) => {
    if (editId) {
      updateMutation.mutate({ id: editId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleOpenCreateForDate = (dateStr: string) => {
    setEditingTodo(null);
    setModalDefaultDate(dateStr);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Date Filter & Control Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 m-0">Daily Task Management</h2>
            <p className="text-gray-500 text-sm mt-1">
              Switch between interactive calendar and focused daily list views
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle: List vs Calendar */}
            <Segmented
              value={viewMode}
              onChange={(val) => setViewMode(val as 'list' | 'calendar')}
              options={[
                { label: 'List View', value: 'list', icon: <UnorderedListOutlined /> },
                { label: 'Calendar View', value: 'calendar', icon: <CalendarOutlined /> },
              ]}
              className="bg-gray-100 p-1 rounded-xl"
            />

            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => handleOpenCreateForDate(dayjs().format('YYYY-MM-DD'))}
              className="bg-primary shadow hover:shadow-md rounded-xl flex items-center justify-center font-medium"
            >
              Add New Task
            </Button>
          </div>
        </div>

        {/* Filter Bar (Only for List View) */}
        {viewMode === 'list' && (
          <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-gray-100">
            <Segmented
              value={filterType}
              onChange={(val) => setFilterType(val as string)}
              options={[
                { label: 'Today', value: 'today', icon: <ClockCircleOutlined /> },
                { label: 'Upcoming', value: 'future', icon: <CalendarOutlined /> },
                { label: 'Past History', value: 'past', icon: <HistoryOutlined /> },
                { label: 'Specific Date', value: 'date' },
              ]}
              className="bg-gray-100 p-1 rounded-xl"
            />

            {filterType === 'date' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Date:</span>
                <DatePicker
                  value={selectedDate}
                  onChange={(d) => d && setSelectedDate(d)}
                  format="MMM DD, YYYY"
                  allowClear={false}
                  className="rounded-lg"
                />
              </div>
            )}

            {/* Quick Metrics Badges */}
            <div className="flex items-center gap-3 text-xs font-medium text-gray-600">
              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
                Total: {totalTasks}
              </span>
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <CheckCircleOutlined /> Done: {completedTasks}
              </span>
              <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg">
                Pending: {pendingTasks}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Calendar View vs List View */}
      {isLoading ? (
        <div className="py-20 text-center">
          <Spin size="large" />
          <p className="text-gray-400 mt-3 text-sm">Loading tasks...</p>
        </div>
      ) : viewMode === 'calendar' ? (
        <TodoCalendarView
          todos={todos}
          onStatusChange={handleStatusChange}
          onEdit={(t) => {
            setEditingTodo(t);
            setIsModalOpen(true);
          }}
          onDelete={(id) => deleteMutation.mutate(id)}
          onAddSubTask={(todoId, title) => addSubTaskMutation.mutate({ todoId, title })}
          onToggleSubTask={(subTaskId) => toggleSubTaskMutation.mutate(subTaskId)}
          onDeleteSubTask={(subTaskId) => deleteSubTaskMutation.mutate(subTaskId)}
          onOpenCreateModal={handleOpenCreateForDate}
        />
      ) : todos.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Empty
            description={
              <span className="text-gray-500">
                {filterType === 'today'
                  ? 'No tasks scheduled for today. Create a task to boost your productivity!'
                  : 'No tasks found in this view.'}
              </span>
            }
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenCreateForDate(dayjs().format('YYYY-MM-DD'))}
              className="mt-2 bg-primary rounded-lg"
            >
              Create Task Now
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="space-y-3">
          {todos.map((todo: Todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onStatusChange={handleStatusChange}
              onEdit={(t) => {
                setEditingTodo(t);
                setIsModalOpen(true);
              }}
              onDelete={(id) => deleteMutation.mutate(id)}
              onAddSubTask={(todoId, title) => addSubTaskMutation.mutate({ todoId, title })}
              onToggleSubTask={(subTaskId) => toggleSubTaskMutation.mutate(subTaskId)}
              onDeleteSubTask={(subTaskId) => deleteSubTaskMutation.mutate(subTaskId)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <TodoModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingTodo(null);
        }}
        onSubmit={handleModalSubmit}
        editingTodo={editingTodo}
        defaultDate={modalDefaultDate}
      />
    </div>
  );
};
