import * as XLSX from 'xlsx';
import { ParsedStudentRow } from '../types';

/** Column header aliases — case-insensitive matching */
const COLUMN_ALIASES: Record<string, keyof ParsedStudentRow> = {
  // Matric
  'matric no':                     'matricNo',
  'matric_no':                     'matricNo',
  'matricno':                      'matricNo',
  'matric':                        'matricNo',
  'matric number':                 'matricNo',
  'matric. number':                'matricNo',
  'reg no':                        'matricNo',
  'reg_no':                        'matricNo',
  'reg number':                    'matricNo',
  'registration number':           'matricNo',

  // Names
  'name in full (surname in capital letter)': 'name',
  'name in full':                  'name',
  'full name':                     'name',
  'student name':                  'name',
  'name':                          'name',

  'surname':                       'surname',
  'last name':                     'surname',
  'lastname':                      'surname',
  'family name':                   'surname',

  'other names':                   'otherNames',
  'other name':                    'otherNames',
  'othernames':                    'otherNames',
  'first name':                    'otherNames',
  'firstname':                     'otherNames',
  'given name':                    'otherNames',

  // Academic
  'department':                    'department',
  'dept':                          'department',
  'faculty':                       'faculty',
  'course':                        'course',
  'programme':                     'course',
  'program':                       'course',
  'programme of study':            'course',
  'program of study':              'course',
  'level':                         'level',

  // Contact
  'email':                         'email',
  'e-mail':                        'email',
  'email address':                 'email',
  'phone':                         'phone',
  'phone no':                      'phone',
  'phone number':                  'phone',
  'mobile':                        'phone',
  'gsm':                           'phone',
  'tel':                           'phone',
  'whatsapp':                      'whatsappNumber',
  'whatsapp number':               'whatsappNumber',
  'whatsapp number only':          'whatsappNumber',
  'whatsapp no':                   'whatsappNumber',
  'whats app':                     'whatsappNumber',

  // Bank & ITF stipend
  'bank name':                     'bankName',
  'bank':                          'bankName',
  'account name':                  'accountName',
  'acct name':                     'accountName',
  'bank account name':             'accountName',
  'account number':                'accountNumber',
  'account no':                    'accountNumber',
  'acct number':                   'accountNumber',
  'acct no':                       'accountNumber',
  'nuban':                         'accountNumber',
  'sort code':                     'sortCode',
  'sortcode':                      'sortCode',
  'bank sort code':                'sortCode',

  // Placement info
  'industry':                      'industry',
  'company':                       'industry',
  'placement':                     'industry',
  'organisation':                  'industry',
  'organization':                  'industry',
  'establishment':                 'industry',
  'siwes placement':               'industry',
  'address':                       'address',
  'contact address':               'address',
  'address siwes placement':       'address',
  'placement address':             'address',
  'siwes placement address':       'address',

  // Location / State
  'state':                         'state',
  'siwes state':                   'state',
  'placement state':               'state',
  'state of siwes':                'state',
  'state of placement':            'state',
  'lga':                           'lga',
  'location':                      'location',
  'city':                          'location',
  'l.g.a':                         'lga',
  'lg area':                       'lga',
  'area/local government/town/':   'lga',
  'area/local government/town':    'lga',
  'area':                          'lga',
  'local government':              'lga',
  'town':                          'lga',

  // Industry supervisor & duration
  'industry-based supervisor name': 'industrySupervisorName',
  'industry based supervisor name': 'industrySupervisorName',
  'industry supervisor name':      'industrySupervisorName',
  'industry supervisor':           'industrySupervisorName',
  'company supervisor name':       'industrySupervisorName',
  'company supervisor':            'industrySupervisorName',
  'industry-based supervisor phone number': 'industrySupervisorPhone',
  'industry based supervisor phone number': 'industrySupervisorPhone',
  'industry supervisor phone number':       'industrySupervisorPhone',
  'industry supervisor phone':              'industrySupervisorPhone',
  'industry supervisor no':                 'industrySupervisorPhone',
  'industry supervisor mobile':             'industrySupervisorPhone',
  'duration of siwes exercise':    'siwesDuration',
  'duration of siwes':             'siwesDuration',
  'siwes duration':                'siwesDuration',
  'duration':                      'siwesDuration',

  'gender':                        'gender',
  'sex':                           'gender',
};

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

        // Required headers validation
        if (!detectedFields.has('matricNo')) {
          columnErrors.push('Missing required column: Matric. Number');
        }
        if (!detectedFields.has('level')) {
          columnErrors.push('Missing required column: Level');
        }
        if (!detectedFields.has('state')) {
          columnErrors.push('Missing required column: State');
        }
        const hasNameField =
          detectedFields.has('name') ||
          (detectedFields.has('surname') && detectedFields.has('otherNames'));
        if (!hasNameField) {
          columnErrors.push('Missing required column: Name in Full (or Surname and Other Names)');
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

          // Smart name decomposition if full name was provided
          if (row.name && (!row.surname || !row.otherNames)) {
            const trimmedName = row.name.trim();
            if (trimmedName.includes(',')) {
              const [s, ...rest] = trimmedName.split(',');
              if (!row.surname) row.surname = s.trim();
              if (!row.otherNames) row.otherNames = rest.join(' ').trim();
            } else {
              const parts = trimmedName.split(/\s+/).filter(Boolean);
              if (parts.length > 0) {
                if (!row.surname) row.surname = parts[0];
                if (!row.otherNames) {
                  row.otherNames = parts.slice(1).join(' ') || parts[0];
                }
              }
            }
          }

          // Fallback if surname is set but not name
          if (!row.name && (row.surname || row.otherNames)) {
            row.name = `${row.surname} ${row.otherNames}`.trim();
          }

          // Sync location from LGA if location not explicitly set
          if (row.lga && !row.location) {
            row.location = row.lga;
          }

          // Validate required row fields
          if (!row.matricNo) {
            row._errors.push(`Row ${row._rowIndex}: Matric number is empty`);
          }
          if (!row.name && !row.surname) {
            row._errors.push(`Row ${row._rowIndex}: Student name is empty`);
          }
          if (!row.level) {
            row._errors.push(`Row ${row._rowIndex}: Level is empty`);
          }
          if (!row.state) {
            row._errors.push(`Row ${row._rowIndex}: State is empty`);
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
