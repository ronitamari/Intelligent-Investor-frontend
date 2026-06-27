import '../vitest.setup';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InvestorDashboard } from './investor-dashboard';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <svg>{children}</svg>
  ),
  Area: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

describe('InvestorDashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('updates bucket amounts after entering salary values', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            grossSalary: 10000,
            bankNet: 8000,
            bankNetWasEstimated: false,
            fixedCostsPercentage: 55,
            guiltFreePercentage: 27.5,
            fixedCosts: 4400,
            savingsGoals: 800,
            activeInvestments: 800,
            guiltFreeSpending: 2200,
            wealthProjection: Array.from({ length: 15 }, (_, index) => ({
              year: index + 1,
              value: 10000 + index * 1000,
            })),
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );

    render(<InvestorDashboard />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Gross monthly salary'), '10000');
    await user.type(screen.getByLabelText('Monthly bank net'), '8000');

    await waitFor(() => {
      expect(screen.getByText('$4,400')).toBeInTheDocument();
      expect(screen.getAllByText('$800')).toHaveLength(2);
      expect(screen.getByText('$2,200')).toBeInTheDocument();
      expect(screen.getByTestId('projection-chart')).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/calculations',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('toggles and persists dark mode', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    render(<InvestorDashboard />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }));

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem('investor-theme')).toBe('dark');
    expect(
      screen.getByRole('button', { name: 'Switch to light mode' }),
    ).toBeInTheDocument();
  });
});
