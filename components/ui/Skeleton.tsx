import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
    <div className={`animate-pulse bg-gray-700/50 rounded-lg ${className}`} />
);

export const TableRowSkeleton: React.FC = () => (
    <tr className="border-t border-gray-700/50">
        <td className="p-4"><Skeleton className="h-4 w-16" /></td>
        <td className="p-4"><Skeleton className="h-12 w-16" /></td>
        <td className="p-4">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-4 w-20" />
        </td>
        <td className="p-4"><Skeleton className="h-6 w-24" /></td>
        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
        <td className="p-4 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></td>
    </tr>
);

export const CardSkeleton: React.FC = () => (
    <div className="p-[1px] bg-gradient-to-b from-gray-700/80 to-transparent rounded-lg">
        <div className="bg-gray-800/90 h-full w-full rounded-lg overflow-hidden flex">
            <Skeleton className="w-24 h-full" />
            <div className="p-3 flex-grow flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-5 w-3/4 mt-2" />
                    <Skeleton className="h-4 w-1/3 mt-2" />
                </div>
                <div className="flex justify-end mt-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
        </div>
    </div>
);

export default Skeleton;
