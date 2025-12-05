import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { HomeIcon, ChevronRightIcon } from './icons';

const routeNameMap: { [key: string]: { name: string; icon?: string } } = {
  '/dashboard': { name: 'Visao Geral', icon: '📊' },
  '/patients': { name: 'Pacientes', icon: '👥' },
  '/diet-generator': { name: 'Gerador de Dietas', icon: '🍎' },
  '/food-database': { name: 'Alimentos', icon: '🥗' },
  '/email-admin': { name: 'Mensagens', icon: '✉️' },
  '/settings': { name: 'Configuracoes', icon: '⚙️' }
};

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex px-6 lg:px-8 py-4 bg-white/50 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-20" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-2">
        <li>
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 text-slate-400 hover:text-sage-600 transition-colors group"
          >
            <div className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-sage-50 transition-colors">
              <HomeIcon className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">Inicio</span>
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const routeInfo = routeNameMap[to];

          if (!routeInfo) return null;

          return (
            <li key={to} className="flex items-center">
              <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-slate-300" aria-hidden="true" />
              <Link
                to={to}
                className={`ml-2 flex items-center gap-2 text-sm font-medium transition-colors ${
                  isLast
                    ? 'text-slate-800'
                    : 'text-slate-500 hover:text-sage-600'
                }`}
                aria-current={isLast ? 'page' : undefined}
              >
                {routeInfo.icon && <span className="text-base">{routeInfo.icon}</span>}
                {routeInfo.name}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
