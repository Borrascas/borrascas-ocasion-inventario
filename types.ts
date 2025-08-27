
import { ReactNode } from 'react';

export enum BikeStatus {
  Available = 'Available',
  Reserved = 'Reserved',
  Sold = 'Sold',
  Unavailable = 'Unavailable',
}

export enum SaleType {
  Cash = 'Cash',
  TradeIn = 'TradeIn',
}

export enum BikeType {
    Mountain = 'Mountain',
    Road = 'Road',
    Ebike = 'Ebike',
    Gravel = 'Gravel',
    City = 'City',
    Kids = 'Kids',
}

export interface Bike {
  id: number;
  refNumber: string;
  serialNumber: string | null;
  brand: string;
  model: string;
  type: BikeType;
  size: string;
  purchasePrice: number;
  additionalCosts: number;
  sellPrice: number;
  finalSellPrice: number | null;
  soldDate: string | null;
  observations: string;
  imageUrl: string | null;
  status: BikeStatus;
  entryDate: string | null;
  tradeInBikeId: number | null;
  tradeInForBikeId: number | null;
  images?: string[];
}

export interface BikeFormData extends Omit<Bike, 'id' | 'finalSellPrice' | 'soldDate' | 'tradeInBikeId' | 'tradeInForBikeId'> {
  images?: string[];
}

export interface SaleData {
  bikeId: number;
  saleType: SaleType;
  finalSellPrice: number;
  tradeInBike?: BikeFormData;
}

export interface MonthlyData {
    name: string;
    sales: number;
    profit: number;
}

export interface AnnualData {
    year: string;
    sales: number;
    profit: number;
}

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error';
    icon?: ReactNode | null;
}

// --- Tipos para Préstamos y Alquileres ---

export enum LoanerBikeStatus {
    Available = 'Available',
    Prestada = 'Prestada',
    Alquilada = 'Alquilada',
}

export enum LoanType {
    Loan = 'Loan', // Préstamo
    Rental = 'Rental' // Alquiler
}

export interface LoanDetails {
    loaneeName?: string;
    loaneePhone?: string;
    loaneeDni?: string;
    loanType: LoanType;
    rentalDuration?: string;
    loanReason?: string;
    startDate: string;
}

export interface LoanerBike {
    id: number;
    refNumber: string;
    serialNumber: string | null;
    brand: string;
    model: string;
    size: string;
    observations: string;
    imageUrl: string | null;
    status: LoanerBikeStatus;
    entryDate: string | null;
    loanDetails: LoanDetails | null;
}

export interface LoanData {
    bikeId: number;
    details: LoanDetails;
}


// --- Supabase Database Types ---

export type Json = any

export interface Database {
  public: {
    Tables: {
      bikes: {
        Row: {
          id: number
          refNumber: string
          serialNumber: string | null
          brand: string
          model: string
          type: BikeType
          size: string
          purchasePrice: number
          additionalCosts: number
          sellPrice: number
          finalSellPrice: number | null
          soldDate: string | null
          observations: string
          imageUrl: string | null
          status: BikeStatus
          entryDate: string | null
          tradeInBikeId: number | null
          tradeInForBikeId: number | null
        }
        Insert: {
          id?: number
          refNumber: string
          serialNumber?: string | null
          brand: string
          model: string
          type: BikeType
          size: string
          purchasePrice: number
          additionalCosts?: number
          sellPrice: number
          finalSellPrice?: number | null
          soldDate?: string | null
          observations?: string
          imageUrl?: string | null
          status: BikeStatus
          entryDate?: string | null
          tradeInBikeId?: number | null
          tradeInForBikeId?: number | null
        }
        Update: {
          id?: number
          refNumber?: string
          serialNumber?: string | null
          brand?: string
          model?: string
          type?: BikeType
          size?: string
          purchasePrice?: number
          additionalCosts?: number
          sellPrice?: number
          finalSellPrice?: number | null
          soldDate?: string | null
          observations?: string
          imageUrl?: string | null
          status?: BikeStatus
          entryDate?: string | null
          tradeInBikeId?: number | null
          tradeInForBikeId?: number | null
        }
      }
      loaner_bikes: {
        Row: {
          id: number
          refNumber: string
          serialNumber: string | null
          brand: string
          model: string
          size: string
          observations: string
          imageUrl: string | null
          status: LoanerBikeStatus
          entryDate: string | null
          loanDetails: Json | null
        }
        Insert: {
          id?: number
          refNumber: string
          serialNumber?: string | null
          brand: string
          model: string
          size: string
          observations?: string
          imageUrl?: string | null
          status: LoanerBikeStatus
          entryDate?: string | null
          loanDetails?: Json | null
        }
        Update: {
          id?: number
          refNumber?: string
          serialNumber?: string | null
          brand?: string
          model?: string
          size?: string
          observations?: string
          imageUrl?: string | null
          status?: LoanerBikeStatus
          entryDate?: string | null
          loanDetails?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Sistema de roles y permisos
export enum UserRole {
  Admin = 'admin',
  Editor = 'editor',
  Viewer = 'viewer',
  Pending = 'pending' // Usuario registrado pero no aprobado
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
  display_name?: string;
}

export interface UserPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  canExport: boolean;
}
