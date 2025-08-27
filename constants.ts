import { BikeStatus, LoanerBikeStatus, BikeType } from './types';
import { DashboardIcon, InventoryIcon, UsersIcon, SettingsIcon } from './components/ui/Icons';

export const STATUS_COLORS: { [key in BikeStatus]: string } = {
  [BikeStatus.Available]: '',
  [BikeStatus.Reserved]: 'bg-amber-500/20',
  [BikeStatus.Sold]: 'bg-red-500/20',
  [BikeStatus.Unavailable]: 'bg-gray-500/10',
};

export const STATUS_BADGE_COLORS: { [key in BikeStatus]: string } = {
    [BikeStatus.Available]: 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30',
    [BikeStatus.Reserved]: 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30',
    [BikeStatus.Sold]: 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30',
    [BikeStatus.Unavailable]: 'bg-gray-500/20 text-gray-400 ring-1 ring-gray-500/30',
};

export const PIE_CHART_COLORS = {
  [BikeStatus.Available]: '#22C55E', // green-500
  [BikeStatus.Reserved]: '#F59E0B', // amber-500
  [BikeStatus.Sold]: '#EF4444', // red-500
  [BikeStatus.Unavailable]: '#6B7280', // gray-500
};

export const BIKE_TYPE_COLORS = {
  [BikeType.Mountain]: '#14b8a6', // Teal
  [BikeType.Road]: '#6366f1',     // Indigo
  [BikeType.Gravel]: '#f97316',    // Orange
  [BikeType.Ebike]: '#facc15',     // Yellow
  [BikeType.City]: '#0ea5e9',     // Sky Blue
  [BikeType.Kids]: '#ec4899',     // Pink
};

export const BIKE_STATUS_TRANSLATIONS: { [key in BikeStatus]: string } = {
  [BikeStatus.Available]: 'Disponible',
  [BikeStatus.Reserved]: 'Reservado',
  [BikeStatus.Sold]: 'Vendido',
  [BikeStatus.Unavailable]: 'No Disponible',
};

export const BIKE_TYPE_TRANSLATIONS: { [key in BikeType]: string } = {
  [BikeType.Mountain]: 'Montaña',
  [BikeType.Road]: 'Carretera',
  [BikeType.Ebike]: 'E-Bike',
  [BikeType.Gravel]: 'Gravel',
  [BikeType.City]: 'Ciudad',
  [BikeType.Kids]: 'Infantil',
};

export const BIKE_TYPE_OPTIONS = Object.values(BikeType).map(type => ({
  value: type,
  label: BIKE_TYPE_TRANSLATIONS[type],
}));


export const NAV_ITEMS = [
    { name: 'Panel', path: '/', icon: DashboardIcon },
    { name: 'Inventario', path: '/inventory', icon: InventoryIcon },
    { name: 'Préstamos', path: '/loaners', icon: UsersIcon },
    { name: 'Ajustes', path: '/settings', icon: SettingsIcon },
];

// --- Constantes para Préstamos ---

export const LOANER_STATUS_COLORS: { [key in LoanerBikeStatus]: string } = {
  [LoanerBikeStatus.Available]: 'border-l-4 border-sky-500 bg-sky-500/5',
  [LoanerBikeStatus.Prestada]: 'border-l-4 border-orange-500 bg-orange-900/30',
  [LoanerBikeStatus.Alquilada]: 'border-l-4 border-purple-500 bg-purple-900/30',
};

export const LOANER_STATUS_BADGE_COLORS: { [key in LoanerBikeStatus]: string } = {
    [LoanerBikeStatus.Available]: 'bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/30',
    [LoanerBikeStatus.Prestada]: 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30',
    [LoanerBikeStatus.Alquilada]: 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30',
};

export const LOANER_BIKE_STATUS_TRANSLATIONS: { [key in LoanerBikeStatus]: string } = {
  [LoanerBikeStatus.Available]: 'Disponible',
  [LoanerBikeStatus.Prestada]: 'Prestada',
  [LoanerBikeStatus.Alquilada]: 'Alquilada',
};