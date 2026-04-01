import { User, Session, Student, Assignment, Score, StudentWithStatus, ProgressStats } from '../types';

// ─── Users ────────────────────────────────────────────────────────────────────

export const mockDirector: User = {
  id: 'u-director',
  name: 'Dr. Abdulrahman Bello',
  email: 'director@alhikmah.edu.ng',
  role: 'director',
  createdAt: '2025-01-01T08:00:00Z',
};

export const mockCorpers: User[] = [
  {
    id: 'u-corper-1',
    name: 'Maryam Lawal',
    email: 'corper@alhikmah.edu.ng',
    role: 'corper',
    createdAt: '2025-01-05T08:00:00Z',
  },
  {
    id: 'u-corper-2',
    name: 'Ibrahim Ndagi',
    email: 'secretary@alhikmah.edu.ng',
    role: 'corper',
    createdAt: '2025-01-05T09:00:00Z',
  },
];

export const mockSupervisors: User[] = [
  {
    id: 'u-sup-1',
    name: 'Dr. Afolabi Gbadamosi',
    email: 'afolabi.gbadamosi@alhikmah.edu.ng',
    role: 'supervisor',
    createdAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'u-sup-2',
    name: 'Dr. Musa Sanni',
    email: 'musa.sanni@alhikmah.edu.ng',
    role: 'supervisor',
    createdAt: '2025-01-10T09:00:00Z',
  },
  {
    id: 'u-sup-3',
    name: 'Dr. Hajia Adesola Salawu',
    email: 'adesola.salawu@alhikmah.edu.ng',
    role: 'supervisor',
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 'u-sup-4',
    name: 'Dr. Ibrahim Yusuf',
    email: 'ibrahim.yusuf@alhikmah.edu.ng',
    role: 'supervisor',
    createdAt: '2025-01-10T11:00:00Z',
  },
];

export const mockAllUsers: User[] = [
  mockDirector,
  ...mockCorpers,
  ...mockSupervisors,
];

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const mockSessions: Session[] = [
  {
    id: 'sess-2025',
    year: 2025,
    isActive: true,
    createdAt: '2025-01-15T08:00:00Z',
    studentCount: 30,
    scoredCount: 18,
  },
  {
    id: 'sess-2024',
    year: 2024,
    isActive: false,
    createdAt: '2024-01-20T08:00:00Z',
    studentCount: 287,
    scoredCount: 287,
  },
  {
    id: 'sess-2023',
    year: 2023,
    isActive: false,
    createdAt: '2023-01-18T08:00:00Z',
    studentCount: 241,
    scoredCount: 241,
  },
];

export const mockActiveSession = mockSessions[0];

// ─── Students ─────────────────────────────────────────────────────────────────

export const mockStudents: Student[] = [
  // Agriculture
  { id: 'st-01', sessionId: 'sess-2025', matricNo: '25/07/9SA001', surname: 'BUSAYO', otherNames: 'MOHAT', name: 'BUSAYO MOHAT', faculty: 'Natural & Applied Sciences', department: 'Agriculture', course: 'Agriculture', level: '200', state: 'Oyo', lga: 'Ore Aro', industry: 'Oyo State Ministry of Agriculture', location: 'Ibadan', email: 'busayo.mohat@gmail.com', phone: '09155851720', gender: 'Female', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'st-02', sessionId: 'sess-2025', matricNo: '25/07/9SA002', surname: 'SALAHUEEN', otherNames: 'KEJIMAH', name: 'SALAHUEEN KEJIMAH', faculty: 'Natural & Applied Sciences', department: 'Agriculture', course: 'Agriculture', level: '200', state: 'Kwara', lga: 'Ifedum', industry: 'Kwara State Ministry of Agriculture', location: 'Ilorin', email: 'salahueen.k@gmail.com', phone: '09131196713', gender: 'Female', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'st-03', sessionId: 'sess-2025', matricNo: '25/07/9SA003', surname: 'MAFRAT', otherNames: 'ADIFEU BLESSING', name: 'MAFRAT ADIFEU BLESSING', faculty: 'Natural & Applied Sciences', department: 'Agriculture', course: 'Agriculture', level: '200', state: 'Kwara', lga: 'Asa', industry: 'Ilorin Agricultural Development Programme', location: 'Ilorin', email: 'mafrat.adifeu@gmail.com', phone: '07012041902', gender: 'Female', createdAt: '2025-01-20T08:00:00Z' },

  // Computer Science
  { id: 'st-04', sessionId: 'sess-2025', matricNo: '25/07/9CS001', surname: 'IBRAHIM', otherNames: 'MUSA ABDULRASHEED', name: 'IBRAHIM MUSA ABDULRASHEED', faculty: 'ICT', department: 'Computer Science', course: 'Computer Science', level: '300', state: 'Kwara', lga: 'Ilorin East', industry: 'Kwara State Broadcasting Service', location: 'Ilorin', email: 'ibrahim.musa@gmail.com', phone: '08160345678', gender: 'Male', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'st-05', sessionId: 'sess-2025', matricNo: '25/07/9CS002', surname: 'YUSUF', otherNames: 'AISHA FOLAKE', name: 'YUSUF AISHA FOLAKE', faculty: 'ICT', department: 'Computer Science', course: 'Computer Science', level: '300', state: 'Lagos', lga: 'Eti-Osa', industry: 'Access Bank Plc, Lagos', location: 'Lagos', email: 'aisha.yusuf@gmail.com', phone: '09089123456', gender: 'Female', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'st-06', sessionId: 'sess-2025', matricNo: '25/07/9CS003', surname: 'BELLO', otherNames: 'FATIMA ZAHRA', name: 'BELLO FATIMA ZAHRA', faculty: 'ICT', department: 'Computer Science', course: 'Computer Science', level: '300', state: 'Kwara', lga: 'Ilorin West', industry: 'KWABES Computer Centre', location: 'Ilorin', email: 'fatima.bello@gmail.com', phone: '07056789012', gender: 'Female', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'st-07', sessionId: 'sess-2025', matricNo: '25/07/9CS004', surname: 'ADISA', otherNames: 'QUADRI BABATUNDE', name: 'ADISA QUADRI BABATUNDE', faculty: 'ICT', department: 'Computer Science', course: 'Computer Science', level: '400', state: 'Lagos', lga: 'Ikeja', industry: 'MTN Nigeria, Lagos', location: 'Lagos', email: 'quadri.adisa@gmail.com', phone: '08034567890', gender: 'Male', createdAt: '2025-01-20T08:00:00Z' },

  // Economics
  { id: 'st-08', sessionId: 'sess-2025', matricNo: '25/07/9EC001', surname: 'ADEYEMI', otherNames: 'SUBOMI GRACE', name: 'ADEYEMI SUBOMI GRACE', faculty: 'Management & Social Sciences', department: 'Economics', course: 'Economics', level: '300', state: 'Oyo', lga: 'Akinyele', industry: 'Unity Bank Plc, Ilorin', location: 'Ilorin', email: 'subomi.adeyemi@gmail.com', phone: '09064321987', gender: 'Female', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'st-09', sessionId: 'sess-2025', matricNo: '25/07/9EC002', surname: 'LAWAL', otherNames: 'ZAINAB', name: 'LAWAL ZAINAB', faculty: 'Management & Social Sciences', department: 'Economics', course: 'Economics', level: '300', state: 'Kwara', lga: 'Ilorin South', industry: 'Central Bank of Nigeria, Ilorin Branch', location: 'Ilorin', email: 'zainab.lawal@gmail.com', phone: '08078654321', gender: 'Female', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'st-10', sessionId: 'sess-2025', matricNo: '25/07/9EC003', surname: 'OLAWALE', otherNames: 'EMMANUEL ADEDAYO', name: 'OLAWALE EMMANUEL ADEDAYO', faculty: 'Management & Social Sciences', department: 'Economics', course: 'Economics', level: '400', state: 'Osun', lga: 'Osogbo', industry: 'National Institute for Policy and Strategic Studies', location: 'Kuru', email: 'emmanuel.olawale@gmail.com', phone: '09023456789', gender: 'Male', createdAt: '2025-01-20T08:00:00Z' },

  // Accounting
  { id: 'st-11', sessionId: 'sess-2025', matricNo: '25/07/9AC001', surname: 'SANNI', otherNames: 'KHADIJAH', name: 'SANNI KHADIJAH', department: 'Accounting', course: 'Accounting', level: '400', state: 'Kwara', lga: 'Ilorin East', industry: 'KPMG Nigeria, Ilorin', location: 'Ilorin', email: 'khadijah.sanni@gmail.com', phone: '07056123456', gender: 'Female', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'st-12', sessionId: 'sess-2025', matricNo: '25/07/9AC002', surname: 'ABDULRAZAQ', otherNames: 'MARYAM', name: 'ABDULRAZAQ MARYAM', department: 'Accounting', course: 'Accounting', level: '400', state: 'Kwara', lga: 'Ilorin West', industry: 'Kwara State Internal Revenue Service', location: 'Ilorin', email: 'maryam.abdulrazaq@gmail.com', phone: '08091234567', gender: 'Female', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'st-13', sessionId: 'sess-2025', matricNo: '25/07/9AC003', surname: 'HASSAN', otherNames: 'ABUBAKAR', name: 'HASSAN ABUBAKAR', department: 'Accounting', course: 'Accounting', level: '400', state: 'Kogi', lga: 'Lokoja', industry: 'Kogi State Accountant General Office', location: 'Lokoja', email: 'abubakar.hassan@gmail.com', phone: '09045678901', gender: 'Male', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'st-14', sessionId: 'sess-2025', matricNo: '25/07/9AC004', surname: 'BALOGUN', otherNames: 'TOYIN ABOSEDE', name: 'BALOGUN TOYIN ABOSEDE', department: 'Accounting', course: 'Accounting', level: '400', state: 'Oyo', lga: 'Ibadan North', industry: 'PwC Nigeria, Ibadan', location: 'Ibadan', email: 'toyin.balogun@gmail.com', phone: '08167890123', gender: 'Female', createdAt: '2025-01-20T08:00:00Z' },

  // Banking & Finance
  { id: 'st-15', sessionId: 'sess-2025', matricNo: '25/07/9BF001', surname: 'USMAN', otherNames: 'HALIMAH', name: 'USMAN HALIMAH', department: 'Banking & Finance', course: 'Banking & Finance', level: '300', state: 'Kwara', lga: 'Ilorin East', industry: 'First Bank of Nigeria, Ilorin Branch', location: 'Ilorin', email: 'halimah.usman@gmail.com', phone: '09012345678', gender: 'Female', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'st-16', sessionId: 'sess-2025', matricNo: '25/07/9BF002', surname: 'SOLADOYE', otherNames: 'RICHARD OLUMIDE', name: 'SOLADOYE RICHARD OLUMIDE', department: 'Banking & Finance', course: 'Banking & Finance', level: '300', state: 'Oyo', lga: 'Ibadan South-West', industry: 'Stanbic IBTC Bank, Ibadan', location: 'Ibadan', email: 'richard.soladoye@gmail.com', phone: '08023456789', gender: 'Male', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'st-17', sessionId: 'sess-2025', matricNo: '25/07/9BF003', surname: 'IBRAHIM', otherNames: 'NUSAIBA ABUBAKAR', name: 'IBRAHIM NUSAIBA ABUBAKAR', department: 'Banking & Finance', course: 'Banking & Finance', level: '300', state: 'Kwara', lga: 'Ilorin West', industry: 'Central Bank of Nigeria, Ilorin', location: 'Ilorin', email: 'nusaiba.ibrahim@gmail.com', phone: '07034567890', gender: 'Female', createdAt: '2025-01-20T08:00:00Z' },

  // Biology
  { id: 'st-18', sessionId: 'sess-2025', matricNo: '25/07/9BI001', surname: 'GARBA', otherNames: 'YAHAYA', name: 'GARBA YAHAYA', department: 'Biology', course: 'Biology', level: '200', state: 'Niger', lga: 'Minna', industry: 'NAFDAC, Ilorin District Office', location: 'Ilorin', email: 'yahaya.garba@gmail.com', phone: '09056789012', gender: 'Male', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'st-19', sessionId: 'sess-2025', matricNo: '25/07/9BI002', surname: 'OLAWUYI', otherNames: 'TEMIDAYO', name: 'OLAWUYI TEMIDAYO', department: 'Biology', course: 'Biology', level: '200', state: 'Osun', lga: 'Ife North', industry: 'UITH Research Laboratory', location: 'Ilorin', email: 'temidayo.olawuyi@gmail.com', phone: '08089012345', gender: 'Female', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'st-20', sessionId: 'sess-2025', matricNo: '25/07/9BI003', surname: 'AFOLABI', otherNames: 'OLUSEGUN PETER', name: 'AFOLABI OLUSEGUN PETER', department: 'Biology', course: 'Biology', level: '200', state: 'Kwara', lga: 'Offa', industry: 'Kwara State Ministry of Health', location: 'Ilorin', email: 'olusegun.afolabi@gmail.com', phone: '09078901234', gender: 'Male', createdAt: '2025-01-20T08:00:00Z' },

  // Chemistry
  { id: 'st-21', sessionId: 'sess-2025', matricNo: '25/07/9CH001', surname: 'RAFIU', otherNames: 'AMINAT ADUNOLA', name: 'RAFIU AMINAT ADUNOLA', department: 'Chemistry', course: 'Chemistry', level: '300', state: 'Kwara', lga: 'Ilorin West', industry: 'NIP Petrochemicals, Ilorin', location: 'Ilorin', email: 'aminat.rafiu@gmail.com', phone: '08056789012', gender: 'Female', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'st-22', sessionId: 'sess-2025', matricNo: '25/07/9CH002', surname: 'ABDULKADIR', otherNames: 'MUSA', name: 'ABDULKADIR MUSA', department: 'Chemistry', course: 'Chemistry', level: '300', state: 'Kwara', lga: 'Kwara North', industry: 'Dangote Cement, Ilorin', location: 'Ilorin', email: 'musa.abdulkadir@gmail.com', phone: '07067890123', gender: 'Male', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'st-23', sessionId: 'sess-2025', matricNo: '25/07/9CH003', surname: 'OLANREWAJU', otherNames: 'SEUN ABIMBOLA', name: 'OLANREWAJU SEUN ABIMBOLA', department: 'Chemistry', course: 'Chemistry', level: '300', state: 'Lagos', lga: 'Ajeromi-Ifelodun', industry: 'Nigerian Navy Shore Installation, Lagos', location: 'Lagos', email: 'seun.olanrewaju@gmail.com', phone: '09012678901', gender: 'Male', createdAt: '2025-01-20T08:00:00Z' },

  // Physics Education
  { id: 'st-24', sessionId: 'sess-2025', matricNo: '25/07/9PE001', surname: 'KAREEM', otherNames: 'SULAYMON', name: 'KAREEM SULAYMON', faculty: 'Education', department: 'Physics Education', course: 'Physics Education', level: '200', state: 'Kwara', lga: 'Ilorin South', industry: 'SUBEB Kwara State', location: 'Ilorin', email: 'sulaymon.kareem@gmail.com', phone: '08045678901', gender: 'Male', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'st-25', sessionId: 'sess-2025', matricNo: '25/07/9PE002', surname: 'JIMOH', otherNames: 'HADIZAT OLUWAKEMI', name: 'JIMOH HADIZAT OLUWAKEMI', faculty: 'Education', department: 'Physics Education', course: 'Physics Education', level: '200', state: 'Kwara', lga: 'Asa', industry: 'NUT Kwara State Chapter', location: 'Ilorin', email: 'hadizat.jimoh@gmail.com', phone: '09034567890', gender: 'Female', createdAt: '2025-01-20T08:00:00Z' },

  // Unassigned (no industry filled yet)
  { id: 'st-26', sessionId: 'sess-2025', matricNo: '25/07/9SA004', surname: 'AHMED', otherNames: 'SAFIYANU', name: 'AHMED SAFIYANU', department: 'Agriculture', course: 'Agriculture', level: '200', state: 'Kwara', lga: 'Edu', industry: '', location: '', email: 'safiyanu.ahmed@gmail.com', phone: '08056781234', gender: 'Male', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'st-27', sessionId: 'sess-2025', matricNo: '25/07/9EC004', surname: 'OYEDELE', otherNames: 'BAMIDELE JAMES', name: 'OYEDELE BAMIDELE JAMES', department: 'Economics', course: 'Economics', level: '300', state: 'Oyo', lga: 'Ogbomoso North', industry: '', location: '', email: 'bamidele.oyedele@gmail.com', phone: '07089012345', gender: 'Male', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'st-28', sessionId: 'sess-2025', matricNo: '25/07/9BF004', surname: 'OLOYEDE', otherNames: 'BUKUNMI FAITH', name: 'OLOYEDE BUKUNMI FAITH', department: 'Banking & Finance', course: 'Banking & Finance', level: '300', state: 'Kwara', lga: 'Ilorin West', industry: '', location: '', email: 'bukunmi.oloyede@gmail.com', phone: '09023456780', gender: 'Female', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'st-29', sessionId: 'sess-2025', matricNo: '25/07/9BI004', surname: 'AMOO', otherNames: 'TOBI', name: 'AMOO TOBI', department: 'Biology', course: 'Biology', level: '200', state: 'Lagos', lga: 'Surulere', industry: '', location: '', gender: 'Male', createdAt: '2025-01-20T08:00:00Z' },
  { id: 'st-30', sessionId: 'sess-2025', matricNo: '25/07/9CH004', surname: 'LUKMAN', otherNames: 'FATIMOH', name: 'LUKMAN FATIMOH', department: 'Chemistry', course: 'Chemistry', level: '300', state: 'Kwara', lga: 'Kwara Central', industry: '', location: '', email: 'fatimoh.lukman@gmail.com', phone: '08034560123', gender: 'Female', createdAt: '2025-01-20T08:00:00Z' },
];

// ─── Assignments ──────────────────────────────────────────────────────────────

// st-01 to st-10 → Dr. Afolabi
// st-11 to st-18 → Dr. Musa Sanni
// st-19 to st-23 → Dr. Hajia Adesola
// st-24 to st-25 → Dr. Ibrahim Yusuf
// st-26 to st-30 → unassigned

export const mockAssignments: Assignment[] = [
  ...['st-01','st-02','st-03','st-04','st-05','st-06','st-07','st-08','st-09','st-10'].map((sid, i) => ({
    id: `asgn-afolabi-${i+1}`,
    studentId: sid,
    supervisorId: 'u-sup-1',
    assignedAt: '2025-01-22T08:00:00Z',
    student: mockStudents.find(s => s.id === sid),
    supervisor: mockSupervisors[0],
  })),
  ...['st-11','st-12','st-13','st-14','st-15','st-16','st-17','st-18'].map((sid, i) => ({
    id: `asgn-sanni-${i+1}`,
    studentId: sid,
    supervisorId: 'u-sup-2',
    assignedAt: '2025-01-22T08:30:00Z',
    student: mockStudents.find(s => s.id === sid),
    supervisor: mockSupervisors[1],
  })),
  ...['st-19','st-20','st-21','st-22','st-23'].map((sid, i) => ({
    id: `asgn-adesola-${i+1}`,
    studentId: sid,
    supervisorId: 'u-sup-3',
    assignedAt: '2025-01-22T09:00:00Z',
    student: mockStudents.find(s => s.id === sid),
    supervisor: mockSupervisors[2],
  })),
  ...['st-24','st-25'].map((sid, i) => ({
    id: `asgn-yusuf-${i+1}`,
    studentId: sid,
    supervisorId: 'u-sup-4',
    assignedAt: '2025-01-22T09:30:00Z',
    student: mockStudents.find(s => s.id === sid),
    supervisor: mockSupervisors[3],
  })),
];

// ─── Scores ───────────────────────────────────────────────────────────────────

// Fully scored students: st-01..st-07 (7 for Dr. Afolabi), st-11..st-15 (5 for Dr. Sanni),
// st-19..st-20 (2 for Dr. Adesola), st-24 (1 for Dr. Yusuf)
// Partially scored: st-08, st-09, st-16 (supervisorScore only)
// Draft: st-10, st-17

const makeScore = (
  studentId: string,
  orientation: number | null,
  supervisorScore: number | null,
  industryScore: number | null,
  isDraft = false,
  enteredById = 'u-sup-1',
): Score => {
  const total =
    orientation != null && supervisorScore != null && industryScore != null
      ? orientation + supervisorScore + industryScore
      : undefined;
  return {
    id: `score-${studentId}`,
    studentId,
    orientation,
    supervisorScore,
    industryScore,
    isDraft,
    enteredById,
    submittedAt: '2025-03-01T10:00:00Z',
    updatedAt: '2025-03-01T10:00:00Z',
    total,
    siewesFinal: total !== undefined ? total / 2 : undefined,
  };
};

export const mockScores: Score[] = [
  // Fully scored
  makeScore('st-01', 10, 35, 44, false, 'u-sup-1'),
  makeScore('st-02', 10, 32, 41, false, 'u-sup-1'),
  makeScore('st-03', 10, 28, 38, false, 'u-sup-1'),
  makeScore('st-04', 10, 36, 46, false, 'u-sup-1'),
  makeScore('st-05', 10, 30, 42, false, 'u-sup-1'),
  makeScore('st-06',  0, 34, 40, false, 'u-sup-1'),
  makeScore('st-07', 10, 38, 48, false, 'u-sup-1'),

  makeScore('st-11', 10, 33, 45, false, 'u-sup-2'),
  makeScore('st-12', 10, 29, 39, false, 'u-sup-2'),
  makeScore('st-13', 10, 37, 47, false, 'u-sup-2'),
  makeScore('st-14',  0, 31, 40, false, 'u-sup-2'),
  makeScore('st-15', 10, 27, 36, false, 'u-sup-2'),

  makeScore('st-19', 10, 34, 43, false, 'u-sup-3'),
  makeScore('st-20', 10, 36, 46, false, 'u-sup-3'),

  makeScore('st-24', 10, 32, 42, false, 'u-sup-4'),

  // Partially scored (supervisorScore entered, no industryScore)
  makeScore('st-08', 10, 25, null, false, 'u-sup-1'),
  makeScore('st-09', 10, 31, null, false, 'u-sup-1'),
  makeScore('st-16',  0, 28, null, false, 'u-sup-2'),

  // Draft
  makeScore('st-10', 10, null, null, true, 'u-sup-1'),
  makeScore('st-17', 10, null, null, true, 'u-sup-2'),
];

// ─── Orientation ──────────────────────────────────────────────────────────────
// Orientation marks are embedded in scores above.
// Students with orientation = 10: st-01..st-09, st-11..st-15, st-17, st-19..st-20, st-24
// Count = 18 attended, st-06 & st-14 = 0 (absent)
export const ORIENTATION_ATTENDED_IDS = new Set([
  'st-01','st-02','st-03','st-04','st-05','st-07','st-08','st-09',
  'st-11','st-12','st-13','st-15','st-17','st-19','st-20','st-24','st-25',
]);

// ─── Derived: StudentWithStatus ───────────────────────────────────────────────

export function buildStudentsWithStatus(): StudentWithStatus[] {
  return mockStudents.map((student) => {
    const assignment = mockAssignments.find((a) => a.studentId === student.id);
    const score = mockScores.find((s) => s.studentId === student.id);

    let status: StudentWithStatus['status'] = 'unassigned';
    if (assignment) {
      if (!score || score.isDraft) {
        status = 'assigned';
      } else if (
        score.supervisorScore !== null &&
        score.industryScore !== null
      ) {
        status = 'completed';
      } else {
        status = 'partially-scored';
      }
    }

    return { ...student, assignment, score, status };
  });
}

// ─── Progress Stats ───────────────────────────────────────────────────────────

export function buildProgressStats(): ProgressStats {
  const students = buildStudentsWithStatus();
  const total = students.length;
  const assigned = students.filter((s) => s.status !== 'unassigned').length;
  const unassigned = total - assigned;
  const fullyScored = students.filter((s) => s.status === 'completed').length;
  const orientationMarked = mockScores.filter(
    (s) => s.orientation === 10,
  ).length;
  const pending = assigned - fullyScored;
  const completionPercentage = total === 0 ? 0 : Math.round((fullyScored / total) * 100);

  const perSupervisor = mockSupervisors.map((supervisor) => {
    const sup_students = students.filter(
      (s) => s.assignment?.supervisorId === supervisor.id,
    );
    const scored = sup_students.filter((s) => s.status === 'completed').length;
    return {
      supervisor,
      total: sup_students.length,
      scored,
      pending: sup_students.length - scored,
    };
  });

  return {
    totalStudents: total,
    assigned,
    unassigned,
    orientationMarked,
    fullyScored,
    pending,
    completionPercentage,
    perSupervisor,
  };
}

// ─── Supervisor-specific helpers ──────────────────────────────────────────────

export function getStudentsForSupervisor(supervisorId: string): StudentWithStatus[] {
  return buildStudentsWithStatus().filter(
    (s) => s.assignment?.supervisorId === supervisorId,
  );
}

export function getSupervisorAssignmentCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const sup of mockSupervisors) {
    counts[sup.id] = mockAssignments.filter(
      (a) => a.supervisorId === sup.id,
    ).length;
  }
  return counts;
}

// Simulate async delay
export function delay(ms = 400): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
