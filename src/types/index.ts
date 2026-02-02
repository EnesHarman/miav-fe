// Enums
export type Species = 'CAT' | 'DOG' | 'OTHER';
export type Gender = 'MALE' | 'FEMALE';

// User Profile
export interface UserProfile {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  city?: string;
  isExpert: boolean;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  city?: string;
  avatarUrl?: string;
}

// Pet Images
export interface PetImage {
  id: number;
  url: string;
  isProfile: boolean;
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
  petId: number;
  weight: number;
  recordDate: string;
  notes?: string;
}

export interface CreateGrowthRecordRequest {
  weight: number;
  recordDate: string;
  notes?: string;
}
