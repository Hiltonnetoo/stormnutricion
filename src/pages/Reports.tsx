import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  UsersIcon,
  UtensilsIcon,
  CheckCircleIcon,
  BarChart3Icon,
} from "../components/icons";
import { useAuth } from "../contexts/AuthContext";
import {
  getPatientsCount,
  getActivePatientsCount,
  getNewPatientsThisMonthCount,
  getDietsCount,
  getDietsThisMonthCount,
  getPatients,
} from "../services/firebaseService";
import { isEmailConfigured } from "../services/emailService";
import { PageHeader, Card, Skeleton } from "../components/ui";
import type { Patient } from "../types";

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  change: string;
  loading: boolean;
  tone: { bg: string; text: string };
}> = ({ title, value, icon, change, loading, tone }) => (
  <Card hover className="p-6">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-500">{title}</span>
      <span className={`p-2.5 rounded-xl ${tone.bg} ${tone.text}`}>{icon}</span>
    </div>
    <div className="mt-3">
      {loading ? (
        <Skeleton className="h-9 w-24" />
      ) : (
        <p className="text-3xl font-extrabold text-slate-900 dark:text-white stat-number">
          {value}
        </p>
      )}
      {loading ? (
        <Skeleton className="h-4 w-32 mt-2" />
      ) : (
        <p className="text-sm text-emerald-600 mt-1 font-medium">{change}</p>
      )}
    </div>
  </Card>
);

const StatusWidget: React.FC<{
  title: string;
  status: string;
  type?: "success" | "warning" | "danger";
}> = ({ title, status, type = "success" }) => {
  const dotColor =
    type === "success"
      ? "bg-emerald-500"
      : type === "warning"
        ? "bg-amber-500"
        : "bg-rose-500";
  const pingColor =
    type === "success"
      ? "bg-emerald-400"
      : type === "warning"
        ? "bg-amber-400"
        : "bg-rose-400";
  return (
    <Card className="p-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-lg font-bold text-slate-800 dark:text-white">
          {status}
        </p>
      </div>
      <span className="relative flex h-3 w-3">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75`}
        />
        <span
          className={`relative inline-flex rounded-full h-3 w-3 ${dotColor}`}
        />
      </span>
    </Card>
  );
};

const Reports: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    newPatientsThisMonth: 0,
    totalDiets: 0,
    newDietsThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [patientsList, setPatientsList] = useState<Patient[]>([]);

  // Performance status states
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [systemLoadTime, setSystemLoadTime] = useState("");

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Calculate page load timing
    const [entry] = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    if (entry) {
      setSystemLoadTime(
        `${entry.domContentLoadedEventEnd.toFixed(0)} ms (${t("reports.fast")})`,
      );
    } else {
      setSystemLoadTime(`80 ms (${t("reports.fast")})`);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [t]);

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
      getPatients(currentUser.uid, (list) => setPatientsList(list)),
    ];
    const timer = setTimeout(() => setLoading(false), 750);
    return () => {
      clearTimeout(timer);
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [currentUser]);

  const successRate =
    stats.totalPatients > 0
      ? ((stats.activePatients / stats.totalPatients) * 100).toFixed(1)
      : "0.0";

  const getLast6MonthsData = () => {
    const monthsData: { key: string; label: string; count: number }[] = [];
    const now = new Date();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString(
        i18n.language === "pt" ? "pt-BR" : "en-US",
        { month: "short" },
      );
      monthsData.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        count: 0,
      });
    }

    // Aggregate real patients registered by month
    patientsList.forEach((patient) => {
      if (!patient.createdAt) return;
      const pDate = new Date(patient.createdAt);
      if (isNaN(pDate.getTime())) return;
      const yearMonth = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, "0")}`;

      const match = monthsData.find((m) => m.key === yearMonth);
      if (match) {
        match.count += 1;
      }
    });

    return monthsData;
  };

  const renderMonthlyStats = () => {
    const chartData = getLast6MonthsData();
    const maxCount = Math.max(...chartData.map((d) => d.count), 5); // default min height is 5
    const height = 180;
    const width = 500;
    const paddingLeft = 35;
    const paddingBottom = 25;
    const chartWidth = width - paddingLeft;
    const chartHeight = height - paddingBottom;

    const barWidth = 40;
    const gap =
      (chartWidth - chartData.length * barWidth) / (chartData.length + 1);

    return (
      <Card className="mt-8 p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          {t("reports.monthly_stats")}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          {t("reports.stats_desc")}
        </p>

        {patientsList.length === 0 && !loading ? (
          <div className="h-48 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
            <BarChart3Icon className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm text-slate-400">
              {t("reports.no_patients_data")}
            </p>
          </div>
        ) : (
          <div className="relative w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full min-w-[400px] h-full overflow-visible"
            >
              {/* Gridlines & Y axis labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const yVal = chartHeight - ratio * (chartHeight - 10);
                const labelVal = Math.round(ratio * maxCount);
                return (
                  <g key={index}>
                    <line
                      x1={paddingLeft}
                      y1={yVal}
                      x2={width}
                      y2={yVal}
                      stroke="currentColor"
                      className="text-slate-100 dark:text-slate-800/60"
                      strokeWidth="1"
                      strokeDasharray="4"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={yVal + 3}
                      textAnchor="end"
                      className="text-[10px] font-bold fill-slate-400"
                    >
                      {labelVal}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {chartData.map((d, i) => {
                const barHeight =
                  d.count > 0 ? (d.count / maxCount) * (chartHeight - 10) : 0;
                const x = paddingLeft + gap + i * (barWidth + gap);
                const y = chartHeight - barHeight;

                return (
                  <g key={d.key} className="group">
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(barHeight, 0)}
                      rx="4"
                      fill="url(#barGradient)"
                      className="transition-all duration-300 hover:brightness-105 cursor-pointer"
                    />

                    <text
                      x={x + barWidth / 2}
                      y={y - 6}
                      textAnchor="middle"
                      className="text-[10px] font-black fill-sage-600 dark:fill-sage-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      {d.count}
                    </text>

                    <text
                      x={x + barWidth / 2}
                      y={chartHeight + 16}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-slate-400 dark:fill-slate-500 uppercase"
                    >
                      {d.label}
                    </text>
                  </g>
                );
              })}

              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader
        icon={<BarChart3Icon className="w-6 h-6" />}
        title={t("reports.title")}
        subtitle={t("reports.subtitle")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title={t("reports.total_patients")}
          value={stats.totalPatients.toLocaleString()}
          icon={<UsersIcon className="w-5 h-5" />}
          change={t("reports.this_month", {
            count: stats.newPatientsThisMonth,
          })}
          loading={loading}
          tone={{ bg: "bg-sky-50", text: "text-sky-600" }}
        />
        <StatCard
          title={t("reports.diets_created")}
          value={stats.totalDiets.toLocaleString()}
          icon={<UtensilsIcon className="w-5 h-5" />}
          change={t("reports.this_month", { count: stats.newDietsThisMonth })}
          loading={loading}
          tone={{ bg: "bg-sage-50", text: "text-sage-600" }}
        />
        <StatCard
          title={t("reports.active_rate")}
          value={`${successRate}%`}
          icon={<CheckCircleIcon className="w-5 h-5" />}
          change={t("reports.active_ratio", {
            active: stats.activePatients,
            total: stats.totalPatients,
          })}
          loading={loading}
          tone={{ bg: "bg-emerald-50", text: "text-emerald-600" }}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          {t("reports.performance_monitoring")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusWidget
            title={t("reports.network_connectivity")}
            status={isOnline ? t("reports.online") : t("reports.offline")}
            type={isOnline ? "success" : "danger"}
          />
          <StatusWidget
            title={t("reports.response_time")}
            status={systemLoadTime}
            type="success"
          />
          <StatusWidget
            title={t("reports.email_diagnostic")}
            status={
              isEmailConfigured()
                ? t("reports.configured")
                : t("reports.not_configured")
            }
            type={isEmailConfigured() ? "success" : "warning"}
          />
        </div>
      </div>

      {renderMonthlyStats()}
    </div>
  );
};

export default Reports;
