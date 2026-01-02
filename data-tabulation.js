export interface QuestionResponse {
  questions: DataTabulationQuestion[];
}

export interface DataTabulationQuestion {
  question?: QuestionMeta;
  options?: OptionsMap;
  stats?: QuestionStats;
}

export interface QuestionMeta {
  var: string;
  txt: string;
}

export interface OptionsMap {
  [key: string]: string | undefined;
}

export interface QuestionStats {
  count: CountMap;
  percentage?: PercentageMap;
  total?: number;
}

export interface PercentageMap {
  [key: string]: number | undefined;
}

export interface CountMap {
  [key: string]: number | undefined;
}
