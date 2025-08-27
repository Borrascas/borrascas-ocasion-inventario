import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Loading from './ui/Loading';
import { Bike, BikeStatus, BikeType } from '../types';
import { PIE_CHART_COLORS, BIKE_STATUS_TRANSLATIONS, BIKE_TYPE_COLORS, BIKE_TYPE_TRANSLATIONS } from '../constants';
import { formatCurrency, calculateDaysBetween, calculateProfitMargin } from '../services/helpers';
import { AlertTriangleIcon } from './ui/Icons';
import { useBikes } from '../services/bikeQueries';

const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// Components
const DoubleStatCard: React.FC<{ title1: string; value1: string; title2: string; value2: string; className?: string; }> = ({ 
    title1, value1, title2, value2, className 
}) => (
    <div className={`p-[1px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 rounded-xl lift-on-hover ${className || ''}`}>
        <div className="bg-gray-800/90 h-full w-full rounded-xl p-6 flex justify-around items-center gap-4">
            <div className="text-center">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title1}</h3>
                <p className="mt-2 text-3xl font-bold text-white">{value1}</p>
            </div>
            <div className="w-px h-16 bg-gray-700"></div>
            <div className="text-center">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title2}</h3>
                <p className="mt-2 text-3xl font-bold text-white">{value2}</p>
            </div>
        </div>
    </div>
);

const CardContainer: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
    <div className={`p-[1px] bg-gradient-to-b from-gray-700/80 to-transparent rounded-xl ${className}`}>
        <div className="bg-gray-800/90 h-full w-full rounded-xl p-6">{children}</div>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const salesPayload = payload.find(p => p.dataKey === 'salesCount');
        const profitPayload = payload.find(p => p.dataKey === 'profit');
        
        return (
            <div className="bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg border border-gray-600 shadow-xl">
                <p className="font-bold text-white">{label}</p>
                {salesPayload && <p className="text-sm text-indigo-400">{`Ventas: ${salesPayload.value}`}</p>}
                {profitPayload && <p className="text-sm text-teal-400">{`Beneficio: ${formatCurrency(profitPayload.value)}`}</p>}
            </div>
        );
    }
    return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-bold text-base">
            {value}
        </text>
    );
};

const Dashboard: React.FC = () => {
    // Data fetching and loading state
    const { data: bikes = [], isError: isSetupError, error: setupError, isLoading } = useBikes();

    // Base calculations
    const soldBikes = useMemo(() => 
        bikes.filter(b => b.status === BikeStatus.Sold && b.soldDate && b.finalSellPrice != null), 
        [bikes]
    );

    // Historical data calculations
    const historicalData = useMemo(() => {
        const monthlySummary: { [year: number]: { month: number; name: string; salesCount: number; profit: number; }[] } = {};
        const annualSummary: { [year: string]: { salesCount: number; profit: number; } } = {};
        const availableYears: Set<number> = new Set();
        
        soldBikes.forEach(bike => {
            const soldDate = new Date(bike.soldDate!);
            const year = soldDate.getFullYear();
            const month = soldDate.getMonth();
            const profit = bike.finalSellPrice! - (bike.purchasePrice + (bike.additionalCosts || 0));

            availableYears.add(year);

            if (!monthlySummary[year]) {
                monthlySummary[year] = Array.from({ length: 12 }, (_, i) => ({ 
                    month: i, 
                    name: monthNames[i], 
                    salesCount: 0, 
                    profit: 0 
                }));
            }
            if (!annualSummary[year]) {
                annualSummary[year] = { salesCount: 0, profit: 0 };
            }
            
            monthlySummary[year][month].salesCount++;
            monthlySummary[year][month].profit += profit;
            annualSummary[year].salesCount++;
            annualSummary[year].profit += profit;
        });

        const years = Array.from(availableYears).sort((a, b) => b - a);
        
        // Convertir el resumen anual en un array para el gráfico
        const annualChartData = Object.entries(annualSummary)
            .map(([year, data]) => ({
                year,
                ...data
            }))
            .sort((a, b) => a.year.localeCompare(b.year));
        
        return {
            monthlySummary,
            annualSummary,
            annualChartData,
            availableYears: years,
            currentYear: years[0] || new Date().getFullYear()
        };
    }, [soldBikes]);

    // State
    const [selectedYear, setSelectedYear] = useState(historicalData.currentYear);

    // Other calculations
    const kpis = useMemo(() => {
        const stockBikes = bikes.filter(b => b.status === BikeStatus.Available || b.status === BikeStatus.Reserved);
        const stockValue = stockBikes.reduce((acc, b) => acc + b.sellPrice, 0);
        const stockCost = stockBikes.reduce((acc, b) => acc + b.purchasePrice + (b.additionalCosts || 0), 0);
        const totalProfit = soldBikes.reduce((acc, b) => acc + (b.finalSellPrice! - (b.purchasePrice + (b.additionalCosts || 0))), 0);
        const totalSales = soldBikes.reduce((acc, b) => acc + b.finalSellPrice!, 0);

        return {
            unitsInStock: stockBikes.length.toString(),
            stockValue: formatCurrency(stockValue),
            stockCost: formatCurrency(stockCost),
            totalBikesSold: soldBikes.length.toString(),
            totalProfit: formatCurrency(totalProfit),
            totalSales: formatCurrency(totalSales),
        };
    }, [bikes, soldBikes]);

    const statusDistribution = useMemo(() => {
        const counts = bikes.reduce((acc, bike) => {
            acc[bike.status] = (acc[bike.status] || 0) + 1;
            return acc;
        }, {} as Record<BikeStatus, number>);

        return Object.entries(counts).map(([status, value]) => ({
            name: status as BikeStatus,
            value,
            displayName: BIKE_STATUS_TRANSLATIONS[status as BikeStatus]
        }));
    }, [bikes]);

    const bikeTypeDistribution = useMemo(() => {
        const counts = bikes.reduce((acc, bike) => {
            acc[bike.type] = (acc[bike.type] || 0) + 1;
            return acc;
        }, {} as Record<BikeType, number>);

        return Object.entries(counts).map(([type, value]) => ({
            name: type as BikeType,
            value,
            displayName: BIKE_TYPE_TRANSLATIONS[type as BikeType]
        }));
    }, [bikes]);

    const availableBikeTypeDistribution = useMemo(() => {
        const availableBikes = bikes.filter(b => b.status === BikeStatus.Available);
        const counts = availableBikes.reduce((acc, bike) => {
            acc[bike.type] = (acc[bike.type] || 0) + 1;
            return acc;
        }, {} as Record<BikeType, number>);

        return Object.entries(counts).map(([type, value]) => ({
            name: type as BikeType,
            value,
            displayName: BIKE_TYPE_TRANSLATIONS[type as BikeType]
        }));
    }, [bikes]);

    const inventorySummary = useMemo(() => {
        const breakdown = Object.values(BikeType).reduce((acc, type) => {
            acc[type] = { total: 0, sold: 0, inStock: 0 };
            return acc;
        }, {} as { [key in BikeType]: { total: number; sold: number; inStock: number } });

        for (const bike of bikes) {
            if (breakdown[bike.type]) {
                breakdown[bike.type].total++;
                if (bike.status === BikeStatus.Sold) {
                    breakdown[bike.type].sold++;
                } else if (bike.status === BikeStatus.Available || bike.status === BikeStatus.Reserved) {
                    breakdown[bike.type].inStock++;
                }
            }
        }
        
        return {
            totalBikes: bikes.length,
            typeBreakdown: Object.entries(breakdown)
                .map(([type, stats]) => ({
                    type: type as BikeType,
                    name: BIKE_TYPE_TRANSLATIONS[type as BikeType],
                    stats,
                }))
                .filter(item => item.stats.total > 0)
                .sort((a, b) => b.stats.total - a.stats.total),
        };
    }, [bikes]);

    const performanceMetrics = useMemo(() => {
        if (soldBikes.length === 0) {
            return { avgProfitMargin: 'N/A', avgStockRotation: 'N/A' };
        }

        const margins = soldBikes.map(b => 
            calculateProfitMargin(b.purchasePrice, b.additionalCosts, b.finalSellPrice!)
        ).filter(m => m !== null) as number[];
        
        const daysInStock = soldBikes.map(b => 
            calculateDaysBetween(b.entryDate, b.soldDate)
        ).filter(d => d !== null) as number[];

        const avgMargin = margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : 0;
        const avgDays = daysInStock.length > 0 ? daysInStock.reduce((a, b) => a + b, 0) / daysInStock.length : 0;

        return {
            avgProfitMargin: `${avgMargin.toFixed(2)}%`,
            avgStockRotation: `${Math.round(avgDays)} días`,
        };
    }, [soldBikes]);

    // Loading state
    if (isLoading) {
        return <Loading />;
    }

    // Error state
    if (isSetupError && setupError) {
        return (
            <div className="space-y-8">
                <h2 className="text-3xl font-bold text-white">Panel de Control</h2>
                <div className="text-center py-20 bg-red-900/20 rounded-xl border border-dashed border-red-500/50 animate-fade-in">
                    <AlertTriangleIcon className="w-16 h-16 mx-auto text-red-400" />
                    <h3 className="mt-4 text-xl font-semibold text-white">Error de Configuración</h3>
                    <p className="text-red-300 mt-2 max-w-2xl mx-auto">{setupError.message}</p>
                    <p className="text-gray-400 mt-4">Ve al Editor SQL de tu proyecto Supabase y ejecuta el script de creación de tablas para solucionar este problema.</p>
                </div>
            </div>
        );
    }

    // Empty state
    if (!bikes || bikes.length === 0) {
        return (
            <div className="space-y-8">
                <h2 className="text-3xl font-bold text-white">Panel de Control</h2>
                <div className="text-center py-20 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                    <h3 className="text-xl font-semibold text-white">Aún no hay datos</h3>
                    <p className="text-gray-400 mt-2">Añade tu primera bicicleta en la sección de 'Inventario' para ver las estadísticas.</p>
                </div>
            </div>
        );
    }

    // Main render
    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white">Panel de Control</h2>
            
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DoubleStatCard
                    title1="Bicis en Stock"
                    value1={kpis.unitsInStock}
                    title2="Bicis Vendidas"
                    value2={kpis.totalBikesSold}
                />
                <DoubleStatCard
                    title1="Valor del Stock"
                    value1={kpis.stockValue}
                    title2="Coste del Stock"
                    value2={kpis.stockCost}
                />
                <DoubleStatCard
                    title1="Ventas Total"
                    value1={kpis.totalSales}
                    title2="Beneficio Total"
                    value2={kpis.totalProfit}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                {/* Monthly Analysis */}
                <CardContainer>
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <h3 className="text-xl font-semibold text-white">Análisis Mensual</h3>
                            <select 
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="bg-gray-700/80 border border-gray-600 rounded-lg shadow-sm text-white focus:ring-blue-500 focus:border-blue-500 px-3 py-1.5"
                            >
                                {historicalData.availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart 
                                data={historicalData.monthlySummary[selectedYear] || []} 
                                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                                <YAxis yAxisId="left" orientation="left" stroke="#818CF8" fontSize={12} />
                                <YAxis 
                                    yAxisId="right" 
                                    orientation="right" 
                                    stroke="#2DD4BF" 
                                    fontSize={12} 
                                    tickFormatter={(value) => `${formatCurrency(value)}`} 
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="salesCount" fill="#818CF8" name="Ventas" />
                                <Bar yAxisId="right" dataKey="profit" fill="#2DD4BF" name="Beneficio (€)" />
                            </BarChart>
                        </ResponsiveContainer>

                        <div className="overflow-x-auto max-h-72">
                            <table className="w-full text-left">
                                <thead className="bg-gray-900/50 sticky top-0">
                                    <tr>
                                        <th className="p-3 font-semibold">Mes</th>
                                        <th className="p-3 font-semibold text-center">Bicis Vendidas</th>
                                        <th className="p-3 font-semibold text-center">Beneficio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(historicalData.monthlySummary[selectedYear] || []).map(({ name, salesCount, profit }) => (
                                        <tr key={name} className="border-t border-gray-700/50">
                                            <td className="p-3 text-gray-300">{name}</td>
                                            <td className="p-3 text-center font-mono">{salesCount}</td>
                                            <td className={`p-3 text-center font-mono ${profit > 0 ? 'text-teal-400' : profit < 0 ? 'text-red-400' : 'text-gray-300'}`}>{formatCurrency(profit)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContainer>

                {/* Annual Analysis */}
                <CardContainer>
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">Análisis Anual Histórico</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart 
                                data={historicalData.annualChartData} 
                                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                                <XAxis dataKey="year" stroke="#9CA3AF" fontSize={12} />
                                <YAxis yAxisId="left" orientation="left" stroke="#818CF8" fontSize={12} />
                                <YAxis 
                                    yAxisId="right" 
                                    orientation="right" 
                                    stroke="#2DD4BF" 
                                    fontSize={12} 
                                    tickFormatter={(value) => `${formatCurrency(value)}`} 
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="salesCount" fill="#818CF8" name="Ventas" />
                                <Bar yAxisId="right" dataKey="profit" fill="#2DD4BF" name="Beneficio (€)" />
                            </BarChart>
                        </ResponsiveContainer>

                        <div className="overflow-x-auto max-h-72">
                            <table className="w-full text-left">
                                <thead className="bg-gray-900/50 sticky top-0">
                                    <tr>
                                        <th className="p-3 font-semibold">Año</th>
                                        <th className="p-3 font-semibold text-center">Bicis Vendidas</th>
                                        <th className="p-3 font-semibold text-center">Beneficio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(historicalData.annualSummary)
                                        .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
                                        .map(([year, data]: [string, { salesCount: number; profit: number }]) => (
                                            <tr key={year} className="border-t border-gray-700/50">
                                                <td className="p-3 text-gray-300 font-bold">{year}</td>
                                                <td className="p-3 text-center font-mono">{data.salesCount}</td>
                                                <td className={`p-3 text-center font-mono ${data.profit > 0 ? 'text-teal-400' : data.profit < 0 ? 'text-red-400' : 'text-gray-300'}`}>{formatCurrency(data.profit)}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContainer>
            </div>

            {/* Performance Metrics and Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <CardContainer>
                    <div className="space-y-4 h-full flex flex-col justify-between">
                        <h3 className="text-xl font-semibold text-white">Métricas de Rendimiento</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 flex-grow items-center">
                            <div className="text-center">
                                <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                                    Margen de Beneficio Medio
                                </h4>
                                <p className={`mt-2 text-3xl font-bold ${soldBikes.length > 0 ? 'text-green-400' : 'text-white'}`}>
                                    {performanceMetrics.avgProfitMargin}
                                </p>
                            </div>
                            <div className="text-center">
                                <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                                    Rotación de Stock (Media)
                                </h4>
                                <p className={`mt-2 text-3xl font-bold ${soldBikes.length > 0 ? 'text-sky-400' : 'text-white'}`}>
                                    {performanceMetrics.avgStockRotation}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContainer>

                {/* Distribution Charts */}
                <CardContainer>
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">Estado del Inventario</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie 
                                    data={statusDistribution} 
                                    dataKey="value" 
                                    nameKey="displayName" 
                                    cx="50%" 
                                    cy="50%" 
                                    outerRadius={80} 
                                    labelLine={false} 
                                    label={renderCustomizedLabel}
                                >
                                    {statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[entry.name]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContainer>

                <CardContainer>
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">Tipos de Bicicleta</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie 
                                    data={bikeTypeDistribution} 
                                    dataKey="value" 
                                    nameKey="displayName" 
                                    cx="50%" 
                                    cy="50%" 
                                    outerRadius={80} 
                                    labelLine={false} 
                                    label={renderCustomizedLabel}
                                >
                                    {bikeTypeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={BIKE_TYPE_COLORS[entry.name]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContainer>

                <CardContainer>
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">Tipos de Bicicleta (Disponibles)</h3>
                        {availableBikeTypeDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie 
                                        data={availableBikeTypeDistribution} 
                                        dataKey="value" 
                                        nameKey="displayName" 
                                        cx="50%" 
                                        cy="50%" 
                                        outerRadius={80} 
                                        labelLine={false} 
                                        label={renderCustomizedLabel}
                                    >
                                        {availableBikeTypeDistribution.map((entry, index) => (
                                            <Cell key={`cell-available-${index}`} fill={BIKE_TYPE_COLORS[entry.name]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }}/>
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[250px] text-center text-gray-400">
                                No hay bicicletas disponibles.
                            </div>
                        )}
                    </div>
                </CardContainer>
            </div>

            {/* Resumen General del Inventario */}
            <CardContainer>
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white">Resumen General del Inventario</h3>
                    <div className="flex flex-col xl:flex-row gap-6 items-stretch">
                        {/* Total Bikes Stat */}
                        <div className="flex-shrink-0 text-center p-6 bg-gray-900/50 rounded-xl flex flex-col justify-center items-center xl:w-64">
                            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                                Bicicletas Registradas (Total Histórico)
                            </h4>
                            <p className="mt-2 text-6xl font-bold text-white tracking-tighter">
                                {inventorySummary.totalBikes}
                            </p>
                        </div>

                        {/* Breakdown by Type */}
                        {inventorySummary.typeBreakdown.length > 0 && (
                            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {inventorySummary.typeBreakdown.map(({ type, name, stats }) => (
                                    <div 
                                        key={type} 
                                        className="p-4 rounded-xl bg-gray-900/50 flex flex-col" 
                                        style={{ borderTop: `4px solid ${BIKE_TYPE_COLORS[type]}` }}
                                    >
                                        <h4 className="font-bold text-lg text-white">{name}</h4>
                                        <div className="mt-3 space-y-2 text-base flex-grow">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-gray-400">Total:</span>
                                                <span className="font-bold text-2xl text-white">{stats.total}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Vendidas:</span>
                                                <span className="font-semibold text-green-400">{stats.sold}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">En Stock:</span>
                                                <span className="font-semibold text-sky-400">{stats.inStock}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </CardContainer>
        </div>
    );
};

export default Dashboard;
