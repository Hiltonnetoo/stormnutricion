import React, { useState, useEffect } from 'react';
import { UsersIcon, UtensilsIcon, CheckCircleIcon, BarChart3Icon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import { 
    getPatientsCount, 
    getActivePatientsCount, 
    getNewPatientsThisMonthCount, 
    getDietsCount, 
    getDietsThisMonthCount 
} from '../services/firebaseService';


const StatCard = ({ title, value, icon, change, loading, colorClass }: { title: string, value: string, icon: React.ReactNode, change: string, loading: boolean, colorClass: string }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3.5 rounded-xl ${colorClass} bg-opacity-10`}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: `w-6 h-6 ${colorClass.replace('bg-', 'text-')}` })}
      </div>
      {loading ? (
          <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse"></div>
      ) : (
          <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 shadow-sm">
            {change.includes('+') ? change.split(' ')[0] : '0%'}
          </span>
      )}
    </div>
    <div className="text-sm font-semibold text-slate-500 dark:text-gray-400 mb-1 tracking-wide">{title}</div>
    {loading ? (
      <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-lg w-1/2 animate-pulse mt-1"></div>
    ) : (
      <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</div>
    )}
    <div className="mt-3 text-xs font-medium text-slate-400">
        {change.replace(/^\+\d+\s/, '')}
    </div>
  </div>
);

const StatusWidget = ({ title, status, color }: { title: string, status: string, color: string }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between group hover:border-sage-200 transition-colors">
        <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${color} ring-4 ring-opacity-20 ${color.replace('bg-', 'ring-')}`}></div>
            <p className="text-sm font-semibold text-slate-700 dark:text-gray-300">{title}</p>
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 bg-slate-50 px-2.5 py-1.5 rounded-lg">{status}</p>
    </div>
)


const Dashboard = () => {
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

        // Pass simple callbacks. getCount in firebaseService now handles errors internally.
        const unsubscribers = [
            getPatientsCount(currentUser.uid, count => setStats(s => ({ ...s, totalPatients: count }))),
            getActivePatientsCount(currentUser.uid, count => setStats(s => ({ ...s, activePatients: count }))),
            getNewPatientsThisMonthCount(currentUser.uid, count => setStats(s => ({ ...s, newPatientsThisMonth: count }))),
            getDietsCount(currentUser.uid, count => setStats(s => ({ ...s, totalDiets: count }))),
            getDietsThisMonthCount(currentUser.uid, count => setStats(s => ({ ...s, newDietsThisMonth: count }))),
        ];
        
        const timer = setTimeout(() => setLoading(false), 750);

        return () => {
            clearTimeout(timer);
            unsubscribers.forEach(unsub => unsub && unsub());
        };
    }, [currentUser]);

    const successRate = stats.totalPatients > 0 ? ((stats.activePatients / stats.totalPatients) * 100).toFixed(1) : '0.0';

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Visão Geral</h1>
            <p className="text-slate-500 mt-2 font-medium">Bem-vindo de volta, Dr(a). {currentUser?.displayName?.split(' ')[0] || 'Profissional'}.</p>
        </div>
        <div className="text-sm text-slate-400 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
        <StatCard 
            title="Pacientes Totais" 
            value={stats.totalPatients.toLocaleString()} 
            icon={<UsersIcon />} 
            change={`+${stats.newPatientsThisMonth} este mês`} 
            loading={loading}
            colorClass="bg-blue-500"
        />
        <StatCard 
            title="Planos Prescritos" 
            value={stats.totalDiets.toLocaleString()} 
            icon={<UtensilsIcon />} 
            change={`+${stats.newDietsThisMonth} este mês`} 
            loading={loading}
            colorClass="bg-sage-500"
        />
        <StatCard 
            title="Taxa de Retenção" 
            value={`${successRate}%`} 
            icon={<CheckCircleIcon />} 
            change={`${stats.activePatients} ativos agora`}
            loading={loading}
            colorClass="bg-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-soft">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Atividade Recente</h2>
                <button className="text-sm font-bold text-sage-600 hover:text-sage-700 bg-sage-50 hover:bg-sage-100 px-4 py-2 rounded-lg transition-colors">Ver Relatório Completo</button>
            </div>
            <div className="h-72 bg-slate-50 dark:bg-gray-700/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-gray-600 flex flex-col items-center justify-center text-slate-400 group hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                     <BarChart3Icon className="w-8 h-8 text-sage-500" />
                </div>
                <p className="text-sm font-semibold">Seus dados de performance aparecerão aqui</p>
                <p className="text-xs mt-1">Gere mais planos para visualizar gráficos</p>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-gradient-to-br from-sage-800 to-teal-900 rounded-3xl p-8 text-white shadow-xl shadow-sage-900/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-white/20 p-1.5 rounded-lg"><UtensilsIcon className="w-4 h-4 text-white"/></span>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-sage-200">Plano Pro</h3>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Isanutri Premium</h3>
                    <p className="text-sage-100 text-sm mb-6 leading-relaxed opacity-90">Sua assinatura está ativa. Você tem acesso ilimitado à inteligência artificial.</p>
                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide bg-black/20 backdrop-blur-sm w-fit px-4 py-2 rounded-xl border border-white/10">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Sistema Operacional
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Status dos Serviços</h3>
                <div className="space-y-3">
                    <StatusWidget title="Database" status="Online" color="bg-emerald-500" />
                    <StatusWidget title="IA Engine" status="Online" color="bg-emerald-500" />
                    <StatusWidget title="Servidor de Email" status="Online" color="bg-emerald-500" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;