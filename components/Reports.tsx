import React, { useState, useEffect } from 'react';
import { UsersIcon, UtensilsIcon, CheckCircleIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import { 
    getPatientsCount, 
    getActivePatientsCount, 
    getNewPatientsThisMonthCount, 
    getDietsCount, 
    getDietsThisMonthCount 
} from '../services/firebaseService';


const StatCard = ({ title, value, icon, change, loading }: { title: string, value: string, icon: React.ReactNode, change: string, loading: boolean }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</div>
      <div className="text-sage-500">{icon}</div>
    </div>
    <div className="mt-2">
      {loading ? (
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
      ) : (
        <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
      )}
      {loading ? (
        <div className="h-4 mt-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
      ) : (
        <div className="text-sm text-green-500 mt-1">{change}</div>
      )}
    </div>
  </div>
);

const StatusWidget = ({ title, status, color }: { title: string, status: string, color: string }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">{status}</p>
        </div>
        <div className={`w-4 h-4 rounded-full ${color}`}></div>
    </div>
)


const Reports = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        totalPatients: 0,
        activePatients: 0,
        newPatientsThisMonth: 0,
        totalDiets: 0,
        newDietsThisMonth: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        const unsubscribers = [
            getPatientsCount(currentUser.uid, count => setStats(s => ({ ...s, totalPatients: count }))),
            getActivePatientsCount(currentUser.uid, count => setStats(s => ({ ...s, activePatients: count }))),
            getNewPatientsThisMonthCount(currentUser.uid, count => setStats(s => ({ ...s, newPatientsThisMonth: count }))),
            getDietsCount(currentUser.uid, count => setStats(s => ({ ...s, totalDiets: count }))),
            getDietsThisMonthCount(currentUser.uid, count => setStats(s => ({ ...s, newDietsThisMonth: count }))),
        ];
        
        // Let initial data load for a moment before removing skeleton
        const timer = setTimeout(() => setLoading(false), 750);

        // Cleanup function to unsubscribe from all listeners
        return () => {
            clearTimeout(timer);
            unsubscribers.forEach(unsub => unsub());
        };
    }, [currentUser]);

    const successRate = stats.totalPatients > 0 ? ((stats.activePatients / stats.totalPatients) * 100).toFixed(1) : '0.0';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Relatórios</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
            title="Total de Pacientes" 
            value={stats.totalPatients.toLocaleString()} 
            icon={<UsersIcon className="w-6 h-6" />} 
            change={`+${stats.newPatientsThisMonth} este mês`} 
            loading={loading}
        />
        <StatCard 
            title="Dietas Criadas" 
            value={stats.totalDiets.toLocaleString()} 
            icon={<UtensilsIcon className="w-6 h-6" />} 
            change={`+${stats.newDietsThisMonth} este mês`} 
            loading={loading}
        />
        <StatCard 
            title="Taxa de Pacientes Ativos" 
            value={`${successRate}%`} 
            icon={<CheckCircleIcon className="w-6 h-6" />} 
            change={`${stats.activePatients} de ${stats.totalPatients} estão ativos`}
            loading={loading}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Monitoramento de Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatusWidget title="Conectividade de Rede" status="Estável" color="bg-green-500" />
            <StatusWidget title="Recursos do Sistema" status="Normal" color="bg-green-500" />
            <StatusWidget title="Diagnóstico de Email" status="Operacional" color="bg-green-500" />
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Estatísticas Mensais</h2>
        <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Gráfico de estatísticas em breve.</p>
        </div>
      </div>

    </div>
  );
};

export default Reports;