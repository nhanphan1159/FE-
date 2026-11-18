import { useState, type FC } from 'react';
import { Checkbox, Input, Button, Progress, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { SubTask } from '@/types/todo';

interface SubTaskListProps {
  todoId: string;
  subtasks: SubTask[];
  onAddSubTask: (todoId: string, title: string) => void;
  onToggleSubTask: (subTaskId: string) => void;
  onDeleteSubTask: (subTaskId: string) => void;
}

export const SubTaskList: FC<SubTaskListProps> = ({
  todoId,
  subtasks = [],
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
}) => {
  const [newTitle, setNewTitle] = useState('');

  const completedCount = subtasks.filter((s) => s.isCompleted).length;
  const percent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAddSubTask(todoId, newTitle.trim());
    setNewTitle('');
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 bg-slate-50/70 p-3 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Subtasks & Notes ({completedCount}/{subtasks.length})
        </span>
        {subtasks.length > 0 && (
          <div className="w-24">
            <Progress percent={percent} size="small" showInfo={false} strokeColor="#10b981" />
          </div>
        )}
      </div>

      {/* Subtasks List */}
      <div className="space-y-1.5 mb-2">
        {subtasks.map((sub) => (
          <div
            key={sub.id}
            className="flex items-center justify-between group hover:bg-white p-1.5 rounded transition-all"
          >
            <Checkbox
              checked={sub.isCompleted}
              onChange={() => onToggleSubTask(sub.id)}
              className="text-sm"
            >
              <span
                className={`transition-all ${
                  sub.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'
                }`}
              >
                {sub.title}
              </span>
            </Checkbox>
            <Tooltip title="Delete note">
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => onDeleteSubTask(sub.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </Tooltip>
          </div>
        ))}
      </div>

      {/* Add New Subtask Input */}
      <div className="flex gap-2">
        <Input
          size="small"
          placeholder="Add subtask or note..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onPressEnter={handleAdd}
          className="rounded"
        />
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          disabled={!newTitle.trim()}
          className="bg-primary flex items-center justify-center"
        >
          Add
        </Button>
      </div>
    </div>
  );
};
