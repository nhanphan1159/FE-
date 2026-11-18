import { useEffect, type FC } from 'react';
import { Modal, Form, InputNumber, Input, Select, DatePicker, Alert } from 'antd';
import dayjs from 'dayjs';
import { Jar, JarCode, CreateExpenseInput, Transaction } from '@/types/finance';
import { formatCurrency } from '@/utils/format';

const categoryOptions: Record<JarCode, string[]> = {
  NEC: ['Groceries', 'Housing', 'Utilities', 'Transportation', 'Healthcare', 'Household', 'Other'],
  FFA: ['Investment', 'Brokerage', 'Retirement', 'Other'],
  LTSS: ['Emergency Fund', 'Large Purchase', 'Savings', 'Other'],
  EDU: ['Books', 'Course', 'Software', 'Workshop', 'Other'],
  PLAY: ['Dining', 'Entertainment', 'Travel', 'Hobbies', 'Shopping', 'Other'],
  GIVE: ['Charity', 'Family Support', 'Community', 'Gifts', 'Other'],
};

interface ExpenseModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (data: CreateExpenseInput) => void;
  jars: Jar[];
  initialJarType?: JarCode;
  initialTransaction?: Transaction | null;
}

export const ExpenseModal: FC<ExpenseModalProps> = ({
  open,
  onCancel,
  onSubmit,
  jars,
  initialJarType,
  initialTransaction,
}) => {
  const [form] = Form.useForm();
  const selectedJarType = Form.useWatch('jarType', form);
  const enteredAmount = Form.useWatch('amount', form);
  useEffect(() => {
    if (!open || !selectedJarType) return;
    const current = form.getFieldValue('category');
    const options = categoryOptions[selectedJarType as JarCode] || categoryOptions.NEC;
    if (!options.includes(current)) form.setFieldValue('category', options[0]);
  }, [selectedJarType, open, form]);

  const selectedJar = jars.find((j) => j.type === selectedJarType);
  const isOverBalance = selectedJar && enteredAmount && enteredAmount > selectedJar.balance;

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        jarType: initialTransaction?.jar.type || initialJarType || 'NEC',
        amount: initialTransaction?.amount,
        category: initialTransaction?.category,
        note: initialTransaction?.note,
        transactionDate: initialTransaction ? dayjs(initialTransaction.transactionDate) : dayjs(),
      });
    }
  }, [open, initialJarType, initialTransaction, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit({
        jarType: values.jarType,
        amount: values.amount,
        category: values.category,
        note: values.note,
        transactionDate: values.transactionDate.toISOString(),
      });
      form.resetFields();
    } catch {
      // validation error
    }
  };

  return (
    <Modal
      open={open}
      title={initialTransaction ? 'Edit Expense' : 'Record an Expense'}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleOk}
      okText={initialTransaction ? 'Save Changes' : 'Confirm Expense'}
      cancelText="Cancel"
      centered
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="pt-2">
        <Form.Item
          name="jarType"
          label="Deduct From Which Jar?"
          rules={[{ required: true, message: 'Please select a jar' }]}
        >
          <Select
            className="w-full"
            options={jars.map((j) => ({
              value: j.type,
              label: `${j.name} (Balance: ${formatCurrency(j.balance)})`,
            }))}
          />
        </Form.Item>

        {isOverBalance && (
          <Alert
            message="Budget Deficit Warning!"
            description={`The expense amount (${formatCurrency(enteredAmount)}) exceeds current jar balance (${formatCurrency(selectedJar?.balance || 0)}). Please review your budget!`}
            type="warning"
            showIcon
            className="mb-4 text-xs"
          />
        )}

        <Form.Item
          name="amount"
          label="Expense Amount"
          rules={[
            { required: true, message: 'Please enter expense amount' },
            { type: 'number', min: 1, message: 'Amount must be positive' },
          ]}
        >
          <InputNumber
            className="w-full text-lg font-bold rounded-lg"
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, '') : '')}
            placeholder="e.g. 50"
            prefix="$"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="category" label="Expense Category" rules={[{ required: true, message: 'Please select a category' }]}>
            <Select
              showSearch
              options={(categoryOptions[selectedJarType as JarCode] || categoryOptions.NEC).map((category) => ({ value: category, label: category }))}
              placeholder="Select category"
            />
          </Form.Item>

          <Form.Item name="transactionDate" label="Transaction Date">
            <DatePicker className="w-full rounded-lg" format="MMM DD, YYYY" allowClear={false} />
          </Form.Item>
        </div>

        <Form.Item name="note" label="Additional Notes">
          <Input.TextArea rows={2} placeholder="Expense details..." className="rounded-lg" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
