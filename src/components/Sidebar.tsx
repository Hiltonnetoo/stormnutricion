import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import {
  firebaseSignOut,
  auth,
  getPatients,
} from "../services/firebaseService";
import type { Patient } from "../types";
import i18n from "../i18n";
import {
  UsersIcon,
  UtensilsIcon,
  LogoIcon,
  BarChart3Icon,
  ClipboardListIcon,
  PaperAirplaneIcon,
  LogInIcon,
  TargetIcon,
  SearchIcon,
} from "./icons";

const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const BellIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const SettingsGear: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  onNavigate?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  to,
  icon,
  label,
  badge,
  onNavigate,
}) => (
  <NavLink
    to={to}
    onClick={onNavigate}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group relative ${
        isActive
          ? "bg-sage-600 text-white shadow-lg shadow-sage-600/25"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <span
          className={`shrink-0 transition-transform duration-200 ${isActive ? "" : "group-hover:scale-110"}`}
        >
          {icon}
        </span>
        <span className="tracking-wide">{label}</span>
        {badge && (
          <span
            className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isActive
                ? "bg-white/20 text-white"
                : "bg-sage-100 text-sage-700 dark:bg-sage-500/15 dark:text-sage-300"
            }`}
          >
            {badge}
          </span>
        )}
      </>
    )}
  </NavLink>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <p className="px-3.5 text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.12em] mb-1.5 mt-5 first:mt-1">
    {children}
  </p>
);

/* ----------------------------------------------------------------- Notifications panel */
interface NotifItem {
  id: string;
  icon: string;
  text: string;
  time: string;
  patientId?: string;
}

const deriveNotifications = (patients: Patient[]): NotifItem[] => {
  const galaxyDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const items: NotifItem[] = [];

  patients.forEach((p) => {
    const name = `${p.firstName} ${p.lastName}`;
    // Completed self-evaluations
    (p.selfEvaluations || [])
      .filter(
        (e) =>
          e.status === "completed" &&
          e.completionDate &&
          new Date(e.completionDate) > galaxyDaysAgo,
      )
      .forEach((e) => {
        items.push({
          id: `eval_${e.id}`,
          icon: "📝",
          text: i18n.t("notifications.completed_self_evaluation", { name }),
          time: new Date(e.completionDate!).toLocaleDateString("pt-BR"),
          patientId: p.id,
        });
      });
    // Recent weight entries
    (p.weightHistory || [])
      .filter(
        (w) => w.origin === "self_reported" && new Date(w.date) > galaxyDaysAgo,
      )
      .forEach((w) => {
        items.push({
          id: `weight_${p.id}_${w.date}`,
          icon: "⚖️",
          text: i18n.t("notifications.registered_weight", {
            name,
            weight: w.weight,
          }),
          time: new Date(w.date).toLocaleDateString("pt-BR"),
          patientId: p.id,
        });
      });
  });

  return items.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 15);
};

const NotificationBell: React.FC<{ uid: string; onNavigate?: () => void }> = ({
  uid,
  onNavigate,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loaded, setLoaded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || loaded) return;
    const unsub = getPatients(uid, (pts) => {
      setPatients(pts);
      setLoaded(true);
    });
    return () => unsub?.();
  }, [open, uid, loaded]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node))
        setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const notifications = deriveNotifications(patients);
  const count = notifications.length;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-sage-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title={t("notifications.title")}
      >
        <BellIcon className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white dark:bg-slate-850 rounded-2xl shadow-pop border border-slate-200/70 dark:border-slate-700 z-50 animate-scale-in overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <p className="font-bold text-slate-800 dark:text-white text-sm">
              {t("notifications.title")}
            </p>
            <span className="text-xs text-slate-400">
              {t("notifications.last_7_days")}
            </span>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
            {!loaded ? (
              <div className="px-4 py-6 text-center text-sm text-slate-400">
                {t("notifications.loading")}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-2xl mb-2">🔕</p>
                <p className="text-sm text-slate-400">
                  {t("notifications.no_activity")}
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (n.patientId) {
                      navigate(`/patients/${n.patientId}`);
                      onNavigate?.();
                    }
                    setOpen(false);
                  }}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                >
                  <span className="text-lg shrink-0 mt-0.5">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-200 font-medium leading-snug">
                      {n.text}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ----------------------------------------------------------------- Global search */
const GlobalSearch: React.FC<{ onNavigate?: () => void }> = ({
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentUser || loaded) return;
    const unsub = getPatients(currentUser.uid, (pts) => {
      setPatients(pts);
      setLoaded(true);
    });
    return () => unsub?.();
  }, [currentUser, loaded]);

  const results =
    query.trim().length >= 2
      ? patients
          .filter(
            (p) =>
              `${p.firstName} ${p.lastName}`
                .toLowerCase()
                .includes(query.toLowerCase()) ||
              (p.email || "").toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, 6)
      : [];

  return (
    <div className="relative px-3 mb-2">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
        <SearchIcon className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>
      {results.length > 0 && (
        <div className="absolute left-3 right-3 top-full mt-1 bg-white dark:bg-slate-855 rounded-xl shadow-pop border border-slate-200/70 dark:border-slate-700 z-50 overflow-hidden">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                navigate(`/patients/${p.id}`);
                setQuery("");
                onNavigate?.();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
            >
              <img
                src={
                  p.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(p.firstName)}&background=0D9488&color=fff&bold=true&size=32`
                }
                alt={p.firstName}
                className="w-7 h-7 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                  {p.firstName} {p.lastName}
                </p>
                <p className="text-xs text-slate-400 truncate">{p.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ----------------------------------------------------------------- Sidebar */
const Sidebar: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <aside className="w-[272px] h-full shrink-0 bg-white dark:bg-slate-850 border-r border-slate-200/70 dark:border-slate-700/60 flex flex-col">
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3 group focus-ring rounded-xl cursor-pointer"
        >
          <div className="bg-gradient-to-br from-sage-600 to-teal-500 p-2.5 rounded-xl shadow-glow group-hover:scale-105 transition-transform duration-300">
            <LogoIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-lg font-extrabold text-slate-900 dark:text-white leading-none tracking-tight">
              Storm Nutrition
            </span>
            <span className="text-[0.6rem] font-bold text-sage-600 tracking-[0.18em] uppercase mt-0.5">
              Professional v5
            </span>
          </div>
        </button>
        {currentUser && (
          <NotificationBell uid={currentUser.uid} onNavigate={onNavigate} />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {/* Busca global */}
        <GlobalSearch onNavigate={onNavigate} />

        <SectionLabel>{t("nav.main_menu")}</SectionLabel>
        <NavItem
          to="/dashboard"
          icon={<BarChart3Icon className="w-5 h-5" />}
          label={t("nav.overview")}
          onNavigate={onNavigate}
        />
        <NavItem
          to="/patients"
          icon={<UsersIcon className="w-5 h-5" />}
          label={t("nav.patients")}
          onNavigate={onNavigate}
        />
        <NavItem
          to="/calendar"
          icon={<CalendarIcon className="w-5 h-5" />}
          label={t("nav.calendar")}
          onNavigate={onNavigate}
        />

        <SectionLabel>{t("nav.tools")}</SectionLabel>
        <NavItem
          to="/diet-generator"
          icon={<UtensilsIcon className="w-5 h-5" />}
          label={t("nav.diet_generator")}
          onNavigate={onNavigate}
        />
        <NavItem
          to="/metabolic-calculator"
          icon={<TargetIcon className="w-5 h-5" />}
          label={t("nav.metabolic_calculator")}
          onNavigate={onNavigate}
        />
        <NavItem
          to="/food-database"
          icon={<ClipboardListIcon className="w-5 h-5" />}
          label={t("nav.food_database")}
          onNavigate={onNavigate}
        />

        <SectionLabel>{t("nav.analysis")}</SectionLabel>
        <NavItem
          to="/reports"
          icon={<BarChart3Icon className="w-5 h-5" />}
          label={t("nav.reports")}
          onNavigate={onNavigate}
        />

        <SectionLabel>{t("nav.communication")}</SectionLabel>
        <NavItem
          to="/email-admin"
          icon={<PaperAirplaneIcon className="w-5 h-5" />}
          label={t("nav.send_plans")}
          onNavigate={onNavigate}
        />
      </nav>

      {/* Footer / profile */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
        >
          <div className="relative shrink-0">
            <img
              className="h-9 w-9 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-700"
              src={
                currentUser?.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.displayName || currentUser?.email || "U")}&background=0D9488&color=fff&bold=true`
              }
              alt="Avatar"
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white dark:ring-slate-850 bg-emerald-500" />
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-sage-700 transition-colors">
              {currentUser?.displayName || t("settings.profile")}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {currentUser?.email}
            </p>
          </div>
          <SettingsGear className="w-4 h-4 text-slate-400 group-hover:text-sage-600 transition-colors shrink-0" />
        </NavLink>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 mt-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all group dark:hover:bg-rose-500/10 cursor-pointer"
        >
          <LogInIcon className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
          {t("nav.sign_out")}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
