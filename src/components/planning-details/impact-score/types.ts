export interface CategoryScore {
  score: number;
  details: string;
}

export interface ImpactScoreDetails {
  [key: string]: CategoryScore | undefined;
}

export interface ImpactScoreData {
  impact_scores: {
    environmental?: CategoryScore;
    social?: CategoryScore;
    infrastructure?: CategoryScore;
    economic?: CategoryScore;
    [key: string]: CategoryScore | undefined;
  };
  key_concerns?: string[];
  recommendations?: string[];
  impacted_services?: {
    [key: string]: {
      impact: 'positive' | 'negative' | 'neutral';
      details: string;
    };
  };
}

export interface ImpactCategory {
  category: string;
  scoreData: CategoryScore;
}