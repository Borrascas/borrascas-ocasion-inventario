import React from 'react';

interface ProtectedActionProps {
    hasPermission: boolean;
    fallbackMessage: string;
    children: React.ReactElement;
    showToast?: (message: string, options?: { type?: 'success' | 'error', icon?: React.ReactNode | null }) => void;
    onUnauthorizedClick?: () => void;
}

const ProtectedAction: React.FC<ProtectedActionProps> = ({ 
    hasPermission, 
    fallbackMessage, 
    children, 
    showToast,
    onUnauthorizedClick 
}) => {
    const handleClick = (e: React.MouseEvent) => {
        if (!hasPermission) {
            e.preventDefault();
            e.stopPropagation();
            
            if (onUnauthorizedClick) {
                onUnauthorizedClick();
            } else if (showToast) {
                showToast(fallbackMessage, { type: 'error', icon: '🔒' });
            }
            return;
        }
        
        // Si tiene permisos, ejecutar el click original
        if (children.props.onClick) {
            children.props.onClick(e);
        }
    };

    return React.cloneElement(children, {
        onClick: handleClick,
        className: `${children.props.className || ''} ${
            !hasPermission ? 'opacity-60 cursor-not-allowed' : ''
        }`,
        title: !hasPermission ? fallbackMessage : children.props.title
    });
};

export default ProtectedAction;
