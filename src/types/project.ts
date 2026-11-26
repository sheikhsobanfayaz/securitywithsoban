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
