import React, { useState } from 'react';
import { LogOutIcon, DownloadIcon, UserIcon, MoonIcon, SunIcon, UsersIcon, CheckCircleIcon, XIcon, TrashIcon } from './ui/Icons';
import { supabase } from '../services/supabaseClient';
import { useBikes } from '../services/bikeQueries';
import { useLoanerBikes } from '../services/loanerBikeQueries';
import { UserPermissions, UserProfile, UserRole } from '../types';
import { getAllUsers, updateUserRole, deleteUser } from '../services/userService';
import ConfirmModal from './ui/ConfirmModal';

interface SettingsProps {
    permissions: UserPermissions;
    userProfile: UserProfile | null;
}

const Settings: React.FC<SettingsProps> = ({ permissions, userProfile }) => {
    const [isDarkMode, setIsDarkMode] = useState(true); // Por ahora siempre oscuro
    const [exportingBikes, setExportingBikes] = useState(false);
    const [exportingLoaners, setExportingLoaners] = useState(false);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [showUserManagement, setShowUserManagement] = useState(false);
    const [updatingUser, setUpdatingUser] = useState<string | null>(null);
    const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserProfile | null>(null);
    
    const { data: bikes } = useBikes();
    const { data: loanerBikesData } = useLoanerBikes({ page: 1, pageSize: 1000 }); // Obtenemos todas las bicis para export
    const loanerBikes = loanerBikesData?.bikes || [];

    const Card: React.FC<{title: string; children: React.ReactNode; className?: string}> = ({ title, children, className }) => (
        <div className={`p-[1px] bg-gradient-to-b from-gray-700/80 to-transparent rounded-xl ${className}`}>
            <div className="bg-gray-800/90 h-full w-full rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    {title}
                </h3>
                {children}
            </div>
        </div>
    );

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    const loadUsers = async () => {
        if (!permissions.canManageUsers) return;
        
        setLoadingUsers(true);
        try {
            const allUsers = await getAllUsers();
            setUsers(allUsers);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        if (!permissions.canManageUsers || !userProfile) return;
        
        setUpdatingUser(userId);
        try {
            const success = await updateUserRole(userId, newRole, userProfile.id);
            if (success) {
                await loadUsers(); // Recargar lista
            }
        } catch (error) {
            console.error('Error updating user role:', error);
        } finally {
            setUpdatingUser(null);
        }
    };

    const handleDeleteUser = async (user: UserProfile) => {
        if (!permissions.canManageUsers) return;
        
        try {
            const success = await deleteUser(user.id);
            if (success) {
                await loadUsers(); // Recargar lista
                setDeleteConfirmUser(null);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const toggleUserManagement = async () => {
        if (!showUserManagement && permissions.canManageUsers) {
            await loadUsers();
        }
        setShowUserManagement(!showUserManagement);
    };

    const getRoleColor = (role: UserRole) => {
        switch (role) {
            case UserRole.Admin: return 'bg-red-500/20 text-red-400 ring-red-500/30';
            case UserRole.Editor: return 'bg-green-500/20 text-green-400 ring-green-500/30';
            case UserRole.Viewer: return 'bg-blue-500/20 text-blue-400 ring-blue-500/30';
            case UserRole.Pending: return 'bg-yellow-500/20 text-yellow-400 ring-yellow-500/30';
        }
    };

    const getRoleLabel = (role: UserRole) => {
        switch (role) {
            case UserRole.Admin: return 'Administrador';
            case UserRole.Editor: return 'Editor';
            case UserRole.Viewer: return 'Visualizador';
            case UserRole.Pending: return 'Pendiente';
        }
    };

    const exportToCSV = (data: any[], filename: string, type: 'bikes' | 'loaners') => {
        if (type === 'bikes') {
            setExportingBikes(true);
        } else {
            setExportingLoaners(true);
        }

        try {
            let headers: string[];
            let rows: string[][];

            if (type === 'bikes') {
                headers = ['Ref', 'Marca', 'Modelo', 'Tipo', 'Talla', 'Precio Compra', 'Precio Venta', 'Estado', 'Fecha Entrada'];
                rows = data.map(bike => [
                    bike.refNumber || '',
                    bike.brand || '',
                    bike.model || '',
                    bike.type || '',
                    bike.size || '',
                    bike.purchasePrice ? (bike.purchasePrice / 100).toFixed(2) + '€' : '',
                    bike.sellPrice ? (bike.sellPrice / 100).toFixed(2) + '€' : '',
                    bike.status || '',
                    bike.entryDate ? new Date(bike.entryDate).toLocaleDateString('es-ES') : ''
                ]);
            } else {
                headers = ['Ref', 'Marca', 'Modelo', 'Talla', 'Estado', 'Observaciones'];
                rows = data.map(bike => [
                    bike.refNumber || '',
                    bike.brand || '',
                    bike.model || '',
                    bike.size || '',
                    bike.status || '',
                    bike.observations || ''
                ]);
            }

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Error al exportar los datos');
        } finally {
            if (type === 'bikes') {
                setExportingBikes(false);
            } else {
                setExportingLoaners(false);
            }
        }
    };

    const currentUser = supabase.auth.getUser();

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white">Configuración</h2>

            {/* Sección Usuario */}
            <Card title="Usuario">
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg">
                        <UserIcon className="w-8 h-8 text-blue-400" />
                        <div className="flex-1">
                            <p className="text-white font-medium">{userProfile?.email || 'Usuario'}</p>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${userProfile ? getRoleColor(userProfile.role) : 'bg-gray-500/20 text-gray-400 ring-gray-500/30'}`}>
                                    {userProfile ? getRoleLabel(userProfile.role) : 'Sin rol'}
                                </span>
                                {userProfile?.approved_at && (
                                    <span className="text-xs text-gray-400">
                                        Aprobado: {new Date(userProfile.approved_at).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Gestión de Usuarios - Solo para Admins */}
                    {permissions.canManageUsers && (
                        <div className="border-t border-gray-600/50 pt-4">
                            <button
                                onClick={toggleUserManagement}
                                className="w-full flex items-center justify-center p-3 rounded-lg transition-colors duration-200 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 border border-blue-600/30 mb-4"
                            >
                                <UsersIcon className="w-5 h-5 mr-3" />
                                <span className="font-medium">
                                    {showUserManagement ? 'Ocultar Gestión de Usuarios' : 'Gestionar Usuarios'}
                                </span>
                            </button>

                            {showUserManagement && (
                                <div className="space-y-3 overflow-hidden">
                                    {loadingUsers ? (
                                        <div className="text-center py-4">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                            <p className="text-gray-400 mt-2">Cargando usuarios...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-64 overflow-y-auto overflow-x-hidden">
                                            {users.map(user => (
                                                <div key={user.id} className="p-3 bg-gray-700/30 rounded-lg">
                                                    {/* Vista móvil: columna */}
                                                    <div className="sm:hidden">
                                                        <div className="mb-2">
                                                            <p className="text-white font-medium text-sm break-all" title={user.email}>{user.email}</p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                Registrado: {new Date(user.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <select
                                                                value={user.role}
                                                                onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                                                disabled={updatingUser === user.id || user.id === userProfile?.id}
                                                                className="text-xs bg-gray-600 text-white rounded px-2 py-1 border border-gray-500 flex-1 mr-2"
                                                            >
                                                                <option value={UserRole.Pending}>Pendiente</option>
                                                                <option value={UserRole.Viewer}>Viewer</option>
                                                                <option value={UserRole.Editor}>Editor</option>
                                                                <option value={UserRole.Admin}>Admin</option>
                                                            </select>
                                                            {updatingUser === user.id ? (
                                                                <div className="w-8 h-8 flex items-center justify-center">
                                                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                                </div>
                                                            ) : user.id !== userProfile?.id && (
                                                                <button
                                                                    onClick={() => setDeleteConfirmUser(user)}
                                                                    className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors border border-transparent hover:border-red-500/30"
                                                                    title="Eliminar usuario"
                                                                >
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Vista desktop: fila */}
                                                    <div className="hidden sm:flex items-center justify-between">
                                                        <div className="flex-1 min-w-0 max-w-[60%]">
                                                            <p className="text-white font-medium truncate" title={user.email}>{user.email}</p>
                                                            <p className="text-xs text-gray-400">
                                                                Registrado: {new Date(user.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
                                                            <select
                                                                value={user.role}
                                                                onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                                                disabled={updatingUser === user.id || user.id === userProfile?.id}
                                                                className="text-xs bg-gray-600 text-white rounded px-2 py-1 border border-gray-500 min-w-0 w-20 sm:w-auto"
                                                            >
                                                                <option value={UserRole.Pending}>Pendiente</option>
                                                                <option value={UserRole.Viewer}>Viewer</option>
                                                                <option value={UserRole.Editor}>Editor</option>
                                                                <option value={UserRole.Admin}>Admin</option>
                                                            </select>
                                                            {updatingUser === user.id ? (
                                                                <div className="w-8 h-8 flex items-center justify-center">
                                                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                                </div>
                                                            ) : user.id !== userProfile?.id && (
                                                                <button
                                                                    onClick={() => setDeleteConfirmUser(user)}
                                                                    className="p-1 text-red-500 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors border border-transparent hover:border-red-500/30"
                                                                    title="Eliminar usuario"
                                                                >
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {users.length === 0 && (
                                                <p className="text-center text-gray-400 py-4">No hay usuarios registrados</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center p-3 rounded-lg transition-colors duration-200 bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 border border-red-600/30"
                    >
                        <LogOutIcon className="w-5 h-5 mr-3" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </Card>

            {/* Sección Backup/Exportación */}
            <Card title="Backup y Exportación">
                <div className="space-y-4">
                    <p className="text-gray-400 mb-4">Exporta tus datos para crear copias de seguridad o análisis externos.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-700/30 rounded-lg">
                            <h4 className="text-white font-medium mb-2">Inventario Principal</h4>
                            <p className="text-gray-400 text-sm mb-3">
                                {bikes?.length || 0} bicicletas registradas
                            </p>
                            <button
                                onClick={() => bikes && exportToCSV(bikes, 'inventario_bicis', 'bikes')}
                                disabled={!bikes || exportingBikes}
                                className="w-full flex items-center justify-center p-2 rounded-lg transition-colors duration-200 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                <DownloadIcon className="w-4 h-4 mr-2" />
                                {exportingBikes ? 'Exportando...' : 'Exportar CSV'}
                            </button>
                        </div>

                        <div className="p-4 bg-gray-700/30 rounded-lg">
                            <h4 className="text-white font-medium mb-2">Bicis de Préstamo</h4>
                            <p className="text-gray-400 text-sm mb-3">
                                {loanerBikes?.length || 0} bicicletas registradas
                            </p>
                            <button
                                onClick={() => loanerBikes && exportToCSV(loanerBikes, 'bicis_prestamo', 'loaners')}
                                disabled={!loanerBikes || exportingLoaners}
                                className="w-full flex items-center justify-center p-2 rounded-lg transition-colors duration-200 bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                <DownloadIcon className="w-4 h-4 mr-2" />
                                {exportingLoaners ? 'Exportando...' : 'Exportar CSV'}
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Sección Tema */}
            <Card title="Apariencia">
                <div className="space-y-4">
                    <p className="text-gray-400 mb-4">Personaliza la apariencia de la aplicación.</p>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                            {isDarkMode ? (
                                <MoonIcon className="w-6 h-6 text-blue-400" />
                            ) : (
                                <SunIcon className="w-6 h-6 text-yellow-400" />
                            )}
                            <div>
                                <p className="text-white font-medium">Tema</p>
                                <p className="text-gray-400 text-sm">
                                    {isDarkMode ? 'Modo oscuro activo' : 'Modo claro activo'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                isDarkMode ? 'bg-blue-600' : 'bg-gray-600'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                    
                    <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
                        <p className="text-yellow-300 text-sm">
                            ⚡ Nota: El cambio de tema se implementará en una futura actualización. Por ahora, el modo oscuro está optimizado para tu experiencia.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Información de la aplicación */}
            <Card title="Información">
                <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                        <span className="text-gray-400">Aplicación</span>
                        <span className="text-white font-medium">Borrascas Ocasión Inventario v1.0</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                        <span className="text-gray-400">Total Inventario</span>
                        <span className="text-white font-medium">{bikes?.length || 0} bicis</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-gray-400">Total Préstamos</span>
                        <span className="text-white font-medium">{loanerBikes?.length || 0} bicis</span>
                    </div>
                </div>
            </Card>

            {/* Modal de confirmación para eliminar usuario */}
            {deleteConfirmUser && (
                <ConfirmModal
                    isOpen={deleteConfirmUser !== null}
                    onClose={() => setDeleteConfirmUser(null)}
                    onConfirm={() => handleDeleteUser(deleteConfirmUser)}
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que quieres eliminar el usuario "${deleteConfirmUser?.email}"? Esta acción no se puede deshacer.`}
                    confirmText="Eliminar Usuario"
                    confirmButtonColor="bg-red-600 hover:bg-red-700"
                />
            )}
        </div>
    );
};

export default Settings;