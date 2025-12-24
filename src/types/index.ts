// Core Types for Nexus Field Ops

export interface JobStep {
  id: string;
  instruction: string;
  completed: boolean;
  mediaRequired: boolean;
  mediaCaptured?: string; // base64
  notes?: string;
}

export interface Job {
  id: string;
  customer: string;
  address: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  steps: JobStep[];
  aiSummary?: string;
  assignedTech?: string;
  priority?: 'low' | 'medium' | 'high';
  createdAt?: number;
  completedAt?: number;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  type: 'text' | 'image' | 'system';
  timestamp: number;
}

export type UserRole = 'tech' | 'manager';

export type AITaskType = 'diagnostic' | 'map' | 'report';

export interface AIConfig {
  temperature?: number;
  thinkingBudget?: number;
  tools?: any[];
  toolConfig?: any;
}

export interface GeolocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface AppState {
  role: UserRole;
  jobs: Job[];
  activeJobId: string | null;
  messages: Message[];
  isOnline: boolean;
  failCount: number;
  isSidebarOpen: boolean;
}

export interface AIResponse {
  text: string;
  error?: string;
  metadata?: any;
}
