
import React, { useState, useMemo } from 'react';
import { Bike, BikeStatus, SaleData, BikeType, BikeFormData, UserPermissions } from '../types';
import { useBikes, useCreateBike, useUpdateBike, useDeleteBike, useSellBike } from '../services/bikeQueries';
import { STATUS_COLORS, STATUS_BADGE_COLORS, BIKE_STATUS_TRANSLATIONS, BIKE_TYPE_TRANSLATIONS, BIKE_TYPE_OPTIONS } from '../constants';
import { EyeIcon, EditIcon, CheckCircleIcon, SearchIcon, InventoryIcon, EuroIcon, TrashIcon, MoreVerticalIcon, BikePlaceholderIcon } from './ui/Icons';
import BikeFormModal from './BikeFormModal';
import SellBikeModal from './SellBikeModal';
import BikeDetailsModal from './BikeDetailsModal';
import ActionSheet from './ActionSheet';
import CustomSelect from './ui/CustomSelect';
import { formatCurrency } from '../services/helpers';
import ConfirmModal from './ui/ConfirmModal';
import ProtectedAction from './ui/ProtectedAction';

interface Props {
    showToast: (message: string, options?: { type?: 'success' | 'error', icon?: React.ReactNode | null }) => void;
    permissions: UserPermissions;
}

const Inventory: React.FC<Props> = ({ showToast, permissions }) => {
    const { data: bikes = [], isLoading } = useBikes();
    const { mutate: createBike } = useCreateBike();
    const { mutate: updateBike } = useUpdateBike();
    const { mutate: deleteBike } = useDeleteBike();
    const { mutate: sellBikeMutation } = useSellBike();
    
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isSellModalOpen, setSellModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isActionSheetOpen, setActionSheetOpen] = useState(false);
    const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
    const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<BikeStatus | 'All'>('All');
    const [typeFilter, setTypeFilter] = useState<BikeType | 'All'>('All');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const { allBrands, allModels } = useMemo(() => {
        // Verificación de seguridad
        if (!bikes || !Array.isArray(bikes)) {
            return { allBrands: [], allModels: [] };
        }
        
        const brandSet = new Set<string>();
        const modelSet = new Set<string>();
        bikes.forEach(bike => {
            if (bike?.brand) brandSet.add(bike.brand);
            if (bike?.model) modelSet.add(bike.model);
        });
        return {
            allBrands: Array.from(brandSet).sort(),
            allModels: Array.from(modelSet).sort(),
        };
    }, [bikes]);

    const filteredBikes = useMemo(() => {
        // Verificación de seguridad para evitar errores si bikes no está definido
        if (!bikes || !Array.isArray(bikes)) {
            return [];
        }
        
        let bikesToFilter = [...bikes]; // Crear copia para evitar mutación

        if (statusFilter !== 'All') {
            bikesToFilter = bikesToFilter.filter(bike => bike.status === statusFilter);
        }

        if (typeFilter !== 'All') {
            bikesToFilter = bikesToFilter.filter(bike => bike.type === typeFilter);
        }

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            bikesToFilter = bikesToFilter.filter(bike => 
                bike.refNumber?.toLowerCase().includes(lowercasedQuery) ||
                `${bike.brand || ''} ${bike.model || ''}`.toLowerCase().includes(lowercasedQuery) ||
                bike.model?.toLowerCase().includes(lowercasedQuery) ||
                (bike.serialNumber && bike.serialNumber.toLowerCase().includes(lowercasedQuery))
            );
        }

        // Asegurar orden por refNumber después de filtros (más recientes primero)
        return bikesToFilter.sort((a, b) => {
            // Verificación adicional para refNumber
            const aRef = a.refNumber || '';
            const bRef = b.refNumber || '';
            return bRef.localeCompare(aRef);
        });
    }, [bikes, searchQuery, statusFilter, typeFilter]);

    const handleOpenActions = (bike: Bike) => {
        setSelectedBike(bike);
        setActionSheetOpen(true);
    };

    const handleAddNew = () => {
        setSelectedBike(null);
        setFormModalOpen(true);
    };

    const handleEdit = (bike: Bike) => {
        setSelectedBike(bike);
        setFormModalOpen(true);
    };
    
    const handleView = (bike: Bike) => {
        setSelectedBike(bike);
        setDetailsModalOpen(true);
    };
    
    const handleSell = (bike: Bike) => {
        setSelectedBike(bike);
        setSellModalOpen(true);
    };
    
    const handleDeleteClick = (bike: Bike) => {
        setSelectedBike(bike);
        setActionSheetOpen(false);
        setConfirmDeleteModalOpen(true);
    };

    const nextRefNumber = useMemo(() => {
        const maxRef = bikes.reduce((max, b) => {
            const refNum = parseInt(b.refNumber, 10);
            return isNaN(refNum) ? max : Math.max(max, refNum);
        }, 0);
        return (maxRef + 1).toString().padStart(4, '0');
    }, [bikes]);


    const handleSaveBike = async (bikeData: BikeFormData & { id?: number }) => {
        try {
            if (bikeData.id) {
                await updateBike({ id: bikeData.id.toString(), bike: bikeData });
                showToast('Bicicleta actualizada correctamente');
            } else {
                await createBike(bikeData);
                showToast('Bicicleta añadida correctamente');
            }
            setFormModalOpen(false);
        } catch (error) {
            showToast('Error al guardar la bicicleta', { type: 'error' });
        }
    };

    const handleConfirmSale = async (saleData: SaleData) => {
        if (saleData.bikeId) {
            try {
                await sellBikeMutation({
                    id: saleData.bikeId.toString(),
                    finalSellPrice: saleData.finalSellPrice,
                    soldDate: new Date().toISOString(),
                    tradeInBike: saleData.tradeInBike,
                });
                showToast('Venta registrada correctamente', { 
                    type: 'success',
                    icon: <EuroIcon className="w-6 h-6 text-green-500" />
                });
                setSellModalOpen(false);
            } catch (error) {
                showToast('Error al registrar la venta', { type: 'error' });
            }
        }
    };

    const handleUpdateStatus = async (bikeId: number | undefined, status: BikeStatus) => {
        if (bikeId) {
            try {
                await updateBike({ id: bikeId.toString(), bike: { status } });
                showToast(`Estado actualizado a: ${BIKE_STATUS_TRANSLATIONS[status]}`, { type: 'success' });
            } catch (error) {
                showToast('Error al actualizar el estado', { type: 'error' });
            }
        }
    };

    const executeDelete = async () => {
        if (selectedBike?.id) {
            try {
                await deleteBike(selectedBike.id.toString());
                showToast('Bicicleta eliminada correctamente', { type: 'success' });
                setConfirmDeleteModalOpen(false);
                setSelectedBike(null);
            } catch (error) {
                showToast('Error al eliminar la bicicleta', { type: 'error' });
            }
        }
    };

    const statusFilterOptions: {label: string, value: BikeStatus | 'All'}[] = [
        { label: 'Todos los Estados', value: 'All' },
        { label: 'Disponible', value: BikeStatus.Available },
        { label: 'Reservado', value: BikeStatus.Reserved },
        { label: 'Vendido', value: BikeStatus.Sold },
        { label: 'No Disponible', value: BikeStatus.Unavailable },
    ];
    
    const typeFilterOptions: {label: string, value: BikeType | 'All'}[] = [
        { label: 'Todos los Tipos', value: 'All' },
        ...BIKE_TYPE_OPTIONS,
    ];

    const getCardStyle = (status: BikeStatus) => {
        switch (status) {
            case BikeStatus.Sold:
                return 'bg-red-500/10 border border-red-500/20';
            case BikeStatus.Reserved:
                // Using yellow as the reservation color, as requested.
                return 'bg-yellow-500/10 border border-yellow-500/20';
            case BikeStatus.Unavailable:
                return 'opacity-50 bg-gray-800/80 border border-gray-700/50';
            default:
                return 'bg-gray-800/90 border border-gray-700/50';
        }
    };

        const BikeCard: React.FC<{ bike: Bike }> = ({ bike }) => (
        <div className={`${STATUS_COLORS[bike.status]} p-[1px] rounded-lg`}>
            <div className={`h-full w-full rounded-lg overflow-hidden flex animate-fade-in group hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 transition-all duration-200 ${getCardStyle(bike.status)}`}>
                {bike.imageUrl ? (
                    <img src={bike.imageUrl} alt={`${bike.brand} ${bike.model}`} className="w-20 h-full object-cover flex-shrink-0" />
                ) : (
                    <div className="w-20 h-full flex items-center justify-center bg-gray-700/50 flex-shrink-0">
                        <BikePlaceholderIcon className="w-12 h-12 text-gray-500" />
                    </div>
                )}
                <div className="p-3 flex-grow flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start gap-2 mb-1">
                            <span className="text-xs text-gray-400 flex-shrink-0">#{bike.refNumber}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${STATUS_BADGE_COLORS[bike.status]} shadow-sm backdrop-blur-sm`}>
                                {BIKE_STATUS_TRANSLATIONS[bike.status]}
                            </span>
                        </div>
                        <h3 className="font-bold text-white text-sm mt-1 leading-tight">{bike.brand} {bike.model}</h3>
                        <p className="text-xs text-gray-400">{BIKE_TYPE_TRANSLATIONS[bike.type]} - Talla: {bike.size}</p>
                    </div>
                    <div className="flex justify-between items-end mt-2 gap-2">
                        <div className="flex-1">
                            <p className="text-xs text-gray-400">Precio</p>
                             <p className="font-semibold text-xs">
                                {formatCurrency(bike.purchasePrice)} / 
                                {bike.status === BikeStatus.Sold ? (
                                    <span className="text-green-400">{formatCurrency(bike.finalSellPrice)}</span>
                                ) : (
                                    <span className="text-blue-400">{formatCurrency(bike.sellPrice)}</span>
                                )}
                            </p>
                        </div>
                        <button onClick={() => handleOpenActions(bike)} className="p-1.5 text-gray-400 rounded-full transition-colors hover:bg-gray-700/50 hover:text-white flex-shrink-0">
                            <MoreVerticalIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <h2 className="text-3xl font-bold text-white">Inventario</h2>
                </div>
                <ProtectedAction
                    hasPermission={permissions.canCreate}
                    fallbackMessage="No tienes permisos para añadir bicicletas"
                    showToast={showToast}
                >
                    <button
                        onClick={handleAddNew}
                        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap w-full"
                    >
                        <CheckCircleIcon className="w-5 h-5 mr-2" /> <span>Añadir Bicicleta</span>
                    </button>
                </ProtectedAction>
                <div className="flex flex-col gap-3">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por Ref, Marca, Modelo..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-gray-700/80 border border-gray-600 rounded-lg shadow-sm text-white focus:ring-blue-500 focus:border-blue-500 w-full pl-10 pr-4 py-2"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <CustomSelect
                            options={statusFilterOptions}
                            value={statusFilter}
                            onChange={(value) => setStatusFilter(value)}
                            className="w-full"
                        />
                        <CustomSelect
                            options={typeFilterOptions}
                            value={typeFilter}
                            onChange={(value) => setTypeFilter(value)}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Mobile View */}
            <div className="block md:hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredBikes.map(bike => <BikeCard key={bike.id} bike={bike} />)}
                </div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block p-[1px] bg-gradient-to-b from-gray-700/80 to-transparent rounded-xl">
                 <div className="bg-gray-800/90 h-full w-full rounded-xl overflow-hidden">
                    <div className="overflow-x-auto min-w-0">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-gray-900/50">
                                <tr>
                                    <th className="p-4 font-semibold">Ref.</th>
                                    <th className="p-4 font-semibold">Foto</th>
                                    <th className="p-4 font-semibold">Modelo</th>
                                    <th className="p-4 font-semibold">Precio</th>
                                    <th className="p-4 font-semibold">Estado</th>
                                    <th className="p-4 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBikes.map((bike, index) => (
                                    <tr key={bike.id} className={`border-t border-gray-700/50 ${getCardStyle(bike.status)} transition-all duration-200 animate-fade-in hover:shadow-lg hover:shadow-black/20`} style={{ animationDelay: `${index * 50}ms` }}>
                                        <td className="p-4 text-gray-400 font-mono">{bike.refNumber}</td>
                                        <td className="p-4">
                                            {bike.imageUrl ? (
                                                <img src={bike.imageUrl} alt={`${bike.brand} ${bike.model}`} className="w-16 h-12 object-cover rounded-md"/>
                                            ) : (
                                                <div className="w-16 h-12 flex items-center justify-center bg-gray-700/50 rounded-md">
                                                    <BikePlaceholderIcon className="w-10 h-10 text-gray-500" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold">{bike.brand} {bike.model}</p>
                                            <p className="text-sm text-gray-400">{BIKE_TYPE_TRANSLATIONS[bike.type]} &bull; Talla: {bike.size}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-semibold">{formatCurrency(bike.purchasePrice)} / <span className="text-blue-400">{formatCurrency(bike.sellPrice)}</span></p>
                                            {bike.status === BikeStatus.Sold && <p className="text-sm text-green-400">Vendida por: {formatCurrency(bike.finalSellPrice)}</p>}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${STATUS_BADGE_COLORS[bike.status]} shadow-sm backdrop-blur-sm`}>
                                                {BIKE_STATUS_TRANSLATIONS[bike.status]}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleOpenActions(bike)} className="ml-auto p-2 -m-2 text-gray-400 rounded-full transition-colors hover:bg-gray-700/50 hover:text-white hover:shadow-[0_0_10px_rgba(165,180,252,0.2)]">
                                                <MoreVerticalIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {(bikes.length === 0 || (bikes.length > 0 && filteredBikes.length === 0)) && (
                <div className="text-center py-20 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                    {bikes.length === 0 ? (
                        <>
                            <InventoryIcon className="w-16 h-16 mx-auto text-gray-500" />
                            <h3 className="mt-4 text-xl font-semibold text-white">Tu inventario está vacío</h3>
                             <p className="mt-1">Empieza añadiendo tu primera bicicleta para gestionarla aquí.</p>
                        </>
                    ) : (
                        <>
                             <SearchIcon className="w-16 h-16 mx-auto text-gray-500" />
                            <h3 className="mt-4 text-xl font-semibold text-white">No se encontraron resultados</h3>
                            <p className="mt-1">Prueba con otros términos de búsqueda o ajusta los filtros.</p>
                        </>
                    )}
                </div>
            )}


            {isFormModalOpen && (
                <BikeFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setFormModalOpen(false)}
                    onSave={handleSaveBike}
                    bike={selectedBike}
                    nextRefNumber={nextRefNumber}
                    allBrands={allBrands}
                    allModels={allModels}
                />
            )}
            
            {isSellModalOpen && selectedBike && (
                <SellBikeModal
                    isOpen={isSellModalOpen}
                    onClose={() => setSellModalOpen(false)}
                    onConfirmSale={handleConfirmSale}
                    bike={selectedBike}
                    allBrands={allBrands}
                    allModels={allModels}
                    nextRefNumber={nextRefNumber}
                />
            )}
            
            {isDetailsModalOpen && selectedBike && (
                <BikeDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setDetailsModalOpen(false)}
                    bike={selectedBike}
                    bikes={bikes}
                />
            )}

            {isConfirmDeleteModalOpen && selectedBike && (
                <ConfirmModal
                    isOpen={isConfirmDeleteModalOpen}
                    onClose={() => setConfirmDeleteModalOpen(false)}
                    onConfirm={executeDelete}
                    title="Confirmar Eliminación"
                >
                    <p className="text-lg">¿Estás seguro de que quieres vaciar los datos de la bicicleta?</p>
                    <p className="font-bold text-white mt-2">#{selectedBike.refNumber} - {selectedBike.brand} {selectedBike.model}</p>
                    <p className="mt-2 text-sm text-gray-400">
                        Esta acción no se puede deshacer. La referencia se conservará y quedará disponible para añadir una nueva bicicleta.
                    </p>
                </ConfirmModal>
            )}

            {isActionSheetOpen && selectedBike && (
                 <ActionSheet isOpen={isActionSheetOpen} onClose={() => setActionSheetOpen(false)}>
                    <h3 className="text-lg font-bold text-center text-white px-4 mb-2">{selectedBike.brand} {selectedBike.model}</h3>
                    <div className="p-2 space-y-2">
                         <button onClick={() => { handleView(selectedBike); setActionSheetOpen(false); }} className="w-full flex items-center justify-center p-4 bg-gray-700/80 hover:bg-gray-700 rounded-lg text-white text-lg">
                            <EyeIcon className="w-6 h-6 mr-4 text-blue-400"/> Ver Detalles
                        </button>
                        
                        <ProtectedAction
                            hasPermission={permissions.canEdit}
                            fallbackMessage="No tienes permisos para editar bicicletas"
                            showToast={showToast}
                        >
                            <button onClick={() => { handleEdit(selectedBike); setActionSheetOpen(false); }} className="w-full flex items-center justify-center p-4 bg-gray-700/80 hover:bg-gray-700 rounded-lg text-white text-lg">
                                <EditIcon className="w-6 h-6 mr-4 text-green-400"/> Editar
                            </button>
                        </ProtectedAction>
                        
                        <ProtectedAction
                            hasPermission={permissions.canEdit}
                            fallbackMessage="No tienes permisos para vender bicicletas"
                            showToast={showToast}
                        >
                            <button onClick={() => { handleSell(selectedBike); setActionSheetOpen(false); }} className="w-full flex items-center justify-center p-4 bg-gray-700/80 hover:bg-gray-700 rounded-lg text-white text-lg" disabled={selectedBike.status === BikeStatus.Sold}>
                                <EuroIcon className="w-6 h-6 mr-4 text-yellow-400"/> Marcar como Vendida
                            </button>
                        </ProtectedAction>
                        
                        <div className="pt-2 border-t border-gray-600/50">
                            <h4 className="px-4 pt-2 text-sm text-gray-400 font-semibold">Cambiar estado:</h4>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {Object.values(BikeStatus).filter(s => s !== BikeStatus.Sold && s !== BikeStatus.Unavailable).map(status => (
                                    <ProtectedAction
                                        key={status}
                                        hasPermission={permissions.canEdit}
                                        fallbackMessage="No tienes permisos para cambiar el estado de bicicletas"
                                        showToast={showToast}
                                    >
                                        <button onClick={() => { handleUpdateStatus(selectedBike.id, status); setActionSheetOpen(false); }} className={`p-3 text-center rounded-lg text-white font-medium ${selectedBike.status === status ? 'bg-blue-600' : 'bg-gray-600/70 hover:bg-gray-600'}`}>
                                            {BIKE_STATUS_TRANSLATIONS[status]}
                                        </button>
                                    </ProtectedAction>
                                ))}
                                
                                <ProtectedAction
                                    hasPermission={permissions.canEdit}
                                    fallbackMessage="No tienes permisos para cambiar el estado de bicicletas"
                                    showToast={showToast}
                                >
                                    <button
                                        onClick={() => { handleUpdateStatus(selectedBike.id, BikeStatus.Unavailable); setActionSheetOpen(false); }}
                                        className="p-3 text-center rounded-lg text-white font-medium flex items-center justify-center bg-gray-600/70 hover:bg-gray-600 transition-colors col-span-1"
                                    >
                                        No Disponible
                                    </button>
                                </ProtectedAction>
                                
                                <ProtectedAction
                                    hasPermission={permissions.canDelete}
                                    fallbackMessage="No tienes permisos para eliminar bicicletas"
                                    showToast={showToast}
                                >
                                    <button
                                        onClick={() => handleDeleteClick(selectedBike)}
                                        className="p-3 text-center rounded-lg text-white font-medium flex items-center justify-center bg-red-900/70 hover:bg-red-800 transition-colors col-span-1"
                                     >
                                        <TrashIcon className="w-5 h-5 mr-2" />
                                        Eliminar
                                    </button>
                                </ProtectedAction>
                            </div>
                        </div>
                    </div>
                </ActionSheet>
            )}
        </div>
    );
};

export default Inventory;