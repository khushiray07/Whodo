'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlans } from '@/hooks/usePlans';
import { templates } from '@/lib/templates';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { strings } from '@/constants/strings';
import type { PlanTemplate } from '@/types/database';

export default function CreatePlanPage() {
  const router = useRouter();
  const { createPlan } = usePlans();
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState<PlanTemplate>('custom');
  const [eventDate, setEventDate] = useState('');
  const [names, setNames] = useState<string[]>([]);
  const [nameInput, setNameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function addName() {
    const trimmed = nameInput.trim();
    if (trimmed && !names.includes(trimmed)) {
      setNames([...names, trimmed]);
      setNameInput('');
    }
  }

  async function handleCreate() {
    if (!title.trim()) return;
    setLoading(true);
    setError('');
    try {
      const plan = await createPlan(title.trim(), template, eventDate || null, names);
      router.push(`/app/plans/${plan.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : strings.genericError);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{strings.createPlanTitle}</h1>
        <p className="text-on-surface-variant mt-1">{strings.createPlanSubtitle}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">{error}</div>
      )}

      <Input
        label={strings.planNameLabel}
        placeholder={strings.planNamePlaceholder}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-2">
          {strings.planDateLabel}
        </label>
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Templates */}
      <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-2">
          {strings.templateLabel}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {templates.map((t) => (
            <button
              key={t.key}
              onClick={() => setTemplate(t.key)}
              className={`p-3 rounded-2xl text-center transition-all border-2 ${
                template === t.key
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent bg-surface-container-low hover:bg-surface-container'
              }`}
            >
              <span className="text-2xl">{t.icon}</span>
              <p className="text-xs font-medium mt-1">{t.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Participants */}
      <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-2">
          {strings.whosComing}
        </label>
        <div className="flex gap-2">
          <Input
            placeholder={strings.addNamePlaceholder}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addName()}
          />
          <Button variant="secondary" onClick={addName} className="shrink-0">
            Add
          </Button>
        </div>
        {names.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {names.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
              >
                {name}
                <button
                  onClick={() => setNames(names.filter((n) => n !== name))}
                  className="hover:text-error ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-on-surface-variant">{strings.noStress}</p>

      <Button onClick={handleCreate} disabled={loading || !title.trim()} className="w-full">
        {loading ? 'Creating...' : strings.doneKar}
      </Button>
    </div>
  );
}
