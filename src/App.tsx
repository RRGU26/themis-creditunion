import { useState, useMemo } from 'react';
import { RefreshCw, FileText, Calendar, Building2, TrendingUp, AlertTriangle, ChevronRight, X, ExternalLink, Clock, Loader2, Filter, ArrowUpDown, ChevronDown, ChevronUp, MessageSquare, Newspaper, Gavel, FileEdit, BookOpen, Mic, Mail, Bell, Scale } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useDocuments } from './hooks/useDocuments';
import { useDailyBrief } from './hooks/useDailyBrief';
import { useBriefHistory } from './hooks/useBriefHistory';
import { useSentiment } from './hooks/useSentiment';
import type { Document, DailyBrief, BriefHistoryItem, SentimentData } from './services/api';

// Colors
const COLORS = {
  deepNavy: '#07172B',
  navy: '#003366',
  teal: '#11A5BD',
  brightBlue: '#0099CC',
  softGrey: '#F6F9FC',
};

// Badge colors - matching BankRegPulse style (light backgrounds, dark text)
const BADGE_STYLES = {
  agency: { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' },      // Blue
  docType: { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },     // Purple
  domain: { bg: '#F0FDFA', text: '#0F766E', border: '#99F6E4' },      // Teal
  date: { bg: '#F9FAFB', text: '#374151', border: '#E5E7EB' },        // Gray
};

// Document type specific styles with colors and icons
const DOC_TYPE_STYLES: Record<string, { bg: string; text: string; border: string; Icon: any }> = {
  'Enforcement Action': { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA', Icon: Scale },
  'Final Rule': { bg: '#EDE9FE', text: '#7C3AED', border: '#DDD6FE', Icon: Gavel },
  'Proposed Rule': { bg: '#DBEAFE', text: '#2563EB', border: '#BFDBFE', Icon: FileEdit },
  'Guidance': { bg: '#CCFBF1', text: '#0D9488', border: '#99F6E4', Icon: BookOpen },
  'Letter to Credit Unions': { bg: '#E0E7FF', text: '#4F46E5', border: '#C7D2FE', Icon: Mail },
  'Board Action': { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD', Icon: Building2 },
  'Speech/Testimony': { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A', Icon: Mic },
  'Speech': { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A', Icon: Mic },
  'Press Release': { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB', Icon: Newspaper },
  'Notice': { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB', Icon: Bell },
};

// Helper to get document type style
const getDocTypeStyle = (docType: string) => {
  return DOC_TYPE_STYLES[docType] || { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE', Icon: FileText };
};

type SortOption = 'date';

function App() {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [agencyFilter, setAgencyFilter] = useState<string>('all');
  const [docTypeFilter, setDocTypeFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all'); // all, today, week, month
  const [sortBy] = useState<SortOption>('date'); // Default to most recent
  const [offset, setOffset] = useState(0);
  const limit = 50;
  const queryClient = useQueryClient();

  const { data: docsData, isLoading: docsLoading, error: docsError, isFetching } = useDocuments({
    limit,
    offset,
    agency: agencyFilter !== 'all' ? agencyFilter : undefined,
  });
  const { data: briefData, isLoading: briefLoading } = useDailyBrief();
  const { data: historyData } = useBriefHistory(7); // Last 7 briefs
  const { data: sentimentData } = useSentiment();

  // Extract unique values for filters from current data
  const filterOptions = useMemo(() => {
    if (!docsData?.data) return { agencies: [], docTypes: [], domains: [] };
    const agencies = [...new Set(docsData.data.map(d => d.agencyCode || d.agency).filter(Boolean))].sort();
    const docTypes = [...new Set(docsData.data.map(d => d.developmentType).filter(Boolean))].sort();
    const domains = [...new Set(docsData.data.map(d => d.domain).filter(Boolean))].sort() as string[];
    return { agencies, docTypes, domains };
  }, [docsData]);

  // Client-side filtering and sorting (always by date, most recent first)
  const filteredDocs = useMemo(() => {
    if (!docsData?.data) return [];
    let docs = [...docsData.data];

    // Apply client-side filters
    if (docTypeFilter !== 'all') {
      docs = docs.filter(d => d.developmentType === docTypeFilter);
    }
    if (domainFilter !== 'all') {
      docs = docs.filter(d => d.domain === domainFilter);
    }
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      if (dateFilter === 'today') {
        filterDate.setHours(0, 0, 0, 0);
      } else if (dateFilter === 'week') {
        filterDate.setDate(now.getDate() - 7);
      } else if (dateFilter === 'month') {
        filterDate.setMonth(now.getMonth() - 1);
      }
      docs = docs.filter(d => new Date(d.publishedDate) >= filterDate);
    }

    // Always sort by date (most recent first)
    docs.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());

    return docs;
  }, [docsData, docTypeFilter, domainFilter, dateFilter]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['documents'] });
    queryClient.invalidateQueries({ queryKey: ['daily-brief'] });
  };

  const handleLoadMore = () => {
    setOffset(prev => prev + limit);
  };

  const handlePrevPage = () => {
    setOffset(prev => Math.max(0, prev - limit));
  };

  const totalDocs = docsData?.pagination.total || 0;
  const hasMore = docsData?.pagination.hasMore || false;
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalDocs / limit);

  return (
    <div style={{ minHeight: '100vh', width: '100%', margin: 0, padding: 0, backgroundColor: COLORS.softGrey, overflow: 'hidden', position: 'absolute', left: 0, right: 0, top: 0 }}>
      {/* Header */}
      <header style={{ backgroundColor: COLORS.deepNavy, color: 'white', padding: '12px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>
              Themis <span style={{ color: COLORS.teal }}>Credit Union Intelligence</span>
            </h1>
            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '2px 0 0 0' }}>NCUA Regulatory Monitoring</p>
          </div>
          <button
            onClick={handleRefresh}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', backgroundColor: COLORS.teal, color: 'white',
              border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500
            }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </header>

      {/* Main Content - Full Width Two Column Layout (35% / 65%) */}
      <main style={{
        width: '100%',
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: '35fr 65fr',
        gap: '16px',
        height: 'calc(100vh - 70px)',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>

        {/* LEFT COLUMN - Daily Brief with Tiles, Email, Sentiment */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          border: '1px solid #E5E7EB',
          padding: '16px',
          height: '100%',
          overflowY: 'auto'
        }}>
          <DailyBriefPanel brief={briefData} isLoading={briefLoading} history={historyData?.data} sentimentData={sentimentData} />
        </div>

        {/* RIGHT COLUMN - Regulatory Developments Queue */}
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
          {/* New in Last 24 Hours Tile */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            border: '1px solid #E5E7EB',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                New in Last 24 Hours
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color: COLORS.deepNavy }}>{briefData?.summary.totalDocuments || 0}</span>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>regulatory developments</span>
              </div>
            </div>
            {(briefData?.summary.highPriorityCount || 0) > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', backgroundColor: '#FEF2F2', borderRadius: '6px'
              }}>
                <AlertTriangle size={16} style={{ color: '#DC2626' }} />
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#DC2626' }}>{briefData?.summary.highPriorityCount}</div>
                  <div style={{ fontSize: '10px', color: '#DC2626', fontWeight: 500 }}>High Priority</div>
                </div>
              </div>
            )}
          </div>

          {/* Documents Queue */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            border: '1px solid #E5E7EB',
            padding: '16px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <PriorityQueue
              documents={filteredDocs}
              isLoading={docsLoading}
              isFetching={isFetching}
              error={docsError}
              onDocumentClick={setSelectedDoc}
              total={totalDocs}
              filteredCount={filteredDocs.length}
              filters={{ agency: agencyFilter, docType: docTypeFilter, domain: domainFilter, date: dateFilter }}
              filterOptions={filterOptions}
              onFilterChange={{
                agency: (v) => { setAgencyFilter(v); setOffset(0); },
                docType: setDocTypeFilter,
                domain: setDomainFilter,
                date: setDateFilter,
              }}
              pagination={{ currentPage, totalPages, hasMore, onNext: handleLoadMore, onPrev: handlePrevPage, offset }}
            />
          </div>
        </div>
      </main>

      {/* Modal */}
      {selectedDoc && (
        <DocumentModal document={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
    </div>
  );
}

// Daily Brief Panel Component - Shows full email content
function DailyBriefPanel({ brief, isLoading, history, sentimentData }: { brief: DailyBrief | undefined; isLoading: boolean; history?: BriefHistoryItem[]; sentimentData?: SentimentData }) {
  const [showFullSentiment, setShowFullSentiment] = useState(false);
  const [selectedHistoryBrief, setSelectedHistoryBrief] = useState<BriefHistoryItem | null>(null);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: COLORS.teal }} />
      </div>
    );
  }

  if (!brief) {
    return <div style={{ color: '#6B7280', textAlign: 'center', padding: '32px' }}>No brief available</div>;
  }

  const formattedDate = new Date(brief.date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  const agencyEntries = Object.entries(brief.summary.byAgency || {}).sort((a, b) => b[1] - a[1]);
  const typeEntries = Object.entries(brief.summary.byType || {}).sort((a, b) => b[1] - a[1]);
  const domainEntries = Object.entries(brief.summary.byDomain || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: COLORS.deepNavy, display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
          <FileText size={18} style={{ color: COLORS.teal }} />
          Daily Intelligence Brief
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '12px', marginTop: '4px' }}>
          <Calendar size={14} />
          {formattedDate}
        </div>
      </div>

      {/* Four Stat Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '14px' }}>
        <StatBox
          label="Total Docs"
          value={brief.summary.totalDocuments}
          color={COLORS.teal}
          icon={<FileText size={14} />}
        />
        <StatBox
          label="High Priority"
          value={brief.summary.highPriorityCount}
          color="#DC2626"
          icon={<AlertTriangle size={14} />}
        />
        <StatBox
          label="Twitter"
          value={brief.summary.tweetCount || 0}
          color="#1DA1F2"
          icon={<TrendingUp size={14} />}
        />
        <StatBox
          label="News"
          value={brief.summary.newsCount || 0}
          color="#F59E0B"
          icon={<Newspaper size={14} />}
        />
      </div>

      {/* Full Email Content - Strip duplicate sections */}
      {brief.emailContent && (() => {
        let cleanHtml = brief.emailContent.html;

        // Remove "Daily Regulatory Intelligence Brief [Date]" header
        cleanHtml = cleanHtml.replace(/<h[1-3][^>]*>.*?Daily\s+Regulatory\s+Intelligence\s+Brief.*?<\/h[1-3]>/gis, '');
        cleanHtml = cleanHtml.replace(/<[^>]*>\s*Daily\s+Regulatory\s+Intelligence\s+Brief[^<]*<\/[^>]*>/gi, '');

        // Remove the date line after the header (e.g., "Sat Jan 10 2026")
        cleanHtml = cleanHtml.replace(/<p[^>]*>\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\w+\s+\d+\s+\d{4}\s*<\/p>/gi, '');

        // Remove "24-Hour Activity Summary" section with metrics
        cleanHtml = cleanHtml.replace(/📈\s*24-Hour Activity Summary[\s\S]*?(?=🎯|<h[1-6]|$)/gi, '');
        cleanHtml = cleanHtml.replace(/<[^>]*>.*?24-Hour Activity Summary.*?<\/[^>]*>[\s\S]*?(?=🎯|AI Executive Summary|<h[1-6]|$)/gi, '');

        // Remove FSI Banking Environment Favorability section (we show sentiment separately)
        cleanHtml = cleanHtml.replace(/🎯?\s*FSI Banking Environment Favorability[\s\S]*?(?=📋|<h[1-6]|Key Regulatory|$)/gi, '');
        cleanHtml = cleanHtml.replace(/<[^>]*>.*?FSI.*?Favorability.*?<\/[^>]*>[\s\S]*?(?=📋|Key Regulatory|<h[1-6]|$)/gi, '');

        // Remove "🎯 AI Executive Summary" header
        cleanHtml = cleanHtml.replace(/🎯\s*AI Executive Summary/gi, '');
        cleanHtml = cleanHtml.replace(/<[^>]*>.*?AI Executive Summary.*?<\/[^>]*>/gi, '');

        // Remove dashboard metrics section (New Documents, High Priority, Social Signals, News Articles)
        cleanHtml = cleanHtml.replace(/\d+\s*New Documents.*?View Full Dashboard\s*→?/gis, '');
        cleanHtml = cleanHtml.replace(/<[^>]*>\s*\d+\s*<\/[^>]*>\s*<[^>]*>\s*New Documents[\s\S]*?View Full Dashboard[\s\S]*?<\/[^>]*>/gi, '');
        cleanHtml = cleanHtml.replace(/New Documents \(24hrs\)[\s\S]*?News Articles/gi, '');
        cleanHtml = cleanHtml.replace(/View Full Dashboard\s*→?/gi, '');

        // Remove any colored bar/header elements (purple, blue, etc)
        cleanHtml = cleanHtml.replace(/<div[^>]*style="[^"]*background[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
        cleanHtml = cleanHtml.replace(/<table[^>]*style="[^"]*background[^"]*"[^>]*>[\s\S]*?<\/table>/gi, '');
        cleanHtml = cleanHtml.replace(/<tr[^>]*style="[^"]*background[^"]*"[^>]*>[\s\S]*?<\/tr>/gi, '');
        cleanHtml = cleanHtml.replace(/<td[^>]*style="[^"]*background[^"]*#[^"]*"[^>]*>[\s\S]*?<\/td>/gi, '');

        // Remove "Daily Activity Overview" header if duplicated
        cleanHtml = cleanHtml.replace(/<[^>]*>.*?Daily\s+Activity\s+Overview.*?<\/[^>]*>/gi, '');

        // Clean up extra whitespace and empty elements
        cleanHtml = cleanHtml.replace(/<p[^>]*>\s*<\/p>/gi, '');
        cleanHtml = cleanHtml.replace(/<div[^>]*>\s*<\/div>/gi, '');
        cleanHtml = cleanHtml.replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>');
        cleanHtml = cleanHtml.replace(/^\s+/, ''); // Trim leading whitespace

        return (
          <div style={{ marginBottom: '14px' }}>
            <style>{`
              .email-content * {
                background-color: transparent !important;
                background: transparent !important;
              }
              .email-content table, .email-content tr, .email-content td, .email-content div {
                background-color: transparent !important;
                background: transparent !important;
              }
            `}</style>
            <div
              className="email-content"
              style={{
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                padding: '12px',
                backgroundColor: '#FAFAFA',
                maxHeight: '400px',
                overflowY: 'auto',
                fontSize: '13px',
                lineHeight: 1.6,
                fontFamily: 'Inter, system-ui, sans-serif',
                color: '#374151'
              }}
              dangerouslySetInnerHTML={{ __html: cleanHtml }}
            />
          </div>
        );
      })()}

      {/* Sentiment Section */}
          {brief.sentiment && (() => {
            // Build sub-factors from sentiment API data
            const getColor = (val: number) => val >= 50 ? '#16A34A' : val >= 30 ? '#F59E0B' : '#DC2626';
            const subFactors: { name: string; value: number; weight: string; color: string }[] = [];

            if (sentimentData?.components) {
              const { administration, regulatoryTone, market } = sentimentData.components;
              if (administration !== undefined) {
                subFactors.push({ name: 'Administration', value: administration, weight: '35%', color: getColor(administration) });
              }
              if (regulatoryTone !== undefined) {
                subFactors.push({ name: 'Regulatory Tone', value: regulatoryTone, weight: '40%', color: getColor(regulatoryTone) });
              }
              if (market !== undefined) {
                subFactors.push({ name: 'Market', value: market, weight: '25%', color: getColor(market) });
              }
            }

            return (
            <div style={{ backgroundColor: COLORS.softGrey, borderRadius: '6px', padding: '12px', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: COLORS.deepNavy, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <TrendingUp size={14} style={{ color: COLORS.teal }} />
                Regulatory Sentiment
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '24px', fontWeight: 700,
                  color: brief.sentiment.trend === 'declining' ? '#DC2626' : brief.sentiment.trend === 'improving' ? '#16A34A' : '#16A34A'
                }}>
                  {brief.sentiment.score}
                </span>
                <span style={{
                  padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 500,
                  backgroundColor: brief.sentiment.trend === 'improving' ? '#D1FAE5' : brief.sentiment.trend === 'declining' ? '#FEE2E2' : '#F3F4F6',
                  color: brief.sentiment.trend === 'improving' ? '#059669' : brief.sentiment.trend === 'declining' ? '#DC2626' : '#6B7280',
                  textTransform: 'capitalize'
                }}>
                  {brief.sentiment.trend}
                </span>
              </div>

              {/* Sub-factors */}
              {subFactors.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  {subFactors.map((factor) => (
                    <div key={factor.name} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '6px 10px', backgroundColor: 'white', borderRadius: '4px',
                      border: '1px solid #E5E7EB'
                    }}>
                      <span style={{ fontSize: '11px', color: '#6B7280' }}>{factor.name}</span>
                      <span style={{ fontSize: '10px', color: '#9CA3AF' }}>({factor.weight})</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: factor.color }}>{factor.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {brief.sentiment.summary && (
                <div>
                  <p style={{ fontSize: '12px', color: '#374151', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {showFullSentiment ? brief.sentiment.summary : brief.sentiment.summary.substring(0, 300) + '...'}
                  </p>
                  <button
                    onClick={() => setShowFullSentiment(!showFullSentiment)}
                    style={{
                      marginTop: '8px', padding: '4px 8px', fontSize: '11px', fontWeight: 500,
                      backgroundColor: 'transparent', border: '1px solid #E5E7EB', borderRadius: '4px',
                      cursor: 'pointer', color: COLORS.teal, display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    {showFullSentiment ? <><ChevronUp size={12} /> Show Less</> : <><ChevronDown size={12} /> Read Full Analysis</>}
                  </button>
                </div>
              )}
            </div>
            );
          })()}

          {/* By Agency */}
          {agencyEntries.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: COLORS.deepNavy, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Building2 size={14} style={{ color: COLORS.teal }} />
                By Agency
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {agencyEntries.slice(0, 10).map(([agency, count]) => (
                  <span key={agency} style={{
                    padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 500,
                    backgroundColor: BADGE_STYLES.agency.bg, color: BADGE_STYLES.agency.text
                  }}>
                    {agency}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* By Document Type */}
          {typeEntries.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: COLORS.deepNavy, marginBottom: '10px' }}>By Type</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {typeEntries.map(([type, count]) => (
                  <span key={type} style={{
                    padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 500,
                    backgroundColor: BADGE_STYLES.docType.bg, color: BADGE_STYLES.docType.text
                  }}>
                    {type}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* By Domain */}
          {domainEntries.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: COLORS.deepNavy, marginBottom: '10px' }}>By Domain</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {domainEntries.map(([domain, count]) => (
                  <span key={domain} style={{
                    padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 500,
                    backgroundColor: BADGE_STYLES.domain.bg, color: BADGE_STYLES.domain.text
                  }}>
                    {domain}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Highlights with Full Summaries */}
          {brief.highlights && brief.highlights.length > 0 && (
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: COLORS.deepNavy, marginBottom: '10px' }}>Today's Highlights</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {brief.highlights.map((item: any) => (
                  <div key={item.id} style={{
                    padding: '12px', backgroundColor: COLORS.softGrey, borderRadius: '8px',
                    borderLeft: `3px solid ${item.priority === 'high' ? '#DC2626' : item.priority === 'medium' ? '#F59E0B' : '#10B981'}`
                  }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '2px 6px', borderRadius: '3px', fontSize: '10px', fontWeight: 600,
                        backgroundColor: item.priority === 'high' ? '#DC2626' : item.priority === 'medium' ? '#F59E0B' : '#10B981',
                        color: '#FFFFFF', textTransform: 'uppercase'
                      }}>
                        {item.priority}
                      </span>
                      {item.agency && (
                        <span style={{
                          padding: '2px 6px', borderRadius: '3px', fontSize: '10px', fontWeight: 500,
                          backgroundColor: BADGE_STYLES.agency.bg, color: BADGE_STYLES.agency.text
                        }}>
                          {item.agency}
                        </span>
                      )}
                    </div>
                    <h4 style={{ fontSize: '13px', fontWeight: 500, color: COLORS.deepNavy, margin: '0 0 6px 0' }}>{item.title}</h4>
                    <p style={{ fontSize: '11px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                      {item.summary?.substring(0, 200)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Previous Briefs */}
          {history && history.length > 0 && (
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: COLORS.deepNavy, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Clock size={14} style={{ color: COLORS.teal }} />
                Previous Briefs
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history.slice(1).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedHistoryBrief(selectedHistoryBrief?.id === item.id ? null : item)}
                    style={{
                      padding: '10px 12px', backgroundColor: COLORS.softGrey, borderRadius: '6px',
                      cursor: 'pointer', transition: 'all 0.2s',
                      border: selectedHistoryBrief?.id === item.id ? `1px solid ${COLORS.teal}` : '1px solid transparent'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: COLORS.deepNavy }}>
                          {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                          {item.metrics.totalDocuments} docs, {item.metrics.highPriorityCount} high priority
                        </div>
                      </div>
                      <ChevronRight size={16} style={{ color: '#9CA3AF', transform: selectedHistoryBrief?.id === item.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                    {selectedHistoryBrief?.id === item.id && (
                      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #E5E7EB' }}>
                        <p style={{ fontSize: '11px', color: '#374151', lineHeight: 1.5, margin: 0 }}>
                          {item.summary?.substring(0, 300)}...
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
    </div>
  );
}

// Stat Box Component
function StatBox({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: COLORS.softGrey, borderRadius: '6px', padding: '10px',
      borderLeft: `3px solid ${color}`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{label}</span>
      </div>
      <div style={{ fontSize: '20px', fontWeight: 700, color: COLORS.deepNavy }}>{value}</div>
    </div>
  );
}

// Select dropdown style
const selectStyle: React.CSSProperties = {
  padding: '5px 8px',
  borderRadius: '4px',
  border: '1px solid #D1D5DB',
  fontSize: '11px',
  backgroundColor: 'white',
  color: COLORS.deepNavy,
  cursor: 'pointer',
  minWidth: '90px'
};

// Priority Queue Component
function PriorityQueue({ documents, isLoading, isFetching, error, onDocumentClick, total, filteredCount, filters, filterOptions, onFilterChange, pagination }: {
  documents: Document[] | undefined;
  isLoading: boolean;
  isFetching?: boolean;
  error: Error | null;
  onDocumentClick: (doc: Document) => void;
  total?: number;
  filteredCount?: number;
  filters?: { agency: string; docType: string; domain: string; date: string };
  filterOptions?: { agencies: string[]; docTypes: string[]; domains: string[] };
  onFilterChange?: {
    agency: (v: string) => void;
    docType: (v: string) => void;
    domain: (v: string) => void;
    date: (v: string) => void;
  };
  pagination?: { currentPage: number; totalPages: number; hasMore: boolean; onNext: () => void; onPrev: () => void; offset: number };
}) {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: COLORS.teal }} />
      </div>
    );
  }

  if (error) {
    return <div style={{ color: '#DC2626', textAlign: 'center', padding: '32px' }}>Failed to load documents</div>;
  }

  const hasActiveFilters = filters && (filters.agency !== 'all' || filters.docType !== 'all' || filters.domain !== 'all' || filters.date !== 'all');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0 }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: COLORS.deepNavy, display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
          <FileText size={16} style={{ color: COLORS.teal }} />
          Regulatory Developments
          {isFetching && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', color: COLORS.teal }} />}
        </h2>
        <span style={{ fontSize: '12px', color: '#6B7280' }}>
          {total?.toLocaleString()} total
        </span>
      </div>

      {/* Filter Bar */}
      {filters && filterOptions && onFilterChange && (
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '12px', padding: '10px',
          backgroundColor: COLORS.softGrey, borderRadius: '6px', flexWrap: 'wrap', alignItems: 'center',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={12} style={{ color: '#6B7280' }} />
            <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>Filter:</span>
          </div>

          {/* Agency Filter */}
          <select value={filters.agency} onChange={(e) => onFilterChange.agency(e.target.value)} style={selectStyle}>
            <option value="all">All Agencies</option>
            {filterOptions.agencies.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          {/* Document Type Filter */}
          <select value={filters.docType} onChange={(e) => onFilterChange.docType(e.target.value)} style={selectStyle}>
            <option value="all">All Types</option>
            {filterOptions.docTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Domain Filter */}
          <select value={filters.domain} onChange={(e) => onFilterChange.domain(e.target.value)} style={selectStyle}>
            <option value="all">All Domains</option>
            {filterOptions.domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Date Filter */}
          <select value={filters.date} onChange={(e) => onFilterChange.date(e.target.value)} style={selectStyle}>
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={() => {
                onFilterChange.agency('all');
                onFilterChange.docType('all');
                onFilterChange.domain('all');
                onFilterChange.date('all');
              }}
              style={{
                padding: '4px 10px', borderRadius: '4px', border: 'none',
                backgroundColor: '#DC2626', color: 'white', fontSize: '11px',
                fontWeight: 500, cursor: 'pointer', marginLeft: 'auto'
              }}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Count Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexShrink: 0 }}>
        <span style={{ fontSize: '11px', color: '#6B7280' }}>
          Showing {filteredCount || 0} of {total?.toLocaleString()} documents
        </span>
        {hasActiveFilters && (
          <span style={{ fontSize: '10px', color: COLORS.teal, fontWeight: 500 }}>
            Filters applied
          </span>
        )}
      </div>

      {/* Document List - Scrollable */}
      {(!documents || documents.length === 0) ? (
        <div style={{ color: '#6B7280', textAlign: 'center', padding: '24px', fontSize: '13px', flex: 1 }}>
          {hasActiveFilters ? 'No documents match your filters' : 'No documents found'}
        </div>
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '8px',
          flex: 1, overflowY: 'auto', minHeight: 0,
          paddingRight: '8px'  /* Space for scrollbar */
        }}>
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onDocumentClick(doc)}
              style={{
                backgroundColor: '#FAFAFA', borderRadius: '6px', border: '1px solid #E5E7EB',
                padding: '10px 12px', cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.teal; e.currentTarget.style.backgroundColor = 'white'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.backgroundColor = '#FAFAFA'; }}
            >
              <div style={{ flex: 1 }}>
                {/* Badges - Compact */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Agency Badge */}
                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 500,
                    backgroundColor: BADGE_STYLES.agency.bg, color: BADGE_STYLES.agency.text,
                    border: `1px solid ${BADGE_STYLES.agency.border}`
                  }}>
                    {doc.agencyCode || doc.agency}
                  </span>
                  {/* Date Badge */}
                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 500,
                    backgroundColor: BADGE_STYLES.date.bg, color: BADGE_STYLES.date.text,
                    border: `1px solid ${BADGE_STYLES.date.border}`
                  }}>
                    {new Date(doc.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {/* Document Type Badge - Type-specific colors */}
                  {doc.developmentType && (() => {
                    const typeStyle = getDocTypeStyle(doc.developmentType);
                    const TypeIcon = typeStyle.Icon;
                    return (
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
                        backgroundColor: typeStyle.bg, color: typeStyle.text,
                        border: `1px solid ${typeStyle.border}`,
                        display: 'inline-flex', alignItems: 'center', gap: '4px'
                      }}>
                        <TypeIcon size={10} />
                        {doc.developmentType}
                      </span>
                    );
                  })()}
                  {/* Domain Badge - Always prominent when present */}
                  {doc.domain && (
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
                      backgroundColor: BADGE_STYLES.domain.bg, color: BADGE_STYLES.domain.text,
                      border: `1px solid ${BADGE_STYLES.domain.border}`
                    }}>
                      {doc.domain}
                    </span>
                  )}
                </div>
                {/* Title */}
                <h3 style={{ fontSize: '13px', fontWeight: 500, color: COLORS.deepNavy, margin: '0 0 4px 0', lineHeight: 1.35 }}>
                  {doc.title}
                </h3>
                {/* Summary */}
                <p style={{ fontSize: '11px', color: '#6B7280', margin: 0, lineHeight: 1.4 }}>
                  {doc.summary?.substring(0, 120)}...
                </p>
              </div>
              <ChevronRight size={16} style={{ color: '#9CA3AF', flexShrink: 0, marginLeft: '8px' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Document Modal Component
function DocumentModal({ document, onClose }: { document: Document; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white', borderRadius: '12px', maxWidth: '800px', width: '100%',
          maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}
      >
        {/* Header */}
        <div style={{ backgroundColor: COLORS.deepNavy, color: 'white', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              {/* Badges */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 500,
                  backgroundColor: BADGE_STYLES.agency.bg, color: BADGE_STYLES.agency.text
                }}>
                  {document.agencyCode || document.agency}
                </span>
                <span style={{
                  padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 500,
                  backgroundColor: BADGE_STYLES.date.bg, color: BADGE_STYLES.date.text
                }}>
                  {new Date(document.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                {document.developmentType && (() => {
                  const typeStyle = getDocTypeStyle(document.developmentType);
                  const TypeIcon = typeStyle.Icon;
                  return (
                    <span style={{
                      padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
                      backgroundColor: typeStyle.bg, color: typeStyle.text,
                      display: 'inline-flex', alignItems: 'center', gap: '4px'
                    }}>
                      <TypeIcon size={10} />
                      {document.developmentType}
                    </span>
                  );
                })()}
                {document.domain && (
                  <span style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                    backgroundColor: BADGE_STYLES.domain.bg, color: BADGE_STYLES.domain.text
                  }}>
                    {document.domain}
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, lineHeight: 1.4 }}>{document.title}</h2>
              <div style={{ marginTop: '12px', fontSize: '13px', color: '#9CA3AF' }}>
                {new Date(document.publishedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Executive Summary */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: COLORS.deepNavy, marginBottom: '8px' }}>Executive Summary</h3>
            <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, margin: 0 }}>
              {document.detailedSummaries?.executive || document.summary}
            </p>
          </div>

          {/* Technical Summary */}
          {document.detailedSummaries?.technical && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: COLORS.deepNavy, marginBottom: '8px' }}>Technical Analysis</h3>
              <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, margin: 0 }}>{document.detailedSummaries.technical}</p>
            </div>
          )}

          {/* Operational Summary */}
          {document.detailedSummaries?.operational && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: COLORS.deepNavy, marginBottom: '8px' }}>Operational Impact</h3>
              <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, margin: 0 }}>{document.detailedSummaries.operational}</p>
            </div>
          )}

          {/* Key Highlights */}
          {document.keyHighlights && document.keyHighlights.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: COLORS.deepNavy, marginBottom: '8px' }}>Key Highlights</h3>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {document.keyHighlights.map((h, i) => (
                  <li key={i} style={{ fontSize: '14px', color: '#374151', marginBottom: '4px' }}>{h}</li>
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
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: COLORS.teal, fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}
            >
              <ExternalLink size={16} />
              View Original Document
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
