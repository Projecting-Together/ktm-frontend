/**
 * Zillow Kathmandu - Shared Types
 * Type definitions for property listings, search, and filtering
 */

export interface Property {
  id: string;
  title: string;
  address: string;
  neighborhood: string;
  price: number;
  pricePerSqft?: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  propertyType: 'apartment' | 'house' | 'land' | 'commercial';
  listingType: 'sale' | 'rent';
  images: string[];
  description: string;
  features: string[];
  yearBuilt?: number;
  parking: number;
  furnished?: boolean;
  petFriendly?: boolean;
  latitude: number;
  longitude: number;
  listedDate: string;
  daysOnMarket: number;
  agentName?: string;
  agentPhone?: string;
  agentEmail?: string;
  isPriceReduced?: boolean;
  isNewListing?: boolean;
  isFeatured?: boolean;
}

export interface SearchFilters {
  listingType: 'sale' | 'rent';
  propertyType: string[];
  minPrice: number;
  maxPrice: number;
  minBedrooms: number;
  maxBedrooms: number;
  minBathrooms: number;
  maxBathrooms: number;
  minSquareFeet: number;
  maxSquareFeet: number;
  neighborhood?: string;
  furnished?: boolean;
  petFriendly?: boolean;
  parking?: number;
  searchQuery?: string;
}

export interface PropertyListingResponse {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Neighborhood {
  id: string;
  name: string;
  description: string;
  averagePrice: number;
  properties: number;
  image: string;
}
