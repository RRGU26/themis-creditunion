import { Calendar, Building2, TrendingUp, FileText, AlertCircle } from 'lucide-react';
import type { DailyBrief } from '../services/api';
import { LoadingSpinner } from './LoadingSpinner';

interface DailyBriefPanelProps {
  brief: DailyBrief | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function DailyBriefPanel({ brief, isLoading, error }: DailyBriefPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 h-full">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 h-full">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load daily brief</span>
        </div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 h-full">
        <div className="text-gray-500 text-center py-8">No brief available</div>
      </div>
    );
  }

  const formattedDate = new Date(brief.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Sort agencies by count
  const agencyEntries = Object.entries(brief.summary.byAgency || {})
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold font-heading text-deep-navy flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal" />
          Daily Intelligence Brief
        </h2>
        <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
          <Calendar className="w-4 h-4" />
          {formattedDate}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-soft-grey rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-deep-navy">{brief.summary.totalDocuments}</div>
            <div className="text-xs text-gray-500">Documents</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{brief.summary.highPriorityCount}</div>
            <div className="text-xs text-gray-500">High Priority</div>
          </div>
        </div>
      </div>

      {/* By Agency */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-deep-navy mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-teal" />
          By Agency
        </h3>
        <div className="space-y-2">
          {agencyEntries.slice(0, 8).map(([agency, count]) => (
            <div key={agency} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{agency}</span>
              <span className="font-medium text-deep-navy bg-gray-100 px-2 py-0.5 rounded">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sentiment */}
      {brief.sentiment && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-deep-navy mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal" />
            Regulatory Sentiment
          </h3>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-2xl font-bold ${brief.sentiment.score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {brief.sentiment.score >= 0 ? '+' : ''}{brief.sentiment.score}
            </span>
            <span className="text-sm text-gray-500 capitalize">{brief.sentiment.trend}</span>
          </div>
          {brief.sentiment.summary && (
            <p className="text-xs text-gray-600 leading-relaxed">
              {brief.sentiment.summary.substring(0, 200)}...
            </p>
          )}
        </div>
      )}

      {/* High Priority Items */}
      {brief.highPriorityItems && brief.highPriorityItems.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-deep-navy mb-3">High Priority Items</h3>
          <ul className="space-y-2">
            {brief.highPriorityItems.slice(0, 5).map((item) => (
              <li key={item.id} className="text-xs text-gray-700 flex items-start gap-2">
                <span className="text-red-500 mt-0.5">!</span>
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
