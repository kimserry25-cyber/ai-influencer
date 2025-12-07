export interface Persona {
  nickname: string;
  age: string;          // e.g., "20대 중반"
  occupation: string;   // e.g., "패션 모델"
  personality: string;  // e.g., "밝고 긍정적임"
  lifestyle: string;    // e.g., "도심 속 힐링을 즐김"
  vibe: string;
  description: string;
  hashtags: string[];
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

export interface StoryBatch {
  id: string;
  timestamp: number;
  scenario: string; // "Auto-generated" or user input
  images: GeneratedImage[];
}

export interface CameraSettings {
  rotation: number; // -90 to 90
  zoom: number;     // 0 to 10
  vertical: number; // -1 to 1
  isWideAngle: boolean;
}

export interface CreatorAttributes {
  gender: 'Man' | 'Woman' | 'Non-binary';
  age: number;
  height: number;
  weight: number;
  build: string;
  ethnicity: string;
  eyeColor: string;
  hairStyle: string;
  hairColor: string;
  fashionStyle: string;
  vibe: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING', // Analyzing persona
  PLANNING = 'PLANNING',   // Creating storyboard
  GENERATING = 'GENERATING', // Generating images
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}