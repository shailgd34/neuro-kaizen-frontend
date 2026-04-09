// types/dashboard.ts

export type Phase = "calibrating" | "active";

export interface DashboardResponse {
  state: {
    phase: Phase;
    week: number;
    totalWeeks: number;
    lastUpdated: string;
  };

  kpi: {
    [x: string]: string;
    
  };

  drift: {
    enabled: boolean;
    status: string;
    score: number | null;
    confidence: number | null;
    summary: string;
    alerts: DriftAlert[];
  };

  domains: Domain[];
  data:any;

  trend: {
    granularity: string;
    series: TrendPoint[];
  };

  insights: Insight[];
}

export interface DriftAlert {
  id: string;
  type: string;
  domainKey: string;
  severity: string;
  message: string;
}

export interface Domain {
  current: any;
  key: string;
  label: string;
  score: number;
  baseline: number | null;
  delta: number | null;
  direction: "higher_better" | "lower_better";
  volatility: {
    value: number | null;
    level: "low" | "moderate" | "high" | "preliminary";
  };
  drift: {
    status: string;
    score: number | null;
  };
}

export interface TrendPoint {
  t: string;
  score: number;
}

export interface Insight {
  type: string;
  message: string;
}


export type DomainDetailsResponse = {
  domainId: string;
  domainName: string;

  snapshot: {
    currentScore: number;
    baselineScore: number;
    delta: number;
    driftStatus: string;
  };

  metrics: {
    rollingAverage: number;
    volatility: number;
    trend: string;
  };

  timeseries: {
    week: number;
    score: number;
    rollingAverage?: number;
    isBaseline?: boolean;
  }[];

  meta: {
    currentWeek: number;
    totalWeeks: number;
    lastUpdated: string;
  };

  insight: {
    summary: string;
    lastUpdated: string;
  };
};