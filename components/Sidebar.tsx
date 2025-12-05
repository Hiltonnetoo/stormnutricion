import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { firebaseSignOut, auth } from '../services/firebaseService';
import { 
    UsersIcon, 
    UtensilsIcon, 
    BarChart3Icon, 
    ClipboardListIcon,
    PaperAirplaneIcon,
    LogInIcon,
    ChevronRightIcon,
} from './icons';

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    badge?: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, badge }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group relative ${
                isActive
                    ? 'bg-gradient-to-r from-sage-500 to-sage-600 text-white shadow-lg shadow-sage-500/25'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`
        }
    >
        {({ isActive }) => (
            <>
                <div className={`transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`}>
                    {icon}
                </div>
                <span className="ml-3 tracking-wide">{label}</span>
                {badge && (
                    <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-sage-100 text-sage-700'
                    }`}>
                        {badge}
                    </span>
                )}
                {!isActive && (
                    <ChevronRightIcon className="w-4 h-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0 transition-all" />
                )}
            </>
        )}
    </NavLink>
);


const Sidebar: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    const handleSignOut = async () => {
        try {
            await firebaseSignOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <aside 
            className="w-[280px] flex-shrink-0 bg-white border-r border-slate-100 flex flex-col z-30 font-sans"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="h-20 flex items-center px-6 border-b border-slate-50">
                <div className="flex items-center gap-3">
                    <div className={`bg-gradient-to-br from-sage-500 to-teal-600 p-2.5 rounded-xl shadow-lg shadow-sage-500/30 transition-transform duration-300 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
                        <UtensilsIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-extrabold text-slate-900 leading-none tracking-tight">Isanutri</h1>
                        <span className="text-[0.6rem] font-bold text-sage-600 tracking-widest uppercase mt-0.5">Professional v5</span>
                    </div>
                </div>
            </div>
            
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <p className="px-4 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-1">Menu Principal</p>
                <NavItem to="/dashboard" icon={<BarChart3Icon className="w-5 h-5" />} label="Visao Geral" />
                <NavItem to="/patients" icon={<UsersIcon className="w-5 h-5" />} label="Pacientes" badge="Novo" />
                
                <p className="px-4 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-6">Ferramentas</p>
                <NavItem to="/diet-generator" icon={<UtensilsIcon className="w-5 h-5" />} label="Gerador IA" badge="Pro" />
                <NavItem to="/food-database" icon={<ClipboardListIcon className="w-5 h-5" />} label="Alimentos" />
                
                <p className="px-4 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-6">Comunicacao</p>
                <NavItem to="/email-admin" icon={<PaperAirplaneIcon className="w-5 h-5" />} label="Mensagens" />
            </nav>

            <div className="p-3 mx-3 mb-3 bg-gradient-to-br from-sage-50 to-teal-50 rounded-2xl border border-sage-100">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-sage-100 rounded-lg">
                        <svg className="w-4 h-4 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span className="text-xs font-bold text-sage-800">Dica Pro</span>
                </div>
                <p className="text-[11px] text-sage-700 leading-relaxed">
                    Use atalhos de teclado para navegar mais rapido. Pressione <kbd className="px-1.5 py-0.5 bg-white rounded text-[10px] font-mono border border-sage-200">?</kbd> para ver todos.
                </p>
            </div>
            
            <div className="p-3 border-t border-slate-100">
                <NavLink 
                    to="/settings" 
                    className="flex items-center w-full p-3 rounded-xl text-left hover:bg-slate-50 transition-all group"
                >
                    <div className="relative">
                        <img
                            className="h-10 w-10 rounded-xl object-cover border-2 border-white shadow-md ring-2 ring-slate-100"
                            src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.displayName || currentUser?.email}&background=0D9488&color=fff&bold=true`}
                            alt="User avatar"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full ring-2 ring-white bg-emerald-500"></span>
                    </div>
                    <div className="ml-3 overflow-hidden flex-1">
                        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-sage-700 transition-colors">
                            {currentUser?.displayName || 'Profissional'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-sage-100 transition-colors">
                        <svg className="w-4 h-4 text-slate-400 group-hover:text-sage-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                </NavLink>
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center mt-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all group"
                >
                    <LogInIcon className="w-4 h-4 mr-2 transform rotate-180 group-hover:-translate-x-1 transition-transform" />
                    Sair da Conta
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
