import { X, ExternalLink, FileText, Users, Settings } from 'lucide-react';
import type { Document } from '../services/api';
import { AgencyBadge, PriorityBadge, DateBadge, ImpactBadge, TypeBadge } from './DocumentBadges';

interface DocumentModalProps {
  document: Document | null;
  onClose: () => void;
}

export function DocumentModal({ document, onClose }: DocumentModalProps) {
  if (!document) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-deep-navy text-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <PriorityBadge priority={document.priority} />
                <AgencyBadge agency={document.agencyCode || document.agency} />
                <ImpactBadge score={document.impactScore} />
                {document.developmentType && <TypeBadge type={document.developmentType} />}
              </div>
              <h2 className="text-xl font-semibold font-heading">{document.title}</h2>
              <div className="mt-2">
                <DateBadge date={document.publishedDate} className="text-gray-300" />
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Executive Summary */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-deep-navy font-semibold mb-2">
              <FileText className="w-4 h-4 text-teal" />
              Executive Summary
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {document.detailedSummaries?.executive || document.summary}
            </p>
          </div>

          {/* Technical Summary */}
          {document.detailedSummaries?.technical && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-deep-navy font-semibold mb-2">
                <Settings className="w-4 h-4 text-teal" />
                Technical Analysis
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {document.detailedSummaries.technical}
              </p>
            </div>
          )}

          {/* Operational Summary */}
          {document.detailedSummaries?.operational && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-deep-navy font-semibold mb-2">
                <Users className="w-4 h-4 text-teal" />
                Operational Impact
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {document.detailedSummaries.operational}
              </p>
            </div>
          )}

          {/* Key Highlights */}
          {document.keyHighlights && document.keyHighlights.length > 0 && (
            <div className="mb-6">
              <div className="text-deep-navy font-semibold mb-2">Key Highlights</div>
              <ul className="list-disc list-inside space-y-1">
                {document.keyHighlights.map((highlight, i) => (
                  <li key={i} className="text-gray-700 text-sm">{highlight}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Source Link */}
          {document.url && (
            <a
              href={document.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-teal hover:text-bright-blue transition-colors text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              View Original Document
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
