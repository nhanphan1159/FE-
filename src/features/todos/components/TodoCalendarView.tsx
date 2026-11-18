import { useState, type FC } from 'react';
import { Calendar, Badge, Drawer, Button, Empty, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { Todo, TodoStatus } from '@/types/todo';
import { TodoItem } from '@/features/todos/components/TodoItem';

interface TodoCalendarViewProps {
  todos: Todo[];
  onStatusChange: (id: string, status: TodoStatus) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onAddSubTask: (todoId: string, title: string) => void;
  onToggleSubTask: (subTaskId: string) => void;
  onDeleteSubTask: (subTaskId: string) => void;
  onOpenCreateModal: (date: string) => void;
}

export const TodoCalendarView: FC<TodoCalendarViewProps> = ({
  todos,
  onStatusChange,
  onEdit,
  onDelete,
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
  onOpenCreateModal,
}) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filter tasks for a specific date
  const getTasksForDate = (date: Dayjs) => {
    const formatted = date.format('YYYY-MM-DD');
    return todos.filter((t) => dayjs(t.targetDate).format('YYYY-MM-DD') === formatted);
  };

  const dayTasks = getTasksForDate(selectedDate);
  const completedDayTasks = dayTasks.filter((t) => t.status === 'COMPLETED').length;

  const handleSelectDate = (date: Dayjs) => {
    setSelectedDate(date);
    setIsDrawerOpen(true);
  };

  const cellRender = (current: Dayjs, info: { type: string }) => {
    if (info.type !== 'date') return null;

    const tasks = getTasksForDate(current);
    if (tasks.length === 0) return null;

    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    const allDone = completed === tasks.length;

    return (
      <div className="mt-1 space-y-1 overflow-hidden">
        {/* Quick status pill */}
        <div className="flex items-center gap-1 text-[11px] font-semibold">
          <Badge status={allDone ? 'success' : 'processing'} />
          <span className={allDone ? 'text-emerald-600' : 'text-blue-600'}>
            {completed}/{tasks.length} done
          </span>
        </div>

        {/* Task title chips preview */}
        <div className="space-y-0.5">
          {tasks.slice(0, 2).map((t) => (
            <div
              key={t.id}
              className={`text-[10px] px-1.5 py-0.5 rounded truncate ${
                t.status === 'COMPLETED'
                  ? 'bg-gray-100 text-gray-400 line-through'
                  : t.priority === 'HIGH'
                  ? 'bg-red-50 text-red-600 font-medium'
                  : 'bg-blue-50 text-blue-700'
              }`}
            >
              {t.title}
            </div>
          ))}
          {tasks.length > 2 && (
            <span className="text-[9px] text-gray-400 block pl-1">
              +{tasks.length - 2} more...
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
        <div>
          <h3 className="text-base font-bold text-gray-800 m-0">Monthly Task Calendar</h3>
          <span className="text-xs text-gray-500">
            Click on any day cell to manage its tasks and schedule new work
          </span>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => onOpenCreateModal(selectedDate.format('YYYY-MM-DD'))}
          className="bg-primary rounded-xl text-xs flex items-center"
        >
          Add Task for Selected Date
        </Button>
      </div>

      {/* Interactive Calendar */}
      <Calendar cellRender={cellRender} onSelect={handleSelectDate} value={selectedDate} />

      {/* Side Drawer for Selected Day's Tasks */}
      <Drawer
        title={
          <div className="flex items-center justify-between pr-4">
            <div>
              <span className="text-base font-bold text-gray-800 block">
                Tasks for {selectedDate.format('dddd, MMM DD, YYYY')}
              </span>
              <span className="text-xs text-gray-400 font-normal">
                {dayTasks.length} task(s) scheduled
              </span>
            </div>
            {dayTasks.length > 0 && (
              <Tag color={completedDayTasks === dayTasks.length ? 'green' : 'blue'}>
                {completedDayTasks}/{dayTasks.length} Completed
              </Tag>
            )}
          </div>
        }
        placement="right"
        width={540}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        extra={
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => onOpenCreateModal(selectedDate.format('YYYY-MM-DD'))}
            className="bg-primary rounded-lg text-xs"
          >
            Add Task
          </Button>
        }
      >
        <div className="space-y-3">
          {dayTasks.length === 0 ? (
            <div className="py-16 text-center">
              <Empty
                description={
                  <span className="text-gray-400 text-xs">
                    No tasks scheduled for this day yet.
                  </span>
                }
              >
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => onOpenCreateModal(selectedDate.format('YYYY-MM-DD'))}
                  className="bg-primary rounded-lg text-xs mt-2"
                >
                  Schedule a Task
                </Button>
              </Empty>
            </div>
          ) : (
            dayTasks.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddSubTask={onAddSubTask}
                onToggleSubTask={onToggleSubTask}
                onDeleteSubTask={onDeleteSubTask}
              />
            ))
          )}
        </div>
      </Drawer>
    </div>
  );
};
