import type { CalculationResult, FinancialProfile } from './types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ??
  'http://localhost:4000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : body?.message;
    throw new Error(message ?? `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export interface SalaryInput {
  name?: string;
  grossSalary: number;
  bankNet?: number;
}

export const api = {
  calculate: (input: SalaryInput) =>
    request<CalculationResult>('/calculations', {
      method: 'POST',
      body: JSON.stringify({
        grossSalary: input.grossSalary,
        bankNet: input.bankNet,
      }),
    }),
  listProfiles: () => request<FinancialProfile[]>('/profiles'),
  createProfile: (input: Required<Pick<SalaryInput, 'name' | 'grossSalary'>> & SalaryInput) =>
    request<FinancialProfile>('/profiles', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};
