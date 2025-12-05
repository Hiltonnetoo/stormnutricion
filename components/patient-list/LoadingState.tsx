import React from 'react';

const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-sage-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-sage-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-6 text-lg font-semibold text-slate-700">Carregando pacientes...</p>
        <p className="text-sm text-slate-400 mt-1">So um momento, estamos buscando os dados.</p>
        
        <div className="mt-8 w-full max-w-md space-y-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl animate-pulse">
                    <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default LoadingState;
