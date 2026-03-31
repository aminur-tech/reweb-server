export interface IChartData {
  name: string;
  [key: string]: string | number;
}

export interface IAIChartResponse {
  data: IChartData[];
  type: 'bar' | 'line';
  dataKey: string;
}

export interface IChatMessage {
  role: 'user' | 'bot' | 'system';
  content: string;
}