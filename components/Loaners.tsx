import React, { useState, useMemo, useEffect } from 'react';
import { LoanerBike, LoanerBikeStatus, LoanData, UserPermissions } from '../types';
import { useLoanerBikes, useCreateLoanerBike, useUpdateLoanerBike, useLoanOrRentBike, useReturnBike, useDeleteLoanerBike } from '../services/loanerBikeQueries';
import Loading from './ui/Loading';
import { CardSkeleton, TableRowSkeleton } from './ui/Skeleton';
import { LOANER_STATUS_COLORS, LOANER_STATUS_BADGE_COLORS, LOANER_BIKE_STATUS_TRANSLATIONS } from '../constants';
import { EyeIcon, EditIcon, CheckCircleIcon, SearchIcon, UsersIcon, MoreVerticalIcon, BikePlaceholderIcon, TrashIcon } from './ui/Icons';
import ActionSheet from './ActionSheet';
import LoanerBikeDetailsModal from './LoanerBikeDetailsModal';
import LoanBikeModal from './LoanBikeModal';
import CustomSelect from './ui/CustomSelect';
import ProtectedAction from './ui/ProtectedAction';
import Modal from './ui/Modal';
import { capitalizeFirstLetter, uploadImageToSupabase } from '../services/helpers';

// Componente interno para reemplazar LoanerBikeFormModal
const LoanerBikeFormModalInternal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (bike: any) => void;
    bike: LoanerBike | null;
    nextRefNumber?: string;
}> = ({ isOpen, onClose, onSave, bike, nextRefNumber }) => {
    const [formData, setFormData] = useState<Partial<LoanerBike>>({});
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (bike) {
            setFormData(bike);
            setImagePreview(bike.imageUrl || null);
        } else {
            setFormData({
                refNumber: nextRefNumber,
                serialNumber: null,
                brand: '',
                model: '',
                size: '',
                observations: '',
                imageUrl: null,
                status: LoanerBikeStatus.Available,
            });
            setImagePreview(null);
        }
    }, [bike, isOpen, nextRefNumber]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'serialNumber') {
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
        } else if (['brand', 'model', 'size', 'observations'].includes(name)) {
            setFormData(prev => ({ ...prev, [name]: capitalizeFirstLetter(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const previewUrl = URL.createObjectURL(file);
                setImagePreview(previewUrl);
                const publicUrl = await uploadImageToSupabase(file);
                if (publicUrl) {
                    setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
                }
                URL.revokeObjectURL(previewUrl);
            } catch (error: any) {
                alert(error.message || 'Error al subir la imagen');
                setImagePreview(null);
                if (e.target) e.target.value = '';
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={bike ? 'Editar Bici de Préstamo' : 'Añadir Bici de Préstamo'} size="xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                         <label className="block text-sm font-medium text-gray-300">Imagen</label>
                         <label htmlFor="image-upload" className="mt-1 flex justify-center w-full h-48 px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors bg-gray-700/20">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Vista previa" className="object-cover h-full rounded-md" />
                            ) : (
                                <div className="space-y-2 text-center self-center text-gray-500">
                                    <BikePlaceholderIcon className="mx-auto h-24 w-24" />
                                    <p className="text-sm font-semibold text-gray-400">Añadir foto</p>
                                    <p className="text-xs">Arrastra una imagen o haz clic</p>
                                </div>
                            )}
                        </label>
                        <input id="image-upload" name="image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="refNumber" className="block text-sm font-medium text-gray-300">Nº Referencia</label>
                                <input type="text" name="refNumber" id="refNumber" value={formData.refNumber || ''} readOnly className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm text-gray-400 cursor-not-allowed" />
                            </div>
                            <div>
                                <label htmlFor="size" className="block text-sm font-medium text-gray-300">Talla</label>
                                <input type="text" name="size" id="size" value={formData.size || ''} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="brand" className="block text-sm font-medium text-gray-300">Marca</label>
                                <input type="text" name="brand" id="brand" value={formData.brand || ''} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="model" className="block text-sm font-medium text-gray-300">Modelo</label>
                                <input type="text" name="model" id="model" value={formData.model || ''} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-300">Nº de Serie</label>
                                <input type="text" name="serialNumber" id="serialNumber" value={formData.serialNumber || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="observations" className="block text-sm font-medium text-gray-300">Observaciones / Descripción</label>
                    <textarea name="observations" id="observations" value={formData.observations || ''} onChange={handleChange} rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-6 pb-4 modal-buttons">
                    <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">Cancelar</button>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">Guardar Bicicleta</button>
                </div>
            </form>
        </Modal>
    );
};

interface LoanersProps {
    permissions: UserPermissions;
    showToast?: (message: string, options?: { type?: 'success' | 'error', icon?: React.ReactNode | null }) => void;
}

const Loaners: React.FC<LoanersProps> = ({ permissions, showToast }) => {
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isLoanModalOpen, setLoanModalOpen] = useState(false);
    const [isActionSheetOpen, setActionSheetOpen] = useState(false);
    const [selectedBike, setSelectedBike] = useState<LoanerBike | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<LoanerBikeStatus | 'All'>('All');

    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;
    
    const { data, isLoading } = useLoanerBikes({ 
        page, 
        pageSize: PAGE_SIZE 
    });

    const bikes = data?.bikes || [];
    const hasNextPage = data?.hasNextPage || false;
    const totalPages = data?.totalPages || 1;
    const { mutate: createBike } = useCreateLoanerBike();
    const { mutate: updateBikeMutation } = useUpdateLoanerBike();
    const { mutate: loanOrRentMutation } = useLoanOrRentBike();
    const { mutate: returnBikeMutation } = useReturnBike();
    const { mutate: deleteBikeMutation } = useDeleteLoanerBike();

    const nextRefNumber = useMemo(() => {
        const prefix = 'P-';
        const maxRef = bikes.reduce((max, b) => {
            if (!b.refNumber.startsWith(prefix)) return max;
            const refNum = parseInt(b.refNumber.substring(prefix.length), 10);
            return isNaN(refNum) ? max : Math.max(max, refNum);
        }, 0);
        return `${prefix}${(maxRef + 1).toString().padStart(3, '0')}`;
    }, [bikes]);

    // No need for early return on loading, we'll show skeletons inline

    const filteredBikes = useMemo(() => {
        let bikesToFilter = bikes;

        if (statusFilter !== 'All') {
            bikesToFilter = bikes.filter(bike => bike.status === statusFilter);
        }

        if (!searchQuery) return bikesToFilter;
        
        const lowercasedQuery = searchQuery.toLowerCase();
        return bikesToFilter.filter(bike => 
            bike.refNumber.toLowerCase().includes(lowercasedQuery) ||
            `${bike.brand} ${bike.model}`.toLowerCase().includes(lowercasedQuery) ||
            bike.model.toLowerCase().includes(lowercasedQuery) ||
            (bike.serialNumber && bike.serialNumber.toLowerCase().includes(lowercasedQuery))
        );
    }, [bikes, searchQuery, statusFilter]);
    
    const handleOpenActions = (bike: LoanerBike) => {
        setSelectedBike(bike);
        setActionSheetOpen(true);
    };

    const handleAddNew = () => {
        setSelectedBike(null);
        setFormModalOpen(true);
    };

    const handleEdit = (bike: LoanerBike) => {
        setSelectedBike(bike);
        setFormModalOpen(true);
    };
    
    const handleView = (bike: LoanerBike) => {
        setSelectedBike(bike);
        setDetailsModalOpen(true);
    };
    
    const handleLoan = (bike: LoanerBike) => {
        setSelectedBike(bike);
        setLoanModalOpen(true);
    };

    const handleReturn = (bikeId: number) => {
        returnBikeMutation(bikeId.toString());
        setActionSheetOpen(false);
    }

    const handleDelete = (bikeId: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta bicicleta de préstamo? Esta acción no se puede deshacer.')) {
            deleteBikeMutation(bikeId.toString());
            setActionSheetOpen(false);
        }
    }

    const handleSaveBike = (bikeData: any) => {
        if (bikeData.id) {
            updateBikeMutation({ id: bikeData.id.toString(), bike: bikeData });
        } else {
            createBike(bikeData);
        }
        setFormModalOpen(false);
    };

    const handleConfirmLoan = (loanData: LoanData) => {
        loanOrRentMutation(loanData);
        setLoanModalOpen(false);
    };

    const filterOptions: {label: string, value: LoanerBikeStatus | 'All'}[] = [
        { label: 'Todos los Estados', value: 'All' },
        { label: 'Disponibles', value: LoanerBikeStatus.Available },
        { label: 'Prestadas', value: LoanerBikeStatus.Prestada },
        { label: 'Alquiladas', value: LoanerBikeStatus.Alquilada },
    ];

    const BikeCard: React.FC<{ bike: LoanerBike }> = ({ bike }) => (
        <div className="p-[1px] bg-gradient-to-b from-gray-700/80 to-transparent rounded-lg">
            <div className={`bg-gray-800/90 h-full w-full rounded-lg overflow-hidden flex animate-fade-in group hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 transition-all duration-200 ${LOANER_STATUS_COLORS[bike.status]}`}>
                {bike.imageUrl ? (
                    <img src={bike.imageUrl} alt={`${bike.brand} ${bike.model}`} className="w-24 h-full object-cover" />
                ) : (
                    <div className="w-24 h-full flex items-center justify-center bg-gray-700/50 flex-shrink-0">
                        <BikePlaceholderIcon className="w-16 h-16 text-gray-500" />
                    </div>
                )}
                <div className="p-3 flex-grow flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-mono text-gray-400">#{bike.refNumber}</span>
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${LOANER_STATUS_BADGE_COLORS[bike.status]}`}>
                                {LOANER_BIKE_STATUS_TRANSLATIONS[bike.status]}
                            </span>
                        </div>
                        <h3 className="font-bold text-white text-md mt-1">{bike.brand} {bike.model}</h3>
                        <p className="text-sm text-gray-400">Talla: {bike.size}</p>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                        {bike.status !== LoanerBikeStatus.Available && bike.loanDetails ? (
                            <div className="text-xs text-gray-300">
                                {bike.loanDetails.loaneeName && <p>A: {bike.loanDetails.loaneeName}</p>}
                                <p>Desde: {new Date(bike.loanDetails.startDate).toLocaleDateString('es-ES')}</p>
                            </div>
                        ) : <div />}
                        <button onClick={() => handleOpenActions(bike)} className="p-2 -m-2 text-gray-400 rounded-full transition-colors hover:bg-gray-700/50 hover:text-white hover:shadow-[0_0_10px_rgba(165,180,252,0.2)]">
                            <MoreVerticalIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <h2 className="text-3xl font-bold text-white">Bicicletas de Préstamo</h2>
                </div>
                <ProtectedAction
                    hasPermission={permissions.canCreate}
                    fallbackMessage="No tienes permisos para añadir bicicletas de préstamo"
                    showToast={showToast}
                >
                    <button
                        onClick={handleAddNew}
                        className="flex items-center justify-center bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap w-full"
                    >
                        <CheckCircleIcon className="w-5 h-5 mr-2" /> <span>Añadir Bicicleta</span>
                    </button>
                </ProtectedAction>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    <div className="relative flex-grow">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por Ref, Marca, Modelo..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-gray-700/80 border border-gray-600 rounded-lg shadow-sm text-white focus:ring-blue-500 focus:border-blue-500 w-full h-full pl-10 pr-4 py-2"
                        />
                    </div>
                    <CustomSelect
                        options={filterOptions}
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value)}
                    />
                </div>
            </div>

            {/* Mobile View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <CardSkeleton key={i} />
                    ))
                ) : (
                    filteredBikes.map(bike => <BikeCard key={bike.id} bike={bike} />)
                )}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block p-[1px] bg-gradient-to-b from-gray-700/80 to-transparent rounded-xl">
                 <div className="bg-gray-800/90 h-full w-full rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-900/50">
                                <tr>
                                    <th className="p-4 font-semibold">Ref.</th>
                                    <th className="p-4 font-semibold">Foto</th>
                                    <th className="p-4 font-semibold">Modelo</th>
                                    <th className="p-4 font-semibold">Estado</th>
                                    <th className="p-4 font-semibold">Prestada a</th>
                                    <th className="p-4 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? 
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRowSkeleton key={i} />
                                    ))
                                : 
                                    filteredBikes.map((bike, index) => (
                                    <tr key={bike.id} className={`border-t border-gray-700/50 ${LOANER_STATUS_COLORS[bike.status]} transition-all duration-200 animate-fade-in hover:shadow-lg hover:shadow-black/20`} style={{ animationDelay: `${index * 50}ms` }}>
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
                                            <p className="text-sm text-gray-400">Talla: {bike.size}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${LOANER_STATUS_BADGE_COLORS[bike.status]} shadow-sm backdrop-blur-sm`}>
                                                {LOANER_BIKE_STATUS_TRANSLATIONS[bike.status]}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-300">
                                            {bike.loanDetails?.loaneeName || '-'}
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
                    <div className="p-4 flex items-center justify-between border-t border-gray-700">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-gray-700/80 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <span className="text-gray-400">
                            Página {page} de {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={!hasNextPage}
                            className="px-4 py-2 bg-gray-700/80 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
            
            {(bikes.length === 0 || (bikes.length > 0 && filteredBikes.length === 0)) && (
                <div className="text-center py-20 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                    {bikes.length === 0 ? (
                        <>
                            <UsersIcon className="w-16 h-16 mx-auto text-gray-500" />
                            <h3 className="mt-4 text-xl font-semibold text-white">No hay bicis de préstamo</h3>
                             <p className="mt-1">Añade tu primera bicicleta para gestionarla aquí.</p>
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
                <LoanerBikeFormModalInternal
                    isOpen={isFormModalOpen}
                    onClose={() => setFormModalOpen(false)}
                    onSave={handleSaveBike}
                    bike={selectedBike}
                    nextRefNumber={nextRefNumber}
                />
            )}
            
            {isDetailsModalOpen && selectedBike && (
                <LoanerBikeDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setDetailsModalOpen(false)}
                    bike={selectedBike}
                />
            )}

            {isLoanModalOpen && selectedBike && (
                <LoanBikeModal
                    isOpen={isLoanModalOpen}
                    onClose={() => setLoanModalOpen(false)}
                    onConfirmLoan={handleConfirmLoan}
                    bike={selectedBike}
                />
            )}

            {isActionSheetOpen && selectedBike && (
                 <ActionSheet isOpen={isActionSheetOpen} onClose={() => setActionSheetOpen(false)}>
                    <h3 className="text-lg font-bold text-center text-white px-4 mb-2">{selectedBike.brand} {selectedBike.model}</h3>
                    <div className="p-2 space-y-2">
                         <button onClick={() => { handleView(selectedBike); setActionSheetOpen(false); }} className="w-full flex items-center text-left p-4 bg-gray-700/80 hover:bg-gray-700 rounded-lg text-white text-lg">
                            <EyeIcon className="w-6 h-6 mr-4 text-blue-400"/> Ver Detalles
                        </button>
                        <ProtectedAction 
                            hasPermission={permissions.canEdit}
                            fallbackMessage="No tienes permisos para editar bicis de préstamo"
                            showToast={showToast}
                        >
                            <button onClick={() => { handleEdit(selectedBike); setActionSheetOpen(false); }} className="w-full flex items-center text-left p-4 bg-gray-700/80 hover:bg-gray-700 rounded-lg text-white text-lg">
                                <EditIcon className="w-6 h-6 mr-4 text-green-400"/> Editar
                            </button>
                        </ProtectedAction>
                        {selectedBike.status === LoanerBikeStatus.Available ? (
                            <ProtectedAction 
                                hasPermission={permissions.canEdit}
                                fallbackMessage="No tienes permisos para prestar bicis"
                                showToast={showToast}
                            >
                                <button onClick={() => { handleLoan(selectedBike); setActionSheetOpen(false); }} className="w-full flex items-center text-left p-4 bg-gray-700/80 hover:bg-gray-700 rounded-lg text-white text-lg">
                                    <UsersIcon className="w-6 h-6 mr-4 text-orange-400"/> Prestar / Alquilar
                                </button>
                            </ProtectedAction>
                        ) : (
                            <ProtectedAction 
                                hasPermission={permissions.canEdit}
                                fallbackMessage="No tienes permisos para marcar devoluciones"
                                showToast={showToast}
                            >
                                <button onClick={() => { handleReturn(selectedBike.id); }} className="w-full flex items-center text-left p-4 bg-gray-700/80 hover:bg-gray-700 rounded-lg text-white text-lg">
                                    <CheckCircleIcon className="w-6 h-6 mr-4 text-sky-400"/> Marcar como Devuelta
                                </button>
                            </ProtectedAction>
                        )}
                        <ProtectedAction 
                            hasPermission={permissions.canDelete}
                            fallbackMessage="No tienes permisos para eliminar bicis de préstamo"
                            showToast={showToast}
                        >
                            <button onClick={() => { handleDelete(selectedBike.id); }} className="w-full flex items-center text-left p-4 bg-gray-700/80 hover:bg-gray-700 rounded-lg text-white text-lg">
                                <TrashIcon className="w-6 h-6 mr-4 text-red-400"/> Eliminar
                            </button>
                        </ProtectedAction>
                    </div>
                </ActionSheet>
            )}
        </div>
    );
};

export default Loaners;