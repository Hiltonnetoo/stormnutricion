import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HomeIcon, ChevronRightIcon } from "./icons";
import LanguageSelector from "./LanguageSelector";

const routeNameMap: Record<string, string> = {
  "/dashboard": "nav.overview",
  "/patients": "nav.patients",
  "/calendar": "nav.calendar",
  "/diet-generator": "nav.diet_generator",
  "/metabolic-calculator": "nav.metabolic_calculator",
  "/food-database": "nav.food_database",
  "/reports": "nav.reports",
  "/email-admin": "nav.send_plans",
  "/settings": "nav.settings",
};

interface BreadcrumbsProps {
  onMenu?: () => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ onMenu }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  const crumbs: { to: string; nameKey: string; defaultName: string }[] = [];
  pathnames.forEach((value, index) => {
    const to = `/${pathnames.slice(0, index + 1).join("/")}`;
    if (routeNameMap[to]) {
      crumbs.push({ to, nameKey: routeNameMap[to], defaultName: "" });
    } else if (pathnames[index - 1] === "patients") {
      // dynamic /patients/:id
      crumbs.push({
        to,
        nameKey: "nav.patient_profile",
        defaultName: "Perfil do Paciente",
      });
    }
  });

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14 glass border-b border-slate-200/70 dark:border-slate-700/60 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {onMenu && (
          <button
            onClick={onMenu}
            className="lg:hidden -ml-1 p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Abrir menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}

        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-slate-400 hover:text-sage-600 transition-colors group"
              >
                <span className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-sage-50 transition-colors dark:bg-slate-800">
                  <HomeIcon className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold hidden sm:inline">
                  {t("nav.home", "Início")}
                </span>
              </Link>
            </li>
            {crumbs.map((c, i) => {
              const isLast = i === crumbs.length - 1;
              return (
                <li key={c.to} className="flex items-center gap-1.5 min-w-0">
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300" />
                  <Link
                    to={c.to}
                    aria-current={isLast ? "page" : undefined}
                    className={`text-sm font-semibold truncate transition-colors ${
                      isLast
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-500 hover:text-sage-600"
                    }`}
                  >
                    {t(c.nameKey, c.defaultName)}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSelector />
      </div>
    </header>
  );
};

export default Breadcrumbs;
