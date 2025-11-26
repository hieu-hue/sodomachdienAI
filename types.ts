export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface AnalysisResult {
  text: string;
  timestamp: number;
}

export interface ImageFile {
  file: File;
  previewUrl: string;
}
