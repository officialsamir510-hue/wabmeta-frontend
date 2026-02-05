import React, { useRef, useState } from "react";
import { Upload, FileText, AlertCircle, Download, Loader2 } from "lucide-react";
import { contacts as contactsApi } from "../../services/api";
import { parseCsvFile, downloadSampleCsv } from "../../utils/csvContacts";

type Props = {
  onImported?: (batchTag: string) => void;
};

const CsvAudienceUploader: React.FC<Props> = ({ onImported }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handlePick = () => inputRef.current?.click();

  const handleFile = async (file: File) => {
    setSuccessMsg(null);
    setErrors([]);
    setUploading(true);

    try {
      const { contacts, errors } = await parseCsvFile(file);

      if (errors.length) {
        setErrors(errors.slice(0, 10));
        return;
      }

      if (!contacts.length) {
        setErrors(["No valid rows found in CSV"]);
        return;
      }

      // ✅ batchTag so we can identify imported contacts easily
      const batchTag = `csv_${Date.now()}`;

      // attach batchTag to every row tags (end me tag + batchTag)
      const payloadContacts = contacts.map((c) => ({
        ...c,
        tags: Array.from(new Set([...(c.tags || []), batchTag])),
      }));

      // backend expects JSON body (not file)
      const payload = {
        contacts: payloadContacts,
        tags: [batchTag],          // overall tags
        skipDuplicates: true,
      };

      const res = await contactsApi.import(payload);

      const msg =
        res.data?.message ||
        `Imported ${payloadContacts.length} contacts`;

      setSuccessMsg(msg);

      // callback to campaign page
      onImported?.(batchTag);
    } catch (e: any) {
      console.error(e);
      setErrors([
        e?.response?.data?.message ||
          e?.response?.data?.error?.message ||
          e.message ||
          "Failed to import CSV",
      ]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Upload CSV</h3>
          <p className="text-sm text-gray-500 mt-1">
            CSV format: <strong>Name, Phone, Email (optional), Tag</strong>
          </p>
        </div>

        <button
          onClick={downloadSampleCsv}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100"
        >
          <Download className="w-4 h-4" />
          Sample CSV
        </button>
      </div>

      <div
        className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-primary-400 transition-colors cursor-pointer"
        onClick={handlePick}
      >
        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <p className="font-medium text-gray-900">Choose CSV File</p>
        <p className="text-sm text-gray-500 mt-1">Click to select a .csv file</p>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.currentTarget.value = ""; // allow re-upload same file
          }}
        />
      </div>

      {uploading && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          Uploading & importing contacts...
        </div>
      )}

      {successMsg && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          {successMsg}
        </div>
      )}

      {errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 text-red-700 font-medium text-sm">
            <AlertCircle className="w-4 h-4" />
            CSV Import Failed
          </div>
          <ul className="mt-2 text-sm text-red-600 list-disc pl-5 space-y-1">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CsvAudienceUploader;