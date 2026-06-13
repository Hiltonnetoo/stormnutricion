import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import {
  UsersIcon,
  UtensilsIcon,
  CheckCircleIcon,
  BarChart3Icon,
  ClockIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ScaleIcon,
  TrendingUpIcon,
} from "../components/icons";
import { useAuth } from "../contexts/AuthContext";
import {
  getPatientsCount,
  getActivePatientsCount,
  getNewPatientsThisMonthCount,
  getDietsCount,
  getDietsThisMonthCount,
  getAllDiets,
  getPatients,
} from "../services/firebaseService";
import type { AnyDietPlan, Patient } from "../types";
import { Card, Skeleton } from "../components/ui";

/* ------------------------------------------------- Performance chart (B1) */
interface MonthBucket {
  label: string;
  count: number;
}

const buildMonthlyDietBuckets = (
  diets: AnyDietPlan[],
  isEn: boolean,
): MonthBucket[] => {
  const MONTHS_SHORT = isEn
    ? [
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec",
      ]
    : [
        "jan",
        "fev",
        "mar",
        "abr",
        "mai",
        "jun",
        "jul",
        "ago",
        "set",
        "out",
        "nov",
        "dez",
      ];
  const now = new Date();
  const buckets: MonthBucket[] = [];
  const keyToIndex = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    keyToIndex.set(key, buckets.length);
    buckets.push({ label: MONTHS_SHORT[d.getMonth()], count: 0 });
  }
  diets.forEach((diet) => {
    if (!diet.createdAt) return;
    const d = new Date(diet.createdAt);
    if (isNaN(d.getTime())) return;
    const idx = keyToIndex.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (idx !== undefined) buckets[idx].count++;
  });
  return buckets;
};

const PerformanceChart: React.FC<{ buckets: MonthBucket[] }> = ({
  buckets,
}) => {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <div className="h-48 flex items-end justify-between gap-3 px-2 pt-4">
      {buckets.map((b, i) => (
        <div
          key={i}
          className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
        >
          <span className="text-xs font-bold text-slate-500 dark:text-slate-300 stat-number">
            {b.count}
          </span>
          <div
            className="w-full rounded-t-lg bg-gradient-to-t from-sage-300 to-sage-500 transition-all duration-500 min-h-[4px]"
            style={{ height: `${(b.count / max) * 100}%` }}
            title={`${b.count} plano(s) em ${b.label}`}
          />
          <span className="text-[11px] font-semibold text-slate-400 uppercase">
            {b.label}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ------------------------------------------------- Recent activity (B2) */
type ActivityIconKey = "patient" | "diet" | "eval" | "weight";

const ACTIVITY_ICON: Record<
  ActivityIconKey,
  { Icon: React.FC<{ className?: string }>; tone: string }
> = {
  patient: { Icon: UsersIcon, tone: "bg-sky-50 text-sky-600" },
  diet: { Icon: UtensilsIcon, tone: "bg-sage-50 text-sage-600" },
  eval: { Icon: DocumentTextIcon, tone: "bg-violet-50 text-violet-600" },
  weight: { Icon: ScaleIcon, tone: "bg-amber-50 text-amber-600" },
};

interface ActivityItem {
  id: string;
  iconKey: ActivityIconKey;
  text: string;
  date: number; // timestamp for sorting
  label: string; // formatted date label
}

const formatRelative = (ts: number, isEn: boolean): string => {
  const diffMs = Date.now() - ts;
  const day = 24 * 60 * 60 * 1000;
  if (diffMs < day && new Date(ts).toDateString() === new Date().toDateString())
    return isEn ? "Today" : "Hoje";
  if (diffMs < 2 * day) return isEn ? "Yesterday" : "Ontem";
  if (diffMs < 7 * day) {
    const days = Math.floor(diffMs / day);
    return isEn ? `${days} days ago` : `há ${days} dias`;
  }
  return new Date(ts).toLocaleDateString(isEn ? "en-US" : "pt-BR", {
    day: "2-digit",
    month: "short",
  });
};

const buildRecentActivity = (
  patients: Patient[],
  diets: AnyDietPlan[],
  t: TFunction,
  isEn: boolean,
): ActivityItem[] => {
  const items: ActivityItem[] = [];

  patients.forEach((p) => {
    const name = `${p.firstName} ${p.lastName}`.trim();
    if (p.createdAt) {
      const ts = new Date(p.createdAt).getTime();
      if (!isNaN(ts))
        items.push({
          id: `pat_${p.id}`,
          iconKey: "patient",
          text: t("dashboard.activity_registered", { name }),
          date: ts,
          label: "",
        });
    }
    (p.selfEvaluations || [])
      .filter((e) => e.status === "completed" && e.completionDate)
      .forEach((e) => {
        const ts = new Date(e.completionDate!).getTime();
        if (!isNaN(ts))
          items.push({
            id: `eval_${e.id}`,
            iconKey: "eval",
            text: t("dashboard.activity_evaluation", { name }),
            date: ts,
            label: "",
          });
      });
    (p.weightHistory || [])
      .filter((w) => w.origin === "self_reported")
      .forEach((w) => {
        const ts = new Date(w.date).getTime();
        if (!isNaN(ts))
          items.push({
            id: `weight_${p.id}_${w.date}`,
            iconKey: "weight",
            text: t("dashboard.activity_weight", { name, weight: w.weight }),
            date: ts,
            label: "",
          });
      });
  });

  diets.forEach((d) => {
    if (!d.createdAt) return;
    const ts = new Date(d.createdAt).getTime();
    if (isNaN(ts)) return;
    items.push({
      id: `diet_${d.id}`,
      iconKey: "diet",
      text: t("dashboard.activity_diet", { name: d.patientName }),
      date: ts,
      label: "",
    });
  });

  return items
    .sort((a, b) => b.date - a.date)
    .slice(0, 6)
    .map((it) => ({ ...it, label: formatRelative(it.date, isEn) }));
};

/* ---------------------------------------------------------------- Stat card */
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
  loading: boolean;
  tone: { icon: string; text: string };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendUp,
  loading,
  tone,
}) => (
  <Card hover className="p-5 group">
    <div className="flex items-start justify-between mb-4">
      <div
        className={`p-3 rounded-xl ${tone.icon} group-hover:scale-110 transition-transform duration-300`}
      >
        {React.cloneElement(
          icon as React.ReactElement<{ className?: string }>,
          {
            className: `w-5 h-5 ${tone.text}`,
          },
        )}
      </div>
      {!loading && (
        <span
          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
            trendUp
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {trendUp && (
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          )}
          {trend}
        </span>
      )}
    </div>
    <p className="text-sm font-medium text-slate-500">{title}</p>
    {loading ? (
      <Skeleton className="h-9 w-20 mt-1" />
    ) : (
      <p className="text-3xl font-extrabold text-slate-900 dark:text-white stat-number mt-1">
        {value}
      </p>
    )}
  </Card>
);

/* ---------------------------------------------------------- Quick action */
const QuickActionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  onClick?: () => void;
}> = ({ icon, title, desc, color, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700 hover:border-sage-300 hover:shadow-md transition-all group text-left w-full cursor-pointer"
  >
    <div
      className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform`}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-sage-700 transition-colors">
        {title}
      </p>
      <p className="text-xs text-slate-500 truncate">{desc}</p>
    </div>
    <ChevronRightIcon className="w-5 h-5 text-slate-300 group-hover:text-sage-500 group-hover:translate-x-1 transition-all" />
  </button>
);

/* --------------------------------------------------------------- Dashboard */
const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith("en");

  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    newPatientsThisMonth: 0,
    totalDiets: 0,
    newDietsThisMonth: 0,
  });
  const [diets, setDiets] = useState<AnyDietPlan[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribers = [
      getPatientsCount(currentUser.uid, (count) =>
        setStats((s) => ({ ...s, totalPatients: count })),
      ),
      getActivePatientsCount(currentUser.uid, (count) =>
        setStats((s) => ({ ...s, activePatients: count })),
      ),
      getNewPatientsThisMonthCount(currentUser.uid, (count) =>
        setStats((s) => ({ ...s, newPatientsThisMonth: count })),
      ),
      getDietsCount(currentUser.uid, (count) =>
        setStats((s) => ({ ...s, totalDiets: count })),
      ),
      getDietsThisMonthCount(currentUser.uid, (count) =>
        setStats((s) => ({ ...s, newDietsThisMonth: count })),
      ),
      getAllDiets(currentUser.uid, (fetched) => setDiets(fetched)),
      getPatients(currentUser.uid, (fetched) => setPatients(fetched)),
    ];
    const timer = setTimeout(() => setLoading(false), 600);
    return () => {
      clearTimeout(timer);
      unsubscribers.forEach((unsub) => unsub && unsub());
    };
  }, [currentUser]);

  const dietBuckets = useMemo(
    () => buildMonthlyDietBuckets(diets, isEn),
    [diets, isEn],
  );
  const hasDietData = dietBuckets.some((b) => b.count > 0);
  const recentActivity = useMemo(
    () => buildRecentActivity(patients, diets, t, isEn),
    [patients, diets, t, isEn],
  );

  const successRate =
    stats.totalPatients > 0
      ? ((stats.activePatients / stats.totalPatients) * 100).toFixed(0)
      : "0";

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("dashboard.greeting_morning");
    if (hour < 18) return t("dashboard.greeting_afternoon");
    return t("dashboard.greeting_evening");
  };

  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Greeting header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">👋</span>
            <span className="text-sm font-medium text-slate-500">
              {greeting()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t("dashboard.greeting_nutri", {
              name:
                currentUser?.displayName?.split(" ")[0] ||
                t("settings.profile"),
            })}
          </h1>
          <p className="text-slate-500 mt-1">
            {t("dashboard.summary_subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 capitalize">
              {new Date().toLocaleDateString(isEn ? "en-US" : "pt-BR", {
                weekday: "long",
              })}
            </p>
            <p className="text-xs text-slate-400">
              {new Date().toLocaleDateString(isEn ? "en-US" : "pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
        <StatCard
          title={t("dashboard.total_patients")}
          value={stats.totalPatients.toLocaleString()}
          icon={<UsersIcon />}
          trend={t("dashboard.new_this_month", {
            count: stats.newPatientsThisMonth,
          })}
          trendUp={stats.newPatientsThisMonth > 0}
          loading={loading}
          tone={{ icon: "bg-sky-50", text: "text-sky-600" }}
        />
        <StatCard
          title={t("dashboard.active_patients")}
          value={stats.activePatients.toLocaleString()}
          icon={<CheckCircleIcon />}
          trend={t("dashboard.retention", { rate: successRate })}
          trendUp={parseInt(successRate) > 50}
          loading={loading}
          tone={{ icon: "bg-emerald-50", text: "text-emerald-600" }}
        />
        <StatCard
          title={t("dashboard.created_plans")}
          value={stats.totalDiets.toLocaleString()}
          icon={<UtensilsIcon />}
          trend={t("dashboard.new_this_month", {
            count: stats.newDietsThisMonth,
          })}
          trendUp={stats.newDietsThisMonth > 0}
          loading={loading}
          tone={{ icon: "bg-sage-50", text: "text-sage-600" }}
        />
        <StatCard
          title={t("dashboard.average_per_patient")}
          value={
            stats.totalPatients > 0
              ? (stats.totalDiets / stats.totalPatients).toFixed(1)
              : "0"
          }
          icon={<BarChart3Icon />}
          trend={t("dashboard.plans_per_patient")}
          trendUp={false}
          loading={loading}
          tone={{ icon: "bg-violet-50", text: "text-violet-600" }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("dashboard.quick_actions")}
              </h2>
              <p className="text-sm text-slate-500">
                {t("dashboard.quick_actions_subtitle")}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <QuickActionCard
                icon={<UsersIcon className="w-5 h-5 text-sky-600" />}
                title={t("dashboard.action_new_patient")}
                desc={t("dashboard.action_new_patient_desc")}
                color="bg-sky-50"
                onClick={() => navigate("/patients")}
              />
              <QuickActionCard
                icon={<UtensilsIcon className="w-5 h-5 text-sage-600" />}
                title={t("dashboard.action_generate_diet")}
                desc={t("dashboard.action_generate_diet_desc")}
                color="bg-sage-50"
                onClick={() => navigate("/diet-generator")}
              />
              <QuickActionCard
                icon={<ClockIcon className="w-5 h-5 text-amber-600" />}
                title={t("dashboard.action_calendar")}
                desc={t("dashboard.action_calendar_desc")}
                color="bg-amber-50"
                onClick={() => navigate("/calendar")}
              />
              <QuickActionCard
                icon={<BarChart3Icon className="w-5 h-5 text-violet-600" />}
                title={t("dashboard.action_foods")}
                desc={t("dashboard.action_foods_desc")}
                color="bg-violet-50"
                onClick={() => navigate("/food-database")}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t("dashboard.performance")}
                </h2>
                <p className="text-sm text-slate-500">
                  {t("dashboard.performance_subtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/patients")}
                className="text-sm font-semibold text-sage-600 hover:text-sage-700 bg-sage-50 hover:bg-sage-100 px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                {t("dashboard.view_patients")}
              </button>
            </div>
            {loading ? (
              <Skeleton className="h-48 w-full rounded-xl" />
            ) : hasDietData ? (
              <PerformanceChart buckets={dietBuckets} />
            ) : (
              <div className="h-48 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center p-6 group hover:border-sage-300 transition-colors">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3Icon className="w-8 h-8 text-sage-500" />
                </div>
                <p className="font-semibold text-slate-600 dark:text-slate-300">
                  {t("dashboard.performance_empty_title")}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {t("dashboard.performance_empty_desc")}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">
              {t("dashboard.month_summary")}
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              {t("dashboard.month_summary_desc")}
            </p>
            <div className="space-y-3">
              {[
                {
                  label: t("dashboard.summary_new_patients"),
                  value: stats.newPatientsThisMonth,
                  Icon: UsersIcon,
                  color: "text-sky-600 bg-sky-50",
                },
                {
                  label: t("dashboard.summary_plans_created"),
                  value: stats.newDietsThisMonth,
                  Icon: UtensilsIcon,
                  color: "text-sage-600 bg-sage-50",
                },
                {
                  label: t("dashboard.summary_retention_rate"),
                  value: `${successRate}%`,
                  Icon: TrendingUpIcon,
                  color: "text-emerald-600 bg-emerald-50",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 flex items-center justify-center rounded-lg ${item.color}`}
                    >
                      <item.Icon className="w-4 h-4" />
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {item.label}
                    </span>
                  </div>
                  {loading ? (
                    <div className="h-5 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  ) : (
                    <span className="font-bold text-slate-800 dark:text-white">
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">
              {t("dashboard.recent_activity")}
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-2.5 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="flex flex-col items-center text-center py-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                  <ClockIcon className="w-5 h-5" />
                </div>
                <p className="text-sm text-slate-400">
                  {t("dashboard.recent_activity_empty")}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((a) => {
                  const { Icon, tone } = ACTIVITY_ICON[a.iconKey];
                  return (
                    <div key={a.id} className="flex items-start gap-3 py-2">
                      <span
                        className={`shrink-0 mt-0.5 w-8 h-8 flex items-center justify-center rounded-lg ${tone}`}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 dark:text-slate-200 font-medium leading-snug">
                          {a.text}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {a.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Onboarding: aparece apenas quando não há pacientes ainda */}
      {!loading && stats.totalPatients === 0 && (
        <div className="mt-8 p-8 rounded-3xl bg-gradient-to-br from-sage-50 to-teal-50 dark:from-sage-900/20 dark:to-teal-900/20 border-2 border-dashed border-sage-200 dark:border-sage-800">
          <div className="max-w-xl mx-auto text-center">
            <div className="text-5xl mb-4">🌱</div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2">
              {t("dashboard.onboarding_title")}
            </h2>
            <p className="text-slate-500 mb-8">
              {t("dashboard.onboarding_desc")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
              {[
                {
                  step: "1",
                  icon: "👤",
                  title: t("dashboard.onboarding_step_1_title"),
                  desc: t("dashboard.onboarding_step_1_desc"),
                },
                {
                  step: "2",
                  icon: "🥗",
                  title: t("dashboard.onboarding_step_2_title"),
                  desc: t("dashboard.onboarding_step_2_desc"),
                },
                {
                  step: "3",
                  icon: "📱",
                  title: t("dashboard.onboarding_step_3_title"),
                  desc: t("dashboard.onboarding_step_3_desc"),
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-soft text-center"
                >
                  <div className="w-8 h-8 rounded-full bg-sage-600 text-white text-xs font-extrabold flex items-center justify-center shadow-glow">
                    {s.step}
                  </div>
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white text-sm">
                      {s.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate("/patients")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-xl shadow-lg shadow-sage-600/25 transition-all hover:scale-105 cursor-pointer"
            >
              <span>{t("dashboard.onboarding_cta")}</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
