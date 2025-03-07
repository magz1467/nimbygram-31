export interface ImpactScoreData {
  Environmental?: {
    [key: string]: number;
  };
  Social?: {
    [key: string]: number;
  };
  impacted_services?: {
    [key: string]: {
      impact: 'positive' | 'negative' | 'neutral';
      details: string;
    };
  };
  key_concerns?: string[];
  recommendations?: string[];
}

export interface CategoryScore {
  score: number;
  details: string;
}

export interface ImpactCategory {
  category: string;
  scoreData: CategoryScore;
}