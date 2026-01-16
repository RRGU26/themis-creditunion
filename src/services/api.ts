const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://bankregpulse-enterprise-api.onrender.com';
const API_KEY = import.meta.env.VITE_BANKREGPULSE_API_KEY;

export interface Document {
  id: number;
  title: string;
  agency: string;
  agencyCode: string;
  publishedDate: string;
  collectedDate: string;
  developmentType: string;
  domain: string | null;
  priority: 'high' | 'medium' | 'low';
  impactScore: number;
  summary: string;
  detailedSummaries?: {
    executive?: string;
    technical?: string;
    operational?: string;
  };
  keyHighlights?: string[];
  url: string;
}

export interface DocumentsResponse {
  data: Document[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface BriefHistoryItem {
  id: string;
  date: string;
  subject: string;
  summary: string;
  metrics: {
    totalDocuments: number;
    highPriorityCount: number;
    twitterCount: number;
    newsCount: number;
    agencyCount: number;
  };
}

export interface BriefHistoryResponse {
  data: BriefHistoryItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface TwitterSignal {
  id: string;
  authorUsername: string;
  authorName: string;
  text: string;
  createdAt: string;
  accountType: string;
}

export interface NewsItem {
  title: string;
  source: string;
  publishedDate: string;
  url: string;
}

export interface DailyBrief {
  date: string;
  summary: {
    totalDocuments: number;
    highPriorityCount: number;
    tweetCount?: number;
    newsCount?: number;
    byAgency: Record<string, number>;
    byPriority: Record<string, number>;
    byType?: Record<string, number>;
    byDomain?: Record<string, number>;
  };
  sentiment?: {
    score: number;
    trend: string;
    summary: string;
  };
  highlights?: {
    id: number;
    title: string;
    agency: string | null;
    priority: string;
    summary: string;
  }[];
  highPriorityItems: {
    id: number;
    title: string;
    agency: string | null;
    impactScore: number;
  }[];
  actionItemsSummary?: string[];
  upcomingDeadlines?: string[];
  emailContent?: {
    subject: string;
    html: string;
    aiSummary: string;
    generatedAt: string;
  } | null;
  twitterSignals?: TwitterSignal[];
  bankingNews?: NewsItem[];
}

export interface SentimentData {
  score: number;
  trend: string;
  summary: string;
  components: {
    administration: number;
    regulatoryTone: number;
    market: number;
  };
  updatedAt: string;
}

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  getDocuments: (params?: {
    limit?: number;
    offset?: number;
    priority?: string;
    agency?: string;
    since?: string;
  }): Promise<DocumentsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.priority) searchParams.set('priority', params.priority);
    if (params?.agency) searchParams.set('agency', params.agency);
    if (params?.since) searchParams.set('since', params.since);

    const query = searchParams.toString();
    return fetchAPI<DocumentsResponse>(`/v1/cu/documents${query ? `?${query}` : ''}`);
  },

  getDocument: (id: number): Promise<Document> => {
    return fetchAPI<Document>(`/v1/cu/documents/${id}`);
  },

  getDailyBrief: (): Promise<DailyBrief> => {
    return fetchAPI<DailyBrief>('/v1/cu/daily-brief/latest');
  },

  getBriefHistory: (limit: number = 10): Promise<BriefHistoryResponse> => {
    return fetchAPI<BriefHistoryResponse>(`/v1/cu/daily-brief/history?limit=${limit}`);
  },

  getSentiment: (): Promise<SentimentData> => {
    return fetchAPI<SentimentData>('/v1/sentiment/current');
  },
};
