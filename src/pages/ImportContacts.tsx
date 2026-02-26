import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Papa from "papaparse";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Users,
  Loader2,
  Download,
  RefreshCw,
  Upload,
} from "lucide-react";

interface ImportResult {
  total: number;      // total rows in CSV
  imported: number;   // created
  duplicates: number; // skipped
  errors: number;     // failed
}

type Step = "upload" | "mapping" | "preview" | "importing" | "complete";

type Failure = { row: number; error: string };

const normalizePhoneDigits = (v: any) => String(v ?? "").trim().replace(/[^\d]/g, "");
const isValidEmail = (v: any) => {
  const s = String(v ?? "").trim();
  if (!s) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
};
const splitName = (full: string) => {
  const s = String(full || "").trim();
  if (!s) return { firstName: undefined, lastName: undefined };
  const parts = s.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: undefined };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
};

const ImportContacts: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("upload");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const [parsedData, setParsedData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [failures, setFailures] = useState<Failure[]>([]);

  // Mapping State
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({
    name: "",
    phone: "",
    email: "",
    company: "",
  });

  const autoDetectHeader = (headers: string[], candidates: string[]) => {
    const lower = headers.map((h) => h.toLowerCase().trim());
    for (const c of candidates) {
      const idx = lower.indexOf(c.toLowerCase());
      if (idx >= 0) return headers[idx];
    }
    return "";
  };

  // Handle File Upload & Parsing
  const handleImport = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = (results.data || []).filter((r: any) => r && Object.keys(r).length > 0);
          if (!rows.length) return reject(new Error("CSV file is empty"));

          const headers = Object.keys(rows[0] as object);

          setParsedData(rows);
          setCsvHeaders(headers);
          setFailures([]);
          setImportResult(null);

          // Auto-map
          const mapped = {
            name: autoDetectHeader(headers, ["name", "full name", "fullname", "customer name"]),
            phone: autoDetectHeader(headers, ["phone", "mobile", "whatsapp", "number", "phone number"]),
            email: autoDetectHeader(headers, ["email", "email address"]),
            company: autoDetectHeader(headers, ["company", "business", "organization"]),
          };

          setFieldMapping((prev) => ({ ...prev, ...mapped }));
          setStep("mapping");
          resolve();
        },
        error: (err) => reject(new Error(err?.message || "CSV parse failed")),
      });
    });
  };

  const handleConfirmMapping = () => {
    if (!fieldMapping.phone) {
      alert("Phone number mapping is required!");
      return;
    }
    setStep("preview");
  };

  // Build normalized contacts (as backend expects)
  const normalizedContacts = useMemo(() => {
    return parsedData.map((row: any, idx: number) => {
      const rawName = fieldMapping.name ? row[fieldMapping.name] : "";
      const rawPhone = fieldMapping.phone ? row[fieldMapping.phone] : "";
      const rawEmail = fieldMapping.email ? row[fieldMapping.email] : "";
      const rawCompany = fieldMapping.company ? row[fieldMapping.company] : "";

      const phone = normalizePhoneDigits(rawPhone); // ✅ digits only
      const email = isValidEmail(rawEmail) ? String(rawEmail).trim() : undefined;
      const { firstName, lastName } = splitName(String(rawName || "").trim());

      return {
        __rowIndex: idx + 2, // +2 because CSV header is row 1, data starts row 2
        phone,
        countryCode: "+91",
        firstName,
        lastName,
        email, // undefined if invalid
        tags: ["Imported"],
        customFields: rawCompany
          ? { company: String(rawCompany).trim(), source: "csv" }
          : { source: "csv" },
      };
    });
  }, [parsedData, fieldMapping]);

  const previewRows = useMemo(() => normalizedContacts.slice(0, 10), [normalizedContacts]);

  const stats = useMemo(() => {
    const total = normalizedContacts.length;
    const valid = normalizedContacts.filter(
      (c) => c.phone && /^\d+$/.test(c.phone) && c.phone.length >= 10 && c.phone.length <= 15
    ).length;
    return { total, valid, invalid: total - valid };
  }, [normalizedContacts]);

  const downloadErrorCsv = () => {
    if (!failures.length) return;

    const header = "Row,Error\n";
    const rows = failures
      .map((f) => `${f.row},"${String(f.error).replace(/"/g, '""')}"`)
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "wabmeta-import-errors.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  // Bulk Import
  const handleStartImport = async () => {
    setStep("importing");
    setFailures([]);

    try {
      const contacts = normalizedContacts
        .filter(
          (c) => c.phone && /^\d+$/.test(c.phone) && c.phone.length >= 10 && c.phone.length <= 15
        )
        .map((c) => ({
          phone: c.phone,
          countryCode: c.countryCode || "+91",
          firstName: c.firstName,
          lastName: c.lastName,
          ...(c.email ? { email: c.email } : {}), // ✅ don’t send empty email
          tags: c.tags || ["Imported"],
          customFields: c.customFields || {},
        }));

      if (contacts.length === 0) {
        alert("No valid contacts found. Please check phone column mapping/values.");
        setStep("preview");
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/contacts/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contacts,
          skipDuplicates: true,
          tags: ["Imported"],
        }),
      });

      const json = await res.json();

      if (!res.ok || !json?.success) {
        throw new Error(json?.error || json?.message || "Import failed");
      }

      const data = json.data as {
        imported: number;
        skipped: number;
        failed: number;
        errors: Failure[];
      };

      setImportResult({
        total: stats.total,
        imported: data.imported || 0,
        duplicates: data.skipped || 0,
        errors: (data.failed || 0) + stats.invalid, // include local invalid count too
      });

      setFailures(data.errors || []);
      setStep("complete");
    } catch (e: any) {
      alert(e?.message || "Import failed");
      setStep("preview");
    }
  };

  const resetAll = () => {
    setStep("upload");
    setImportResult(null);
    setParsedData([]);
    setCsvHeaders([]);
    setFailures([]);
    setFieldMapping({ name: "", phone: "", email: "", company: "" });
  };

  // Progress step UI helper
  const visualStepIndex = useMemo(() => {
    const steps: Step[] = ["upload", "mapping", "preview", "importing", "complete"];
    const idx = steps.indexOf(step);
    return step === "importing" ? 2 : idx;
  }, [step]);

  // Download Sample CSV
  const downloadSampleCsv = () => {
    const header = "Name,Phone,Email,Company\n";
    const rows = [
      "John Doe,919876543210,john@example.com,WabMeta Inc",
      "Jane Smith,918877665544,jane@example.com,Design Agency",
    ].join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "wabmeta-sample-contacts.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/dashboard/contacts" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Contacts</h1>
          <p className="text-gray-500 mt-1">Upload and import contacts from CSV</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          {["Upload File", "Map Columns", "Preview", "Complete"].map((label, index) => {
            const isActive = index === visualStepIndex;
            const isCompleted = index < visualStepIndex;

            return (
              <div key={label} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${isCompleted
                      ? "bg-primary-500 text-white"
                      : isActive
                        ? "bg-primary-500 text-white ring-4 ring-primary-100"
                        : "bg-gray-200 text-gray-500"
                      }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                  </div>
                  <span className={`ml-3 font-medium hidden sm:inline ${isActive ? "text-gray-900" : "text-gray-500"}`}>
                    {label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`w-12 lg:w-24 h-1 mx-4 rounded ${isCompleted ? "bg-primary-500" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        {/* Upload */}
        {step === "upload" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Upload Your File</h2>
              <button
                onClick={downloadSampleCsv}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                title="Download Sample CSV"
              >
                <Download className="w-4 h-4" />
                Sample CSV
              </button>
            </div>
            {/* Simple File Input for now to avoid prop mismatch */}
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center hover:bg-gray-50 transition-all cursor-pointer group"
              onClick={() => document.getElementById('file-upload')?.click()}>
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImport(file);
                }}
              />
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-primary-500" />
              </div>
              <p className="text-lg font-medium text-gray-900">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500 mt-1">CSV files only (max 10MB)</p>
            </div>
          </>
        )}

        {/* Mapping */}
        {step === "mapping" && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Map Columns</h2>
            <p className="text-gray-500 mb-6">Match your CSV columns to WabMeta fields</p>

            <div className="space-y-4">
              {[
                { key: "name", label: "Full Name", required: false },
                { key: "phone", label: "Phone Number", required: true },
                { key: "email", label: "Email", required: false },
                { key: "company", label: "Company (saved in custom fields)", required: false },
              ].map((field) => (
                <div key={field.key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={fieldMapping[field.key] || ""}
                      onChange={(e) => setFieldMapping({ ...fieldMapping, [field.key]: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg"
                    >
                      <option value="">-- Select Column --</option>
                      {csvHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={resetAll} className="px-5 py-2.5 text-gray-700 rounded-xl hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={handleConfirmMapping} className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl">
                Continue to Preview
              </button>
            </div>
          </>
        )}

        {/* Preview */}
        {step === "preview" && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Preview Import</h2>
            <p className="text-gray-500 mb-4">
              Phone will be stored as <span className="font-medium">digits only</span> (backend requirement). Invalid rows will be skipped.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-blue-800">
                <Users className="w-5 h-5" />
                <span className="font-medium">{stats.total} rows</span>
                <span>•</span>
                <span className="font-medium">{stats.valid} valid</span>
                <span>•</span>
                <span className="font-medium">{stats.invalid} invalid</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 max-h-96">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Row</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">First</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Last</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {previewRows.map((c, idx) => {
                    const ok = c.phone && /^\d+$/.test(c.phone) && c.phone.length >= 10 && c.phone.length <= 15;
                    return (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-gray-600">{c.__rowIndex}</td>
                        <td className="px-4 py-3">{c.firstName || "-"}</td>
                        <td className="px-4 py-3">{c.lastName || "-"}</td>
                        <td className="px-4 py-3">{c.phone || "-"}</td>
                        <td className="px-4 py-3">{c.email || "-"}</td>
                        <td className="px-4 py-3">
                          {ok ? (
                            <span className="inline-flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="w-4 h-4" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600">
                              <AlertCircle className="w-4 h-4" /> Invalid phone
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setStep("mapping")} className="px-5 py-2.5 text-gray-700 rounded-xl hover:bg-gray-100">
                Back
              </button>
              <button onClick={handleStartImport} className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl">
                Import {stats.valid} Contacts
              </button>
            </div>
          </>
        )}

        {/* Importing */}
        {step === "importing" && (
          <div className="py-16 text-center">
            <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Importing...</h2>
            <p className="text-gray-500">Uploading in one batch (fast & safe).</p>
          </div>
        )}

        {/* Complete */}
        {step === "complete" && importResult && (
          <div className="py-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Complete!</h2>
              <p className="text-gray-500 mb-8">Contacts processed successfully.</p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-3xl font-bold text-gray-900">{importResult.total}</p>
                  <p className="text-sm text-gray-500">Total Rows</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-3xl font-bold text-green-600">{importResult.imported}</p>
                  <p className="text-sm text-gray-500">Imported</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4">
                  <p className="text-3xl font-bold text-yellow-600">{importResult.duplicates}</p>
                  <p className="text-sm text-gray-500">Duplicates Skipped</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-3xl font-bold text-red-600">{importResult.errors}</p>
                  <p className="text-sm text-gray-500">Errors / Invalid</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => navigate("/dashboard/contacts")}
                  className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl"
                >
                  View Contacts
                </button>
                <button
                  onClick={resetAll}
                  className="px-6 py-2.5 text-gray-700 rounded-xl hover:bg-gray-100 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Import More
                </button>
              </div>
            </div>

            {/* Errors list */}
            {failures.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Import Errors</h3>
                  <button
                    onClick={downloadErrorCsv}
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download error report
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Row</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {failures.slice(0, 200).map((f, i) => (
                        <tr key={i}>
                          <td className="px-4 py-3 text-gray-700">{f.row}</td>
                          <td className="px-4 py-3 text-red-700">{f.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {failures.length > 200 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Showing first 200 errors. Download report for full list.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportContacts;