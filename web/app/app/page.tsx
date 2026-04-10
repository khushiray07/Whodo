'use client';

import { usePlans } from '@/hooks/usePlans';
import { strings } from '@/constants/strings';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { format } from '@/lib/date';

export default function PlansListPage() {
  const { plans, loading, deletePlan } = usePlans();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{strings.currentScenes}</h1>
        <Link href="/app/create-plan">
          <Button>+ New Plan</Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-surface-container rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-xl font-semibold text-on-surface">{strings.noPlansTitle}</p>
          <p className="text-on-surface-variant">{strings.noPlansSubtitle}</p>
          <Link href="/app/create-plan">
            <Button className="mt-4">Create Your First Plan</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <Link
              key={plan.id}
              href={`/app/plans/${plan.id}`}
              className="block bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{plan.title}</h3>
                  {plan.event_date && (
                    <p className="text-sm text-on-surface-variant mt-0.5">
                      {format(plan.event_date)}
                    </p>
                  )}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  plan.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : plan.status === 'completed'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {plan.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-on-surface-variant">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {plan.template}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
