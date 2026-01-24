import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Users,
  ArrowRight,
  Loader2
} from 'lucide-react';
import ImportUploader from '../components/contacts/ImportUploader';
import { contacts as contactApi } from '../services/api';

interface ImportResult {
  total: number;
  imported: number;
  duplicates: number;
  errors: number;
}

const ImportContacts: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'>('upload');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  
  // Mapping State
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({
    name: '',
    phone: '',
    email: '',
    company: ''
  });

  // Handle File Upload & Parsing
  const handleImport = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setParsedData(results.data);
          setCsvHeaders(Object.keys(results.data[0] as object));
          
          // Auto-map common fields
          const headers = Object.keys(results.data[0] as object).map(h => h.toLowerCase());
          const newMapping = { ...fieldMapping };
          
          if (headers.includes('name')) newMapping.name = 'Name';
          else if (headers.includes('first name')) newMapping.name = 'First Name';
          
          if (headers.includes('phone')) newMapping.phone = 'Phone';
          else if (headers.includes('mobile')) newMapping.phone = 'Mobile';
          
          if (headers.includes('email')) newMapping.email = 'Email';
          
          // Reverse lookup to find original header names
          const originalHeaders = Object.keys(results.data[0] as object);
          const finalMapping: any = {};
          
          Object.keys(newMapping).forEach(key => {
            const match = originalHeaders.find(h => h.toLowerCase() === newMapping[key]?.toLowerCase());
            if (match) finalMapping[key] = match;
          });

          setFieldMapping(prev => ({ ...prev, ...finalMapping }));
          setStep('mapping');
        } else {
          alert("The uploaded file is empty or invalid.");
        }
      },
      error: (err) => {
        console.error("CSV Parse Error:", err);
        alert("Failed to parse CSV file. Please check the format.");
      }
    });
  };

  const handleConfirmMapping = () => {
    if (!fieldMapping.phone) {
      alert("Phone number mapping is required!");
      return;
    }
    setStep('preview');
  };

  // Start Import Process
  const handleStartImport = async () => {
    setStep('importing');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process in batches of 50 to avoid overloading the server
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < parsedData.length; i += batchSize) {
      batches.push(parsedData.slice(i, i + batchSize));
    }

    try {
      for (const batch of batches) {
        const formattedBatch = batch.map((row: any) => ({
          name: row[fieldMapping.name] || 'Unknown',
          phone: String(row[fieldMapping.phone] || '').replace(/[^0-9+]/g, ''),
          email: row[fieldMapping.email] || '',
          company: row[fieldMapping.company] || '',
          tags: ['Imported']
        })).filter((c: any) => c.phone && c.phone.length >= 10); // Basic validation

        if (formattedBatch.length > 0) {
          try {
            // No bulkCreate endpoint, use Promise.allSettled for individual creation
            await Promise.allSettled(
              formattedBatch.map((contact: any) =>
                contactApi.create(contact)
                  .then(() => successCount++)
                  .catch(() => errorCount++)
              )
            );
          } catch (err) {
            // Handle unexpected errors
            errorCount += formattedBatch.length;
          }
        }
        errorCount += (batch.length - formattedBatch.length); // Count skipped invalid rows
      }
    } catch (error) {
      console.error("Import Error:", error);
    }

    setImportResult({
      total: parsedData.length,
      imported: successCount,
      duplicates: 0, // Backend usually handles this, simplified here
      errors: errorCount + (parsedData.length - successCount - errorCount)
    });
    
    setStep('complete');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/dashboard/contacts"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Contacts</h1>
          <p className="text-gray-500 mt-1">Upload and import contacts from CSV or Excel file</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          {['Upload File', 'Map Columns', 'Preview', 'Complete'].map((label, index) => {
            const steps = ['upload', 'mapping', 'preview', 'importing', 'complete'];
            const currentStepIndex = steps.indexOf(step);
            // Treat importing same as preview index visually or create new step
            const visualIndex = step === 'importing' ? 2 : currentStepIndex; 
            
            const isActive = index === visualIndex;
            const isCompleted = index < visualIndex;

            return (
              <div key={label} className="flex items-center">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    isCompleted
                      ? 'bg-primary-500 text-white'
                      : isActive
                        ? 'bg-primary-500 text-white ring-4 ring-primary-100'
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                  </div>
                  <span className={`ml-3 font-medium hidden sm:inline ${
                    isActive ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`w-12 lg:w-24 h-1 mx-4 rounded ${
                    isCompleted ? 'bg-primary-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        {/* Upload Step */}
        {step === 'upload' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Upload Your File</h2>
            <ImportUploader onImport={handleImport} />
          </div>
        )}

        {/* Mapping Step */}
        {step === 'mapping' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Map Columns</h2>
            <p className="text-gray-500 mb-6">Match the columns from your file to WabMeta contact fields</p>

            <div className="space-y-4">
              {[
                { key: 'name', label: 'Full Name', required: false },
                { key: 'phone', label: 'Phone Number', required: true },
                { key: 'email', label: 'Email', required: false },
                { key: 'company', label: 'Company', required: false }
              ].map((field) => (
                <div key={field.key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WabMeta Field {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{field.label}</span>
                    </div>
                  </div>
                  
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CSV Column
                    </label>
                    <select
                      value={fieldMapping[field.key] || ''}
                      onChange={(e) => setFieldMapping({ ...fieldMapping, [field.key]: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="">-- Select Column --</option>
                      {csvHeaders.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setStep('upload')}
                className="px-5 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleConfirmMapping}
                className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
              >
                Continue to Preview
              </button>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Preview Import</h2>
            <p className="text-gray-500 mb-6">Review the data before importing</p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-2 text-blue-800">
                <Users className="w-5 h-5" />
                <span className="font-medium">{parsedData.length} contacts</span>
                <span>will be imported</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 max-h-96">
              <table className="w-full relative">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parsedData.slice(0, 10).map((row, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-gray-900">{row[fieldMapping.name] || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{row[fieldMapping.phone] || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{row[fieldMapping.email] || '-'}</td>
                      <td className="px-4 py-3">
                        {row[fieldMapping.phone] ? (
                          <span className="inline-flex items-center space-x-1 text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-sm">Valid</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">Missing Phone</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Showing first 10 of {parsedData.length} contacts
            </p>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setStep('mapping')}
                className="px-5 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleStartImport}
                className="flex items-center space-x-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Import {parsedData.length} Contacts</span>
              </button>
            </div>
          </div>
        )}

        {/* Importing Step */}
        {step === 'importing' && (
          <div className="py-16 text-center">
            <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Importing Contacts...</h2>
            <p className="text-gray-500">Please wait while we process your file. Do not close this window.</p>
          </div>
        )}

        {/* Complete Step */}
        {step === 'complete' && importResult && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Complete!</h2>
            <p className="text-gray-500 mb-8">Your contacts have been successfully imported</p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-3xl font-bold text-gray-900">{importResult.total}</p>
                <p className="text-sm text-gray-500">Total Processed</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-3xl font-bold text-green-600">{importResult.imported}</p>
                <p className="text-sm text-gray-500">Imported</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4">
                <p className="text-3xl font-bold text-yellow-600">{importResult.duplicates}</p>
                <p className="text-sm text-gray-500">Duplicates/Skipped</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-3xl font-bold text-red-600">{importResult.errors}</p>
                <p className="text-sm text-gray-500">Errors</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/contacts')}
                className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
              >
                View Contacts
              </button>
              <button
                onClick={() => {
                  setStep('upload');
                  setImportResult(null);
                  setParsedData([]);
                  setFieldMapping({ name: '', phone: '', email: '', company: '' });
                }}
                className="px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
              >
                Import More
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tips Card */}
      {step === 'upload' && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Tips for Successful Import</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 mt-1 shrink-0" />
              <span>Phone numbers should include country code (e.g., +91 for India)</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 mt-1 shrink-0" />
              <span>First row should contain column headers</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 mt-1 shrink-0" />
              <span>Supported formats: CSV, XLS, XLSX</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImportContacts;