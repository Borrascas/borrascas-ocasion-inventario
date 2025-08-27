# Borrascas Ocasión Inventario

Sistema completo de gestión de inventario para **Borrascas Ocasión**, especialistas en bicicletas de segunda mano.

## 🚴‍♂️ Características

- **Gestión de Inventario**: Control completo de bicis en stock
- **Sistema de Préstamos**: Gestión de alquileres y préstamos
- **Roles y Permisos**: Sistema seguro con 4 niveles de acceso
- **Almacenamiento de Imágenes**: Integración con Supabase Storage
- **Interfaz Responsiva**: Diseño moderno y adaptable

## 🔐 Roles de Usuario

- **Admin**: Control total del sistema y gestión de usuarios
- **Editor**: Puede agregar, editar y eliminar bicis y préstamos
- **Viewer**: Solo puede visualizar inventario y préstamos
- **Pending**: Usuario pendiente de aprobación

## 🛠️ Tecnologías

- React + TypeScript
- Supabase (Backend + Storage)
- Tailwind CSS
- Vite

## 🚀 Instalación

**Prerrequisitos:** Node.js

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar variables de entorno en `.env.local`:
   ```
   VITE_SUPABASE_URL=tu_url_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_supabase
   ```

3. Ejecutar la aplicación:
   ```bash
   npm run dev
   ```

## 📄 Licencia

© 2025 Borrascas Ocasión. Todos los derechos reservados.
