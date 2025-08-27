// Diagnóstico del estado del usuario actual
import { supabase } from './services/supabaseClient';

const diagnoseUserStatus = async () => {
    console.log('=== DIAGNÓSTICO DEL USUARIO ===');
    
    try {
        // 1. Verificar sesión actual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
            console.error('Error obteniendo sesión:', sessionError);
            return;
        }
        
        if (!session?.user) {
            console.log('❌ No hay usuario logueado');
            return;
        }
        
        console.log('✅ Usuario logueado:', session.user.email);
        console.log('🆔 User ID:', session.user.id);
        
        // 2. Verificar perfil en la base de datos
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
        if (profileError) {
            console.error('❌ Error obteniendo perfil:', profileError);
            
            // Si no existe el perfil, intentar crearlo
            console.log('🔄 Intentando crear perfil...');
            const { data: newProfile, error: createError } = await supabase
                .from('user_profiles')
                .insert({
                    id: session.user.id,
                    email: session.user.email,
                    role: 'admin',
                    approved_at: new Date().toISOString(),
                    approved_by: session.user.id
                })
                .select()
                .single();
                
            if (createError) {
                console.error('❌ Error creando perfil:', createError);
            } else {
                console.log('✅ Perfil creado:', newProfile);
            }
            return;
        }
        
        console.log('✅ Perfil encontrado:', profile);
        console.log('👤 Rol:', profile.role);
        console.log('📅 Aprobado:', profile.approved_at);
        console.log('👨‍💼 Aprobado por:', profile.approved_by);
        
        // 3. Verificar permisos
        const getPermissionsForRole = (role) => {
            switch (role) {
                case 'admin':
                    return {
                        canView: true,
                        canCreate: true,
                        canEdit: true,
                        canDelete: true,
                        canManageUsers: true,
                        canExport: true
                    };
                case 'editor':
                    return {
                        canView: true,
                        canCreate: true,
                        canEdit: true,
                        canDelete: true,
                        canManageUsers: false,
                        canExport: true
                    };
                case 'viewer':
                    return {
                        canView: true,
                        canCreate: false,
                        canEdit: false,
                        canDelete: false,
                        canManageUsers: false,
                        canExport: false
                    };
                case 'pending':
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
        
        const permissions = getPermissionsForRole(profile.role);
        console.log('🔐 Permisos calculados:', permissions);
        
        // 4. Verificar políticas RLS
        console.log('\n=== VERIFICANDO POLÍTICAS RLS ===');
        
        // Probar lectura de bicicletas de préstamo
        const { data: loanerBikes, error: loanerError } = await supabase
            .from('loaner_bikes')
            .select('id, brand, model')
            .limit(1);
            
        if (loanerError) {
            console.error('❌ Error accediendo a loaner_bikes:', loanerError);
        } else {
            console.log('✅ Acceso a loaner_bikes:', loanerBikes?.length || 0, 'registros');
        }
        
        // Probar actualización de una bicicleta de préstamo (sin cambiar datos reales)
        if (loanerBikes && loanerBikes.length > 0) {
            const testBike = loanerBikes[0];
            const { data: updateTest, error: updateError } = await supabase
                .from('loaner_bikes')
                .update({ brand: testBike.brand }) // Mismo valor, no cambia nada
                .eq('id', testBike.id)
                .select();
                
            if (updateError) {
                console.error('❌ Error en test de actualización:', updateError);
            } else {
                console.log('✅ Puede actualizar loaner_bikes');
            }
        }
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
};

// Ejecutar diagnóstico
diagnoseUserStatus();
