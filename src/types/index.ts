// Enums
export type Species = 'CAT' | 'DOG' | 'OTHER';
export type Gender = 'MALE' | 'FEMALE';
export type Language = 'TR' | 'EN' | 'DE' | 'ES' | 'FR';
export type VaccineType =
  | 'CANINE_PARASITE'
  | 'CANINE_RABIES'
  | 'CANINE_MIXED'
  | 'CANINE_BORDETELLA'
  | 'FELINE_PARASITE'
  | 'FELINE_RABIES'
  | 'FELINE_MIXED'
  | 'FELINE_LEUKEMIA';
export type ReactionSeverity = 'NONE' | 'MILD' | 'SEVERE';

// User Profile
export interface UserProfile {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  phoneNumber?: string;
  city?: string;
  language?: Language;
  isExpert: boolean;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  phoneNumber?: string;
  city?: string;
  language?: Language;
  avatarUrl?: string;
}

// Pet Images
export interface PetImage {
  id: number;
  url: string;
  profile: boolean;
  createdDate: string;
  description?: string;
}

// Pet Model
export interface Pet {
  id: number;
  name: string;
  species: Species;
  breed?: string;
  gender?: Gender;
  birthDate?: string;
  currentWeight?: number;
  bio?: string;
  neutered: boolean;
  chipNumber?: string;
  profilePictureUrl?: string;
  images: PetImage[];
}

export interface CreatePetRequest {
  name: string;
  species: Species;
  breed?: string;
  gender?: Gender;
  birthDate?: string;
  weight?: number;
  bio?: string;
  neutered: boolean;
  chipNumber?: string;
  imageUrls?: string[];
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

// Growth Record
export interface PetGrowthRecord {
  id: number;
  date: string;
  weight: number;
  petImage?: {
    id: number;
    url: string;
    createdDate: string;
    description?: string;
    profile: boolean;
  };
  notes?: string;
  moodScore?: number;
  appetiteScore?: number;
  aiAnalyzed?: boolean;
}

export interface CreateGrowthRecordRequest {
  date: string;
  weight: number;
  photoUrl?: string;
  notes?: string;
  moodScore?: number;
  appetiteScore?: number;
}

// Consultation
export interface CreateConsultationRequest {
  userMessage: string;
  imageUrls?: string[];
}

export interface ConsultationResponse {
  id: number;
  userMessage: string;
  aiResponse: string;
  urgencyLevel: string;
  confidenceScore: number;
  imageUrls: string[];
  createdAt: string;
}

export interface ConsultationSummaryResponse {
  id: number;
  userMessage: string;
  aiResponsePreview: string;
  aiResponse?: string;
  urgencyLevel: string;
  confidenceScore: number;
  imageCount: number;
  createdAt: string;
}

// Vaccine
export interface VaccineHistoryItem {
  id: number;
  administeredDate: string;
  vetClinicName?: string;
  reactionSeverity?: ReactionSeverity;
  reactionNotes?: string;
}

export interface VaccineGroupResponse {
  vaccineType: VaccineType;
  nextVaccineDate?: string;
  vaccineHistory: VaccineHistoryItem[];
}

export interface GroupedVaccinesResponse {
  vaccineGroups: VaccineGroupResponse[];
}

export interface VaccineResponse {
  id: number;
  vaccineType: VaccineType;
  administeredDate: string;
  nextDueDate?: string;
  vetClinicName?: string;
  reactionSeverity?: ReactionSeverity;
  reactionNotes?: string;
}

export interface CreateVaccineRequest {
  vaccineType: VaccineType;
  administeredDate: string;
  vetClinicName?: string;
  reactionSeverity?: ReactionSeverity;
  reactionNotes?: string;
}

// API Response
export interface ApiResponse {
  success: boolean;
  message: string;
}
