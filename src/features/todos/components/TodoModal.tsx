import { useEffect, type FC } from 'react';
import { Modal, Form, Input, DatePicker, Select } from 'antd';
import dayjs from 'dayjs';
import { Todo, CreateTodoInput } from '@/types/todo';

interface TodoModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (data: CreateTodoInput, editId?: string) => void;
  editingTodo?: Todo | null;
  defaultDate?: string;
}

export const TodoModal: FC<TodoModalProps> = ({
  open,
  onCancel,
  onSubmit,
  editingTodo,
  defaultDate,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editingTodo) {
      form.setFieldsValue({
        title: editingTodo.title,
        description: editingTodo.description,
        targetDate: dayjs(editingTodo.targetDate),
        priority: editingTodo.priority,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        targetDate: defaultDate ? dayjs(defaultDate) : dayjs(),
        priority: 'MEDIUM',
      });
    }
  }, [editingTodo, defaultDate, open, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(
        {
          title: values.title,
          description: values.description,
          targetDate: values.targetDate.format('YYYY-MM-DD'),
          priority: values.priority,
        },
        editingTodo ? editingTodo.id : undefined,
      );
      form.resetFields();
    } catch {
      // Form validation failed
    }
  };

  return (
    <Modal
      open={open}
      title={editingTodo ? 'Edit Task' : 'Create New Task'}
      onCancel={onCancel}
      onOk={handleOk}
      okText={editingTodo ? 'Save Changes' : 'Create Task'}
      cancelText="Cancel"
      centered
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="pt-3">
        <Form.Item
          name="title"
          label="Task Title"
          rules={[{ required: true, message: 'Please enter the task title' }]}
        >
          <Input placeholder="e.g. Complete quarterly report..." className="rounded" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="targetDate"
            label="Target Date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker className="w-full rounded" format="MMM DD, YYYY" allowClear={false} />
          </Form.Item>

          <Form.Item name="priority" label="Priority Level">
            <Select
              className="w-full"
              options={[
                { value: 'HIGH', label: '🔴 High Priority' },
                { value: 'MEDIUM', label: '🟡 Medium Priority' },
                { value: 'LOW', label: '🔵 Low Priority' },
              ]}
            />
          </Form.Item>
        </div>

        <Form.Item name="description" label="Detailed Notes / Description (optional)">
          <Input.TextArea
            rows={3}
            placeholder="Objectives, references, or key notes..."
            className="rounded"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
