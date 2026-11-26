export type ProjectCategory = 'network' | 'siem' | 'ai';

export interface ProjectItem {
  id: string;
  category: ProjectCategory;
  categoryLabel: string;
  title: string;
  summary: string;
  tags: string[];
  scenario: string;
  steps: string;
  analysis?: string;
  valueDemonstrated?: string[];
  outcomeStatus?: string;
  snippet: string;
}

export type NewsCategorySlug = 'advisories' | 'threat-intel' | 'security-news';

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  category: string;
  category_slug: NewsCategorySlug;
  published: string;
  published_display?: string;
  summary: string;
}

export interface NewsFeedPayload {
  generated_at: string;
  sources_checked: number;
  sources_succeeded: number;
  items: NewsItem[];
}

export interface CCQuestion {
  id: number;
  domain_id: number;
  domain_name: string;
  question: string;
  options: string[];
  correct_index: number;
  why_correct: string;
  why_incorrect?: Record<string, string>;
  exam_tip?: string;
}

export type AppRoute =
  | 'home'
  | 'investigations'
  | 'case-detail'
  | 'news'
  | 'tools'
  | 'cc-simulator'
  | 'ai-sanitizer'
  | 'architecture'
  | 'contact';
