/**
 * public.ts
 *
 * Unauthenticated API helpers — no Authorization header is attached.
 * Use ONLY for publicly accessible endpoints (e.g. student result lookup).
 */

const API_BASE =
  import.meta.env.VITE_API_URL || 'https://siwesdesk-api.onrender.com';

export type StudentPublicInfo = {
  name: string;
  matricNo: string;
  department: string | null;
  faculty: string | null;
  course?: string | null;
  level: string;
  industry?: string | null;
  location?: string | null;
  state?: string;
};

export type ResultData = {
  orientation: number;
  supervisorScore: number;
  industryScore: number;
  total: number;
  siewesFinal: number;
  submittedAt: string;
};

export type ResultLookupResponse =
  | {
      found: true;
      available: true;
      student: StudentPublicInfo;
      result: ResultData;
    }
  | {
      found: true;
      available: false;
      message: string;
      student: Pick<StudentPublicInfo, 'name' | 'matricNo' | 'department' | 'faculty' | 'level'>;
    }
  | { found: false };

export async function lookupStudentResult(
  matricNo: string,
): Promise<ResultLookupResponse> {
  const url = `${API_BASE}/api/students/result?matricNo=${encodeURIComponent(matricNo.trim().toUpperCase())}`;

  const res = await fetch(url);

  if (res.status === 404) {
    return { found: false };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    const message = (body as any)?.message ?? 'Something went wrong. Please try again.';
    throw new Error(message as string);
  }

  // The API wraps all responses in { success: true, data: ... }
  const envelope = await res.json() as { success: boolean; data: ResultLookupResponse };
  return envelope.data;
}
