import React, { useState, useEffect } from 'react';
import { UsersIcon, UtensilsIcon, CheckCircleIcon, BarChart3Icon, ZapIcon, ClockIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import { 
    getPatientsCount, 
    getActivePatientsCount, 
    getNewPatientsThisMonthCount, 
    getDietsCount, 
    getDietsThisMonthCount 
} from '../services/firebaseService';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend: string;
    trendUp: boolean;
    loading: boolean;
    gradient: string;
    iconBg: string;
    delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp, loading, gradient, iconBg, delay }) => (
    <div 
        className="group bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${iconBg} group-hover:scale-110 transition-transform duration-300`}>
                {React.cloneElement(icon as React.ReactElement<any>, { className: `w-5 h-5 ${gradient}` })}
            </div>
            {!loading && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                    trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
                }`}>
                    {trendUp && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    )}
                    {trend}
                </div>
            )}
        </div>
        
        <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            {loading ? (
                <div className="h-9 bg-slate-100 rounded-lg w-20 skeleton-shimmer"></div>
            ) : (
                <p className="text-3xl font-extrabold text-slate-900 stat-number">{value}</p>
            )}
        </div>
    </div>
);

const QuickActionCard: React.FC<{ icon: React.ReactNode; title: string; desc: string; color: string; onClick?: () => void }> = ({ icon, title, desc, color, onClick }) => (
    <button 
        onClick={onClick}
        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group text-left w-full"
    >
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 group-hover:text-sage-700 transition-colors">{title}</p>
            <p className="text-xs text-slate-500 truncate">{desc}</p>
        </div>
        <svg className="w-5 h-5 text-slate-300 group-hover:text-sage-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    </button>
);

const ActivityItem: React.FC<{ icon: React.ReactNode; title: string; time: string; color: string }> = ({ icon, title, time, color }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
        <div className={`p-2 rounded-lg ${color}`}>
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{title}</p>
            <p className="text-xs text-slate-400">{time}</p>
        </div>
    </div>
);

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

        const unsubscribers = [
            getPatientsCount(currentUser.uid, count => setStats(s => ({ ...s, totalPatients: count }))),
            getActivePatientsCount(currentUser.uid, count => setStats(s => ({ ...s, activePatients: count }))),
            getNewPatientsThisMonthCount(currentUser.uid, count => setStats(s => ({ ...s, newPatientsThisMonth: count }))),
            getDietsCount(currentUser.uid, count => setStats(s => ({ ...s, totalDiets: count }))),
            getDietsThisMonthCount(currentUser.uid, count => setStats(s => ({ ...s, newDietsThisMonth: count }))),
        ];
        
        const timer = setTimeout(() => setLoading(false), 600);

        return () => {
            clearTimeout(timer);
            unsubscribers.forEach(unsub => unsub && unsub());
        };
    }, [currentUser]);

    const successRate = stats.totalPatients > 0 ? ((stats.activePatients / stats.totalPatients) * 100).toFixed(0) : '0';
    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">👋</span>
                            <span className="text-sm font-medium text-slate-500">{greeting()}</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Dr(a). {currentUser?.displayName?.split(' ')[0] || 'Profissional'}
                        </h1>
                        <p className="text-slate-500 mt-1">Aqui esta o resumo da sua clinica hoje.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-slate-600">
                                {new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}
                            </p>
                            <p className="text-xs text-slate-400">
                                {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>
                        <button className="p-2.5 bg-sage-50 text-sage-600 rounded-xl hover:bg-sage-100 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard 
                    title="Total de Pacientes" 
                    value={stats.totalPatients.toLocaleString()} 
                    icon={<UsersIcon />}
                    trend={`+${stats.newPatientsThisMonth} este mes`}
                    trendUp={stats.newPatientsThisMonth > 0}
                    loading={loading}
                    gradient="text-blue-600"
                    iconBg="bg-blue-50"
                    delay={0}
                />
                <StatCard 
                    title="Pacientes Ativos" 
                    value={stats.activePatients.toLocaleString()} 
                    icon={<CheckCircleIcon />}
                    trend={`${successRate}% retencao`}
                    trendUp={parseInt(successRate) > 50}
                    loading={loading}
                    gradient="text-emerald-600"
                    iconBg="bg-emerald-50"
                    delay={50}
                />
                <StatCard 
                    title="Planos Criados" 
                    value={stats.totalDiets.toLocaleString()} 
                    icon={<UtensilsIcon />}
                    trend={`+${stats.newDietsThisMonth} este mes`}
                    trendUp={stats.newDietsThisMonth > 0}
                    loading={loading}
                    gradient="text-sage-600"
                    iconBg="bg-sage-50"
                    delay={100}
                />
                <StatCard 
                    title="Media por Paciente" 
                    value={stats.totalPatients > 0 ? (stats.totalDiets / stats.totalPatients).toFixed(1) : '0'} 
                    icon={<BarChart3Icon />}
                    trend="planos/paciente"
                    trendUp={false}
                    loading={loading}
                    gradient="text-violet-600"
                    iconBg="bg-violet-50"
                    delay={150}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Acoes Rapidas</h2>
                                <p className="text-sm text-slate-500">Acesse as funcoes mais usadas</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <QuickActionCard 
                                icon={<UsersIcon className="w-5 h-5 text-blue-600" />}
                                title="Novo Paciente"
                                desc="Cadastrar paciente"
                                color="bg-blue-50"
                            />
                            <QuickActionCard 
                                icon={<UtensilsIcon className="w-5 h-5 text-sage-600" />}
                                title="Gerar Dieta"
                                desc="Criar plano alimentar"
                                color="bg-sage-50"
                            />
                            <QuickActionCard 
                                icon={<ClockIcon className="w-5 h-5 text-amber-600" />}
                                title="Agenda"
                                desc="Ver compromissos"
                                color="bg-amber-50"
                            />
                            <QuickActionCard 
                                icon={<BarChart3Icon className="w-5 h-5 text-violet-600" />}
                                title="Relatorios"
                                desc="Analisar dados"
                                color="bg-violet-50"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Performance</h2>
                                <p className="text-sm text-slate-500">Visao geral do mes atual</p>
                            </div>
                            <button className="text-sm font-semibold text-sage-600 hover:text-sage-700 bg-sage-50 hover:bg-sage-100 px-4 py-2 rounded-lg transition-colors">
                                Ver Detalhes
                            </button>
                        </div>
                        <div className="h-48 bg-gradient-to-br from-slate-50 to-white rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6 group hover:border-sage-300 transition-colors">
                            <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                <BarChart3Icon className="w-8 h-8 text-sage-500" />
                            </div>
                            <p className="font-semibold text-slate-600">Graficos de Performance</p>
                            <p className="text-sm text-slate-400 mt-1">Gere mais planos para visualizar seus dados</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-sage-600 via-teal-600 to-teal-700 rounded-2xl p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-8 -mb-8"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <ZapIcon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-sage-100">Plano Ativo</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Isanutri Pro</h3>
                            <p className="text-sage-100 text-sm mb-4 leading-relaxed">
                                Acesso ilimitado a todas as funcionalidades premium.
                            </p>
                            <div className="flex items-center gap-2 text-xs font-semibold bg-white/10 backdrop-blur-sm w-fit px-3 py-1.5 rounded-lg border border-white/20">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                                </span>
                                Sistema Operacional
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-6">
                        <h3 className="font-bold text-slate-900 mb-4">Atividade Recente</h3>
                        <div className="space-y-1">
                            <ActivityItem 
                                icon={<UsersIcon className="w-4 h-4 text-blue-500" />}
                                title="Sistema inicializado"
                                time="Agora"
                                color="bg-blue-50"
                            />
                            <ActivityItem 
                                icon={<CheckCircleIcon className="w-4 h-4 text-emerald-500" />}
                                title="Conexao estabelecida"
                                time="Ha 1 minuto"
                                color="bg-emerald-50"
                            />
                            <ActivityItem 
                                icon={<UtensilsIcon className="w-4 h-4 text-sage-500" />}
                                title="Pronto para uso"
                                time="Ha 2 minutos"
                                color="bg-sage-50"
                            />
                        </div>
                        <button className="w-full mt-4 text-center text-sm font-medium text-slate-500 hover:text-sage-600 py-2 hover:bg-slate-50 rounded-lg transition-colors">
                            Ver todo historico
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
