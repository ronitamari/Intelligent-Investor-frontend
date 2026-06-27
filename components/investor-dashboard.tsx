'use client';

import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import type {
  CalculationResult,
  FinancialProfile,
} from '../lib/types';
import { ProjectionChart } from './projection-chart';

type Theme = 'light' | 'dark';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function numberValue(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function profileResult(profile: FinancialProfile): CalculationResult | null {
  const plan = profile.spendingPlans[0];
  if (!plan) return null;
  return {
    ...plan,
    grossSalary: Number(profile.grossSalary),
    bankNet: Number(profile.bankNet),
    bankNetWasEstimated: false,
  };
}

export function InvestorDashboard() {
  const [theme, setTheme] = useState<Theme>('light');
  const [name, setName] = useState('');
  const [grossSalary, setGrossSalary] = useState('');
  const [bankNet, setBankNet] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [profiles, setProfiles] = useState<FinancialProfile[]>([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('investor-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('investor-theme', theme);
  }, [theme]);

  useEffect(() => {
    api
      .listProfiles()
      .then(setProfiles)
      .catch(() => setError('Saved profiles are temporarily unavailable.'));
  }, []);

  useEffect(() => {
    const gross = numberValue(grossSalary);
    if (gross === undefined || gross === 0) {
      setResult(null);
      return;
    }

    const timeout = window.setTimeout(() => {
      api
        .calculate({
          grossSalary: gross,
          bankNet: numberValue(bankNet),
        })
        .then((nextResult) => {
          setResult(nextResult);
          setError('');
        })
        .catch((requestError: Error) => setError(requestError.message));
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [grossSalary, bankNet]);

  const buckets = useMemo(
    () =>
      result
        ? [
            {
              label: 'Fixed costs',
              value: result.fixedCosts,
              note: `${result.fixedCostsPercentage}% for housing, bills and essentials`,
            },
            {
              label: 'Savings goals',
              value: result.savingsGoals,
              note: '10% for emergencies and near-term goals',
            },
            {
              label: 'Active investments',
              value: result.activeInvestments,
              note: '10% toward a 15+ year investing horizon',
            },
            {
              label: 'Guilt-free spending',
              value: result.guiltFreeSpending,
              note: `${result.guiltFreePercentage}% to spend with confidence`,
            },
          ]
        : [],
    [result],
  );

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    const gross = numberValue(grossSalary);
    if (!name.trim() || gross === undefined || gross === 0) {
      setError('Enter your name and gross monthly salary before saving.');
      return;
    }

    setSaving(true);
    setError('');
    setStatus('');
    try {
      const profile = await api.createProfile({
        name: name.trim(),
        grossSalary: gross,
        bankNet: numberValue(bankNet),
      });
      setProfiles((current) => [
        profile,
        ...current.filter((item) => item.id !== profile.id),
      ]);
      setResult(profileResult(profile));
      setStatus('Financial profile saved.');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to save the profile.',
      );
    } finally {
      setSaving(false);
    }
  }

  function loadProfile(id: string) {
    const profile = profiles.find((item) => item.id === id);
    if (!profile) return;
    setName(profile.name);
    setGrossSalary(String(profile.grossSalary));
    setBankNet(String(profile.bankNet));
    setResult(profileResult(profile));
    setStatus(`Loaded ${profile.name}'s saved profile.`);
    setError('');
  }

  const finalProjection =
    result?.wealthProjection[result.wealthProjection.length - 1]?.value ?? 0;
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">II</span>
          The Intelligent Investor
        </div>
        <div className="topbar-actions">
          <button
            className="theme-toggle"
            type="button"
            aria-label={`Switch to ${nextTheme} mode`}
            onClick={() => setTheme(nextTheme)}
          >
            {theme === 'dark' ? 'Light' : 'Dark'} mode
          </button>
          <select
            className="saved-select"
            aria-label="Load a saved profile"
            defaultValue=""
            onChange={(event) => loadProfile(event.target.value)}
          >
            <option value="" disabled>
              {profiles.length ? 'Load saved profile' : 'No saved profiles'}
            </option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="dashboard">
        <aside className="panel form-panel">
          <p className="eyebrow">Common-sense spending</p>
          <h2>Start with what reaches your bank.</h2>
          <p className="intro">
            Enter monthly figures. Leave bank net empty and we will estimate it
            as 68% of gross salary.
          </p>

          <form className="salary-form" onSubmit={saveProfile}>
            <div className="field">
              <label htmlFor="name">Profile name</label>
              <input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="field">
              <label htmlFor="grossSalary">Gross monthly salary</label>
              <div className="input-wrap">
                <span className="input-prefix">$</span>
                <input
                  id="grossSalary"
                  inputMode="decimal"
                  min="0"
                  type="number"
                  value={grossSalary}
                  onChange={(event) => setGrossSalary(event.target.value)}
                  placeholder="10,000"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="bankNet">Monthly bank net</label>
              <div className="input-wrap">
                <span className="input-prefix">$</span>
                <input
                  id="bankNet"
                  inputMode="decimal"
                  min="0"
                  type="number"
                  value={bankNet}
                  onChange={(event) => setBankNet(event.target.value)}
                  placeholder="Optional"
                />
              </div>
              <small>The amount deposited after taxes and deductions.</small>
            </div>

            <button className="primary-button" disabled={saving} type="submit">
              {saving ? 'Saving...' : 'Save financial profile'}
            </button>
            <p className={`status ${error ? 'error' : ''}`} role="status">
              {error || status}
            </p>
          </form>
        </aside>

        <section className="results">
          <div className="panel hero">
            <p className="eyebrow">Your monthly plan</p>
            <h1>Give every dollar a clear direction.</h1>
            <p>
              The four buckets are based on bank net, so the plan reflects money
              you can actually use instead of a pre-tax headline number.
            </p>
          </div>

          {result ? (
            <>
              <div className="bucket-grid" aria-label="Spending buckets">
                {buckets.map((bucket) => (
                  <article className="panel bucket-card" key={bucket.label}>
                    <div className="bucket-label">{bucket.label}</div>
                    <div className="bucket-value">{currency.format(bucket.value)}</div>
                    <div className="bucket-note">{bucket.note}</div>
                  </article>
                ))}
              </div>

              <section className="panel chart-panel">
                <div className="chart-header">
                  <div>
                    <p className="eyebrow">7% annual return</p>
                    <h2>15-year wealth projection</h2>
                    <p>
                      Growing the {currency.format(result.activeInvestments)} monthly
                      investment bucket.
                    </p>
                  </div>
                  <div className="projection-total">
                    <strong>{currency.format(finalProjection)}</strong>
                    <span>projected year 15 value</span>
                  </div>
                </div>
                <ProjectionChart data={result.wealthProjection} />
              </section>
            </>
          ) : (
            <section className="panel empty-state">
              <div>
                <h2>Your plan will appear here.</h2>
                <p>
                  Add a gross monthly salary to calculate the four spending
                  buckets and chart your investment growth through year 15.
                </p>
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
