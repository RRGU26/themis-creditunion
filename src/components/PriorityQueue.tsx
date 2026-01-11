import { FileText, AlertCircle, RefreshCw } from 'lucide-react';
import type { Document } from '../services/api';
import { DocumentCard } from './DocumentCard';
import { LoadingSpinner } from './LoadingSpinner';

interface PriorityQueueProps {
  documents: Document[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onDocumentClick: (doc: Document) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  total?: number;
}

export function PriorityQueue({
  documents,
  isLoading,
  error,
  onDocumentClick,
  onLoadMore,
  hasMore,
  total,
}: PriorityQueueProps) {
  if (isLoading && !documents) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-red-600">
        <AlertCircle className="w-8 h-8 mb-2" />
        <span>Failed to load documents</span>
        <span className="text-sm text-gray-500 mt-1">{error.message}</span>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <FileText className="w-8 h-8 mb-2" />
        <span>No documents found</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold font-heading text-deep-navy flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal" />
          Priority Queue
        </h2>
        {total !== undefined && (
          <span className="text-sm text-gray-500">{total} documents</span>
        )}
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onClick={() => onDocumentClick(doc)}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          className="w-full mt-4 py-3 text-teal hover:text-bright-blue font-medium text-sm flex items-center justify-center gap-2 bg-white rounded-lg border border-gray-200 hover:border-teal transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Load More
        </button>
      )}
    </div>
  );
}
