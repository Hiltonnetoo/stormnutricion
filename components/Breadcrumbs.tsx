import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { HomeIcon, ChevronRightIcon } from './icons';

const routeNameMap: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/patients': 'Pacientes',
  '/diet-generator': 'Gerador de Dietas',
  '/food-database': 'Alimentos',
  '/email-admin': 'Emails',
  '/settings': 'Configurações'
};

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex px-4 sm:px-6 lg:px-8 py-3" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-2">
        <li>
          <div>
            <Link to="/dashboard" className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300">
              <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Início</span>
            </Link>
          </div>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const name = routeNameMap[to];

          if (!name) return null;

          return (
            <li key={to}>
              <div className="flex items-center">
                <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                <Link
                  to={to}
                  className={`ml-2 text-sm font-medium ${
                    isLast
                      ? 'text-gray-700 dark:text-gray-200'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {name}
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;