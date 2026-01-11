import { FileText, AlertTriangle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import type { DailyBrief } from '../services/api';

interface DashboardTilesProps {
  brief: DailyBrief | undefined;
  isLoading: boolean;
}

interface TileProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}

function Tile({ title, value, subtitle, icon, color }: TileProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-deep-navy">{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}

export function DashboardTiles({ brief, isLoading }: DashboardTilesProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  const totalDocs = brief?.summary.totalDocuments || 0;
  const highPriority = brief?.summary.highPriorityCount || 0;
  const sentimentScore = brief?.sentiment?.score || 0;
  const sentimentTrend = brief?.sentiment?.trend || 'stable';

  // Calculate "new today" - documents from today
  const today = new Date().toISOString().split('T')[0];
  const newToday = brief?.date === today ? totalDocs : 0;

  const SentimentIcon = sentimentScore >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Tile
        title="Total Documents"
        value={totalDocs}
        subtitle="Past 24 hours"
        icon={<FileText className="w-4 h-4 text-blue-600" />}
        color="bg-blue-50"
      />
      <Tile
        title="High Priority"
        value={highPriority}
        subtitle="Requires attention"
        icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
        color="bg-red-50"
      />
      <Tile
        title="New Today"
        value={newToday}
        subtitle="Since midnight"
        icon={<Clock className="w-4 h-4 text-green-600" />}
        color="bg-green-50"
      />
      <Tile
        title="Sentiment"
        value={sentimentScore >= 0 ? `+${sentimentScore}` : sentimentScore}
        subtitle={sentimentTrend}
        icon={<SentimentIcon className="w-4 h-4 text-purple-600" />}
        color="bg-purple-50"
      />
    </div>
  );
}
