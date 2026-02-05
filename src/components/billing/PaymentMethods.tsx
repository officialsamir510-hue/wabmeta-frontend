// src/components/billing/PaymentMethods.tsx

import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Star, 
  Loader2,
  X
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'bank';
  last4?: string;
  brand?: string;
  expiryMonth?: string;
  expiryYear?: string;
  upiId?: string;
  bankName?: string;
  isDefault: boolean;
  createdAt: string;
}

interface Props {
  methods: PaymentMethod[];
  onAdd: (data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSetDefault: (id: string) => Promise<void>;
}

const PaymentMethods: React.FC<Props> = ({ methods, onAdd, onDelete, onSetDefault }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'card' as 'card' | 'upi' | 'bank',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    upiId: '',
    isDefault: false,
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('add');
    
    try {
      await onAdd({
        type: formData.type,
        details: {
          cardNumber: formData.cardNumber,
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          cvv: formData.cvv,
          upiId: formData.upiId,
        },
        isDefault: formData.isDefault,
      });
      
      setShowAddModal(false);
      setFormData({
        type: 'card',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        upiId: '',
        isDefault: false,
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add payment method');
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this payment method?')) return;
    
    setLoading(id);
    try {
      await onDelete(id);
    } finally {
      setLoading(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setLoading(`default-${id}`);
    try {
      await onSetDefault(id);
    } finally {
      setLoading(null);
    }
  };

  const getCardIcon = (brand?: string) => {
    // You can add specific card brand icons here
    return <CreditCard className="w-8 h-8 text-gray-400" />;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>

      {/* Payment Methods List */}
      <div className="space-y-3">
        {methods.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No payment methods added</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-primary-600 hover:underline mt-2"
            >
              Add your first payment method
            </button>
          </div>
        ) : (
          methods.map((method) => (
            <div
              key={method.id}
              className={`flex items-center justify-between p-4 border rounded-xl ${
                method.isDefault ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-4">
                {getCardIcon(method.brand)}
                <div>
                  {method.type === 'card' && (
                    <>
                      <p className="font-medium text-gray-900">
                        {method.brand || 'Card'} •••• {method.last4}
                      </p>
                      <p className="text-sm text-gray-500">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </p>
                    </>
                  )}
                  {method.type === 'upi' && (
                    <p className="font-medium text-gray-900">{method.upiId}</p>
                  )}
                  {method.isDefault && (
                    <span className="inline-flex items-center space-x-1 text-xs text-primary-600 mt-1">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Default</span>
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    disabled={loading === `default-${method.id}`}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {loading === `default-${method.id}` ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Set Default'
                    )}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(method.id)}
                  disabled={loading === method.id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  {loading === method.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Payment Method Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Add Payment Method</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              {/* Payment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Type
                </label>
                <div className="flex space-x-3">
                  {(['card', 'upi'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium capitalize transition-colors ${
                        formData.type === type
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {type === 'card' ? '💳 Card' : '📱 UPI'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Fields */}
              {formData.type === 'card' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Month
                      </label>
                      <input
                        type="text"
                        value={formData.expiryMonth}
                        onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
                        placeholder="MM"
                        maxLength={2}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year
                      </label>
                      <input
                        type="text"
                        value={formData.expiryYear}
                        onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
                        placeholder="YY"
                        maxLength={2}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="password"
                        value={formData.cvv}
                        onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* UPI Fields */}
              {formData.type === 'upi' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    placeholder="yourname@upi"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    required
                  />
                </div>
              )}

              {/* Set as Default */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Set as default payment method</span>
              </label>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading === 'add'}
                  className="flex-1 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading === 'add' ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Add Method'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;