import * as XLSX from 'xlsx';
import { ParsedStudentRow } from '../types';

/** Column header aliases — case-insensitive matching */
const COLUMN_ALIASES: Record<string, keyof ParsedStudentRow> = {
  'matric no':    'matricNo',
  'matric_no':    'matricNo',
  'matricno':     'matricNo',
  'matric':       'matricNo',
  'reg no':       'matricNo',
  'reg_no':       'matricNo',

  'surname':      'surname',
  'last name':    'surname',
  'lastname':     'surname',
  'family name':  'surname',

  'other names':  'otherNames',
  'other name':   'otherNames',
  'othernames':   'otherNames',
  'first name':   'otherNames',
  'firstname':    'otherNames',
  'given name':   'otherNames',
  'full name':    'otherNames',

  'department':   'department',
  'dept':         'department',

  'faculty':      'faculty',

  'course':       'course',
  'programme':    'course',
  'program':      'course',

  'level':        'level',

  'state':        'state',
  'siwes state':  'state',
  'placement state': 'state',
  'state of siwes': 'state',

  'lga':          'lga',
  'location':     'lga',
  'city':         'lga',
  'l.g.a':        'lga',
  'lg area':      'lga',

  'email':        'email',
  'e-mail':       'email',
  'email address':'email',

  'phone':        'phone',
  'phone no':     'phone',
  'phone number': 'phone',
  'mobile':       'phone',
  'gsm':          'phone',
  'tel':          'phone',

  'gender':       'gender',
  'sex':          'gender',

  'industry':     'industry',
  'company':      'industry',
  'placement':    'industry',
  'organisation': 'industry',
  'organization': 'industry',
  'establishment':'industry',
  'address':      'address',
  'contact address': 'address',
};

const REQUIRED_COLUMNS: (keyof ParsedStudentRow)[] = [
  'matricNo',
  'surname',
  'otherNames',
  'level',
  'state',
];

export interface ParseResult {
  rows: ParsedStudentRow[];
  columnErrors: string[];
  totalRows: number;
  validRows: number;
}

function normalizeHeader(h: string): string {
  return h.toLowerCase().trim().replace(/\s+/g, ' ');
}

export async function parseStudentFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, {
          defval: '',
          raw: false,
        });

        if (raw.length === 0) {
          resolve({ rows: [], columnErrors: ['File is empty'], totalRows: 0, validRows: 0 });
          return;
        }

        // Build header map: detected column name → field key
        const headerMap: Record<string, keyof ParsedStudentRow> = {};
        const rawHeaders = Object.keys(raw[0]);
        for (const h of rawHeaders) {
          const alias = normalizeHeader(h);
          if (COLUMN_ALIASES[alias]) {
            headerMap[h] = COLUMN_ALIASES[alias];
          }
        }

        const detectedFields = new Set(Object.values(headerMap));
        const columnErrors: string[] = [];
        for (const req of REQUIRED_COLUMNS) {
          if (!detectedFields.has(req)) {
            columnErrors.push(`Missing required column: ${req}`);
          }
        }

        const rows: ParsedStudentRow[] = raw.map((rawRow, idx) => {
          const row: ParsedStudentRow = {
            matricNo:   '',
            surname:    '',
            otherNames: '',
            department: '',
            faculty:    '',
            course:     '',
            level:      '',
            state:      '',
            lga:        '',
            address:    '',
            _rowIndex:  idx + 2,
            _errors:    [],
          };

          for (const [rawKey, field] of Object.entries(headerMap)) {
            const val = String((rawRow as Record<string, unknown>)[rawKey] ?? '').trim();
            (row as unknown as Record<string, unknown>)[field] = val;
          }

          // Combine surname + otherNames for display name (will be done in API layer)
          for (const req of REQUIRED_COLUMNS) {
            if (!row[req]) {
              row._errors.push(`Row ${row._rowIndex}: ${req} is empty`);
            }
          }

          return row;
        });

        const validRows = rows.filter((r) => r._errors.length === 0).length;
        resolve({ rows, columnErrors, totalRows: raw.length, validRows });
      } catch (err) {
        reject(new Error(`Failed to parse file: ${(err as Error).message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
}
