import type { Document } from '../services/api';
import { AgencyBadge, PriorityBadge, DateBadge, ImpactBadge } from './DocumentBadges';
import { ChevronRight } from 'lucide-react';

interface DocumentCardProps {
  document: Document;
  onClick: () => void;
}

export function DocumentCard({ document, onClick }: DocumentCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-teal transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <PriorityBadge priority={document.priority} />
            <AgencyBadge agency={document.agencyCode || document.agency} />
            <ImpactBadge score={document.impactScore} />
          </div>

          <h3 className="font-medium text-deep-navy text-sm mb-1 line-clamp-2">
            {document.title}
          </h3>

          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
            {document.summary}
          </p>

          <div className="flex items-center gap-2">
            <DateBadge date={document.publishedDate} />
            {document.developmentType && (
              <span className="text-xs text-gray-400">{document.developmentType}</span>
            )}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
      </div>
    </div>
  );
}
