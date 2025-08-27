import React from 'react';
import { supabase } from './supabaseClient';
import { UserRole, UserProfile, UserPermissions } from '../types';

// Obtener el perfil del usuario actual
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }

    return data;
};

// Crear perfil de usuario después del registro
export const createUserProfile = async (userId: string, email: string): Promise<UserProfile | null> => {
    // Verificar si es el primer usuario (será admin automáticamente)
    const { count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

    const isFirstUser = count === 0;
    const role = isFirstUser ? UserRole.Admin : UserRole.Pending;
    const approvedAt = isFirstUser ? new Date().toISOString() : null;

    const { data, error } = await supabase
        .from('user_profiles')
        .insert({
            id: userId,
            email,
            role,
            approved_at: approvedAt,
            approved_by: isFirstUser ? userId : null
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating user profile:', error);
        return null;
    }

    return data;
};

// Obtener permisos basados en el rol
export const getPermissionsForRole = (role: UserRole): UserPermissions => {
    switch (role) {
        case UserRole.Admin:
            return {
                canView: true,
                canCreate: true,
                canEdit: true,
                canDelete: true,
                canManageUsers: true,
                canExport: true
            };
        case UserRole.Editor:
            return {
                canView: true,
                canCreate: true,
                canEdit: true,
                canDelete: true,
                canManageUsers: false,
                canExport: true
            };
        case UserRole.Viewer:
            return {
                canView: true,
                canCreate: false,
                canEdit: false,
                canDelete: false,
                canManageUsers: false,
                canExport: false
            };
        case UserRole.Pending:
        default:
            return {
                canView: false,
                canCreate: false,
                canEdit: false,
                canDelete: false,
                canManageUsers: false,
                canExport: false
            };
    }
};

// Obtener todos los usuarios (solo para admins)
export const getAllUsers = async (): Promise<UserProfile[]> => {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }

    return data || [];
};

// Actualizar rol de usuario (solo para admins)
export const updateUserRole = async (userId: string, newRole: UserRole, adminId: string): Promise<boolean> => {
    const updateData: any = { role: newRole };
    
    // Si se aprueba un usuario pendiente, establecer fecha de aprobación
    if (newRole !== UserRole.Pending) {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = adminId;
    }

    const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId);

    if (error) {
        console.error('Error updating user role:', error);
        return false;
    }

    return true;
};

// Eliminar usuario (solo para admins)
export const deleteUser = async (userId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

    if (error) {
        console.error('Error deleting user:', error);
        return false;
    }

    return true;
};

// Hook personalizado para verificar permisos
export const useUserPermissions = () => {
    const [permissions, setPermissions] = React.useState<UserPermissions | null>(null);
    const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchUserData = async () => {
            const profile = await getCurrentUserProfile();
            setUserProfile(profile);
            
            if (profile) {
                const userPermissions = getPermissionsForRole(profile.role);
                setPermissions(userPermissions);
            }
            
            setLoading(false);
        };

        fetchUserData();

        // Suscribirse a cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchUserData();
        });

        return () => subscription.unsubscribe();
    }, []);

    return { permissions, userProfile, loading };
};
