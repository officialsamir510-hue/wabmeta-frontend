import React, { useState, useRef } from "react";
import { Upload, FileSpreadsheet, X, Check, AlertCircle, Download, Loader2 } from "lucide-react";

interface ImportUploaderProps {
  onImport: (file: File) => Promise<void> | void;
}

const ImportUploader: React.FC<ImportUploaderProps> = ({ onImport }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File): boolean => {
    const nameOk = f.name.toLowerCase().endsWith(".csv");
    if (!nameOk) {
      setError("Please upload a CSV file (.csv)");
      return false;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    const f = e.dataTransfer.files?.[0];
    if (f && validateFile(f)) setFile(f);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0];
    if (f && validateFile(f)) setFile(f);
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      await onImport(file);
    } catch (e: any) {
      setError(e?.message || "Failed to process file");
    } finally {
      setProcessing(false);
    }
  };

  const downloadSampleCsv = () => {
    const csv = [
      "Name,Phone,Email,Company",
      "Rahul Kumar,9310010763,rahul@example.com,Demo Pvt Ltd",
      "Priya Sharma,9876543210,priya@example.com,Demo Pvt Ltd",
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wabmeta-sample-contacts.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragActive ? "border-primary-500 bg-primary-50" : error ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gray-200">
            <Upload className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {dragActive ? "Drop your file here" : "Drag and drop your CSV"}
            </p>
            <p className="text-gray-500 mt-1">
              or <span className="text-primary-600 font-medium">browse</span> to upload
            </p>
          </div>
          <p className="text-sm text-gray-400">CSV only • Max 10MB</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {file && !processing && (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">{Math.round(file.size / 1024)} KB</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600" />
            <button onClick={removeFile} className="p-1 hover:bg-green-200 rounded-lg">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {processing && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <span className="font-medium text-gray-900">Processing...</span>
        </div>
      )}

      {file && !processing && (
        <div className="flex justify-end gap-3">
          <button onClick={removeFile} className="px-5 py-2.5 text-gray-700 rounded-xl hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={handleUpload} className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl">
            Upload & Continue
          </button>
        </div>
      )}

      <div className="flex items-center justify-center pt-4 border-t border-gray-200">
        <button onClick={downloadSampleCsv} className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium">
          <Download className="w-4 h-4" />
          <span>Download sample CSV template</span>
        </button>
      </div>
    </div>
  );
};

export default ImportUploader;