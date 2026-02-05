// src/utils/csvContacts.ts
import Papa from "papaparse";

export type CsvContactRow = {
  Name?: string;
  Phone?: string;
  Email?: string;
  Tag?: string;
};

export type ParsedContact = {
  phone: string;        // digits only
  countryCode: string;  // +91
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  tags?: string[];
};

const uniq = (arr: string[]) => Array.from(new Set(arr.map(s => s.trim()).filter(Boolean)));

export function normalizePhone(raw: string, defaultCountryCode = "+91") {
  const input = (raw || "").trim();

  // extract country code if user typed +91xxxx
  const m = input.match(/^\+(\d{1,3})/);
  let countryCode = defaultCountryCode;
  let rest = input;

  if (m) {
    countryCode = `+${m[1]}`;
    rest = input.replace(/^\+\d{1,3}/, "");
  }

  // keep only digits
  let phone = rest.replace(/\D/g, "");

  // common cases
  // 0XXXXXXXXXX => remove leading 0
  if (phone.length === 11 && phone.startsWith("0")) phone = phone.slice(1);

  // 91XXXXXXXXXX => remove 91 (India)
  if (!m && countryCode === "+91" && phone.length === 12 && phone.startsWith("91")) {
    phone = phone.slice(2);
  }

  return { phone, countryCode };
}

export function splitName(fullName: string) {
  const name = (fullName || "").trim().replace(/\s+/g, " ");
  if (!name) return { firstName: null, lastName: null };

  const parts = name.split(" ");
  const firstName = parts[0] || null;
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : null;
  return { firstName, lastName };
}

export function parseTags(tagValue: string | undefined) {
  if (!tagValue) return [];
  // allow "vip" or "vip|new" or "vip,new"
  return uniq(tagValue.split(/[|,]/g).map(s => s.trim()));
}

export async function parseCsvFile(file: File): Promise<{ contacts: ParsedContact[]; errors: string[] }> {
  const text = await file.text();

  const result = Papa.parse<CsvContactRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const errors: string[] = [];
  const contacts: ParsedContact[] = [];

  if (result.errors?.length) {
    result.errors.forEach(e => errors.push(`CSV parse error: ${e.message}`));
  }

  const rows = result.data || [];
  if (!rows.length) {
    return { contacts: [], errors: ["CSV is empty or headers missing"] };
  }

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // header = line1

    const name = (row as any).Name ?? (row as any).name ?? "";
    const phoneRaw = (row as any).Phone ?? (row as any).phone ?? "";
    const email = (row as any).Email ?? (row as any).email ?? "";
    const tag = (row as any).Tag ?? (row as any).tag ?? (row as any).tags ?? "";

    if (!phoneRaw) {
      errors.push(`Row ${rowNum}: Phone is required`);
      return;
    }

    const { phone, countryCode } = normalizePhone(String(phoneRaw));
    if (!/^\d+$/.test(phone)) {
      errors.push(`Row ${rowNum}: Phone must be digits only after cleaning`);
      return;
    }
    if (phone.length < 10 || phone.length > 15) {
      errors.push(`Row ${rowNum}: Phone length must be 10-15 digits`);
      return;
    }

    const { firstName, lastName } = splitName(String(name));
    const tags = parseTags(String(tag));

    // Email optional, but if present must look like email (basic check)
    const emailTrim = String(email || "").trim();
    if (emailTrim && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      errors.push(`Row ${rowNum}: Invalid email`);
      return;
    }

    contacts.push({
      phone,
      countryCode,
      firstName,
      lastName,
      email: emailTrim ? emailTrim : null,
      tags,
    });
  });

  return { contacts, errors };
}

export function downloadSampleCsv() {
  const sample =
    "Name,Phone,Email,Tag\n" +
    "John Doe,9876543210,john@example.com,vip\n" +
    "Priya Sharma,+91 98765-43210,,customers\n";

  const blob = new Blob([sample], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "contacts_sample.csv";
  a.click();
  URL.revokeObjectURL(url);
}