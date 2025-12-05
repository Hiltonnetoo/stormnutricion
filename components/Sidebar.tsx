import React from 'react';
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
} from './icons';

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200 group relative ${
                isActive
                    ? 'bg-sage-50 text-sage-700 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`
        }
    >
        {({ isActive }) => (
            <>
                {isActive && <div className="absolute left-0 h-8 w-1 bg-sage-500 rounded-r-full"></div>}
                <div className={isActive ? 'text-sage-600' : 'text-slate-400 group-hover:text-slate-600'}>
                    {icon}
                </div>
                <span className="ml-3.5 tracking-wide">{label}</span>
            </>
        )}
    </NavLink>
);


const Sidebar: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await firebaseSignOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <aside className="w-[280px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30 font-sans">
            <div className="h-24 flex items-center px-6">
                <div className="flex items-center gap-3.5">
                     <div className="bg-gradient-to-br from-sage-500 to-sage-600 p-2.5 rounded-xl shadow-lg shadow-sage-500/20">
                        <UtensilsIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-extrabold text-slate-900 leading-none tracking-tight">Isanutri</h1>
                        <span className="text-[0.65rem] font-bold text-sage-600 tracking-widest uppercase mt-1">Professional v5</span>
                    </div>
                </div>
            </div>
            
            <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                <p className="px-4 text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-2">Principal</p>
                <NavItem to="/dashboard" icon={<BarChart3Icon className="w-5 h-5" />} label="Visão Geral" />
                <NavItem to="/patients" icon={<UsersIcon className="w-5 h-5" />} label="Pacientes" />
                
                <p className="px-4 text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-8">Clínico</p>
                <NavItem to="/diet-generator" icon={<UtensilsIcon className="w-5 h-5" />} label="Gerador IA" />
                <NavItem to="/food-database" icon={<ClipboardListIcon className="w-5 h-5" />} label="Alimentos" />
                
                <p className="px-4 text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-8">Gestão</p>
                <NavItem to="/email-admin" icon={<PaperAirplaneIcon className="w-5 h-5" />} label="Comunicações" />
            </nav>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50/30">
                <NavLink to="/settings" className="flex items-center w-full p-2.5 rounded-2xl text-left hover:bg-white hover:shadow-md hover:shadow-slate-200/50 transition-all border border-transparent hover:border-gray-100 group">
                    <div className="relative">
                        <img
                            className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                            src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.displayName || currentUser?.email}&background=0D9488&color=fff`}
                            alt="User avatar"
                        />
                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400"></span>
                    </div>
                    <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-sage-700 transition-colors">{currentUser?.displayName || 'Profissional'}</p>
                        <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                    </div>
                </NavLink>
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center mt-3 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                    <LogInIcon className="w-4 h-4 mr-2 transform rotate-180" />
                    Sair da Conta
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;