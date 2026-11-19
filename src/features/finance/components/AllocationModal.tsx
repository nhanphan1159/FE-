import { useState, type FC } from 'react';
import { Modal, Form, InputNumber, Input, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { Jar, AllocateIncomeInput } from '@/types/finance';
import { formatCurrency } from '@/utils/format';

interface AllocationModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (data: AllocateIncomeInput) => void;
  jars: Jar[];
}

export const AllocationModal: FC<AllocationModalProps> = ({
  open,
  onCancel,
  onSubmit,
  jars,
}) => {
  const [form] = Form.useForm();
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit({
        totalAmount: values.totalAmount,
        note: values.note,
        transactionDate: values.transactionDate?.toISOString(),
      });
      form.resetFields();
      setTotalAmount(0);
    } catch {
      // validation error
    }
  };

  return (
    <Modal
      open={open}
      title="Allocate Income Into 6 Jars (Babylon Rule)"
      onCancel={() => {
        form.resetFields();
        setTotalAmount(0);
        onCancel();
      }}
      onOk={handleOk}
      okText="Confirm Allocation"
      cancelText="Cancel"
      width={600}
      centered
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="pt-2">
        <Form.Item
          name="totalAmount"
          label="Total Income Amount"
          rules={[
            { required: true, message: 'Please enter income amount' },
            { type: 'number', min: 1, message: 'Amount must be positive' },
          ]}
        >
          <InputNumber
            className="w-full text-lg font-bold rounded-lg"
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, '') : '')}
            placeholder="e.g. 5,000"
            prefix="$"
            onChange={(val) => setTotalAmount(typeof val === 'number' ? val : Number(val) || 0)}
          />
        </Form.Item>

        <Form.Item name="note" label="Income Source / Note (e.g. Monthly Salary, Freelance project)">
          <Input placeholder="Salary, bonus, dividends, consulting..." className="rounded-lg" />
        </Form.Item>

        <Form.Item name="transactionDate" label="Allocation Date" initialValue={dayjs()}>
          <DatePicker className="w-full rounded-lg" format="MMM DD, YYYY" allowClear={false} />
        </Form.Item>

        {/* Live preview */}
        <div className="mt-4">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
            Automated Allocation Breakdown:
          </span>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {jars.map((jar) => {
              const allocated = Math.round((totalAmount * jar.targetPercentage) / 100);
              const isBabylonJar = jar.type === 'FFA';

              return (
                <div
                  key={jar.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                    isBabylonJar
                      ? 'bg-amber-50 border-amber-300 font-semibold text-amber-900'
                      : 'bg-gray-50/70 border-gray-200 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: jar.color }}
                    />
                    <div>
                      <span className="text-sm">{jar.name}</span>
                      {isBabylonJar && (
                        <span className="block text-[11px] text-amber-600 font-normal">
                          ★ Babylon Rule: Pay yourself first
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(allocated)}
                    </span>
                    <span className="text-xs text-gray-400 block">({jar.targetPercentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Form>
    </Modal>
  );
};
