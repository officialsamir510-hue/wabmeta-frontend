import React from 'react';
import { Info, User, Phone, Mail, Building2, MapPin, Calendar, Hash } from 'lucide-react';

interface VariableMapperProps {
  variables: string[];
  mapping: Record<string, string>;
  onMappingChange: (mapping: Record<string, string>) => void;
}

const VariableMapper: React.FC<VariableMapperProps> = ({
  variables,
  mapping,
  onMappingChange
}) => {
  const contactFields = [
    { value: 'first_name', label: 'First Name', icon: User },
    { value: 'last_name', label: 'Last Name', icon: User },
    { value: 'full_name', label: 'Full Name', icon: User },
    { value: 'phone', label: 'Phone Number', icon: Phone },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'company', label: 'Company', icon: Building2 },
    { value: 'address', label: 'Address', icon: MapPin },
    { value: 'custom_1', label: 'Custom Field 1', icon: Hash },
    { value: 'custom_2', label: 'Custom Field 2', icon: Hash },
    { value: 'order_id', label: 'Order ID', icon: Hash },
    { value: 'order_amount', label: 'Order Amount', icon: Hash },
    { value: 'order_date', label: 'Order Date', icon: Calendar },
  ];

  const updateMapping = (variable: string, field: string) => {
    onMappingChange({ ...mapping, [variable]: field });
  };

  if (variables.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <Info className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <h4 className="font-medium text-gray-900 mb-2">No Variables</h4>
        <p className="text-sm text-gray-500">
          The selected template doesn't have any variables to map.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Variable Mapping</h4>
            <p className="text-sm text-blue-700">
              Map each template variable to a contact field. The values will be automatically 
              replaced when sending messages.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {variables.map((variable) => (
          <div key={variable} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center space-x-4">
              {/* Variable Badge */}
              <div className="shrink-0">
                <span className="inline-flex items-center px-3 py-2 bg-primary-100 text-primary-700 rounded-lg font-mono font-medium text-sm">
                  {`{{${variable}}}`}
                </span>
              </div>

              {/* Arrow */}
              <div className="shrink-0 text-gray-400">
                →
              </div>

              {/* Field Selector */}
              <div className="flex-1">
                <select
                  value={mapping[variable] || ''}
                  onChange={(e) => updateMapping(variable, e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  <option value="">Select a field...</option>
                  <optgroup label="Contact Fields">
                    {contactFields.slice(0, 7).map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Custom Fields">
                    {contactFields.slice(7).map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Preview */}
            {mapping[variable] && (
              <div className="mt-3 pl-22">
                <p className="text-sm text-gray-500">
                  Preview: <span className="text-gray-700 font-medium">
                    {contactFields.find(f => f.value === mapping[variable])?.label || mapping[variable]}
                  </span> value will be used
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mapping Summary */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-medium text-gray-900 mb-3">Mapping Summary</h4>
        <div className="space-y-2">
          {variables.map((variable) => (
            <div key={variable} className="flex items-center justify-between text-sm">
              <span className="font-mono text-primary-600">{`{{${variable}}}`}</span>
              <span className={mapping[variable] ? 'text-green-600' : 'text-red-600'}>
                {mapping[variable] 
                  ? contactFields.find(f => f.value === mapping[variable])?.label || mapping[variable]
                  : 'Not mapped'
                }
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VariableMapper;