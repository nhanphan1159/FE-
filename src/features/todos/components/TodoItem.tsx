import { useState, type FC } from 'react';
import { Card, Tag, Button, Popconfirm, Tooltip } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CalendarOutlined,
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { Todo, TodoPriority, TodoStatus } from '@/types/todo';
import { SubTaskList } from '@/features/todos/components/SubTaskList';
import { formatDate } from '@/utils/format';
import dayjs from 'dayjs';

interface TodoItemProps {
  todo: Todo;
  onStatusChange: (id: string, status: TodoStatus) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onAddSubTask: (todoId: string, title: string) => void;
  onToggleSubTask: (subTaskId: string) => void;
  onDeleteSubTask: (subTaskId: string) => void;
}

const priorityConfig: Record<TodoPriority, { color: string; label: string }> = {
  HIGH: { color: 'red', label: 'High Priority' },
  MEDIUM: { color: 'orange', label: 'Medium Priority' },
  LOW: { color: 'blue', label: 'Low Priority' },
};

export const TodoItem: FC<TodoItemProps> = ({
  todo,
  onStatusChange,
  onEdit,
  onDelete,
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
}) => {
  const [expanded, setExpanded] = useState(true);

  const isCompleted = todo.status === 'COMPLETED';
  const targetDateDayjs = dayjs(todo.targetDate);
  const isPast = targetDateDayjs.isBefore(dayjs(), 'day');
  const isToday = targetDateDayjs.isSame(dayjs(), 'day');

  const toggleComplete = () => {
    onStatusChange(todo.id, isCompleted ? 'PENDING' : 'COMPLETED');
  };

  return (
    <Card
      className={`border rounded-xl transition-all shadow-sm hover:shadow-md mb-3 ${
        isCompleted ? 'bg-gray-50/80 border-gray-200 opacity-80' : 'bg-white border-slate-200'
      }`}
      bodyStyle={{ padding: '16px' }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Checkbox for main task */}
        <button
          onClick={toggleComplete}
          className="mt-0.5 text-xl flex-shrink-0 transition-transform active:scale-90"
        >
          {isCompleted ? (
            <CheckCircleFilled className="text-emerald-500" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-emerald-500 transition-colors" />
          )}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4
              className={`text-base font-medium m-0 transition-all ${
                isCompleted ? 'line-through text-gray-400' : 'text-gray-800'
              }`}
            >
              {todo.title}
            </h4>

            {/* Priority Tag */}
            <Tag color={priorityConfig[todo.priority].color} className="rounded-full px-2 text-xs">
              {priorityConfig[todo.priority].label}
            </Tag>

            {/* Date Tag */}
            <Tag
              icon={<CalendarOutlined />}
              color={isPast && !isCompleted ? 'volcano' : isToday ? 'processing' : 'default'}
              className="text-xs"
            >
              {isToday ? 'Today' : formatDate(todo.targetDate)}
              {isPast && !isCompleted && ' (Overdue)'}
            </Tag>
          </div>

          {/* Description */}
          {todo.description && (
            <p className="text-sm text-gray-500 mb-2 whitespace-pre-line">{todo.description}</p>
          )}

          {/* Expand/Collapse Subtasks */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium bg-blue-50 px-2 py-0.5 rounded transition-colors"
            >
              <ClockCircleOutlined />
              {todo.subtasks.length > 0
                ? `${todo.subtasks.length} subtasks`
                : 'Add subtask'}
              {expanded ? <UpOutlined className="text-[10px]" /> : <DownOutlined className="text-[10px]" />}
            </button>
          </div>

          {/* Subtasks Component */}
          {expanded && (
            <SubTaskList
              todoId={todo.id}
              subtasks={todo.subtasks}
              onAddSubTask={onAddSubTask}
              onToggleSubTask={onToggleSubTask}
              onDeleteSubTask={onDeleteSubTask}
            />
          )}
        </div>

        {/* Edit and Delete Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Tooltip title="Edit task">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined className="text-gray-400 hover:text-blue-600" />}
              onClick={() => onEdit(todo)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this task?"
            description="Are you sure you want to delete this task along with its subtasks?"
            onConfirm={() => onDelete(todo.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined className="text-gray-400 hover:text-red-600" />}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      </div>
    </Card>
  );
};
