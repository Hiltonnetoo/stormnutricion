import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LogoIcon,
  UsersIcon,
  ZapIcon,
  BarChart3Icon,
  ClipboardListIcon,
  HeartIcon,
  ShieldIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  TargetIcon,
  SearchIcon,
} from "../components/icons";
import LanguageSelector from "../components/LanguageSelector";

/* ----------------------------------------------------------------------------
   Brand mark
   -------------------------------------------------------------------------- */
const Logo: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-2.5 group focus-ring rounded-xl cursor-pointer"
  >
    <div className="bg-gradient-to-tr from-sage-700 via-sage-600 to-sage-400 p-2 rounded-xl shadow-glow group-hover:scale-105 transition-transform duration-300">
      <LogoIcon className="w-5 h-5 text-white" />
    </div>
    <span className="text-xl font-extrabold tracking-tight text-slate-900">
      Storm <span className="text-sage-600">Nutrition</span>
    </span>
  </button>
);

/* ----------------------------------------------------------------------------
   Navbar
   -------------------------------------------------------------------------- */
const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-slate-200/70 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-8 h-16">
        <Logo onClick={() => navigate("/")} />

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#recursos" className="hover:text-sage-600 transition-colors">
            {t("home.features_nav")}
          </a>
          <a href="#fluxo" className="hover:text-sage-600 transition-colors">
            {t("home.how_it_works_nav")}
          </a>
          <a href="#precos" className="hover:text-sage-600 transition-colors">
            {t("home.pricing_nav")}
          </a>
          <a href="#paciente" className="hover:text-sage-600 transition-colors">
            {t("home.patient_portal_nav")}
          </a>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector />
          <button
            onClick={() => navigate("/login")}
            className="text-slate-600 hover:text-sage-600 font-semibold text-sm px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {t("home.login")}
          </button>
          <button
            onClick={() => navigate("/register")}
            className="btn btn-primary btn-sm shadow-lg shadow-sage-600/25 hover:-translate-y-0.5 cursor-pointer"
          >
            {t("home.register")}
          </button>
        </div>
      </div>
    </nav>
  );
};

/* ----------------------------------------------------------------------------
   Hero
   -------------------------------------------------------------------------- */
const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden bg-white pt-28 pb-20 lg:pt-36 lg:pb-28">
      {/* ambient backdrop */}
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-40" />
      <div className="pointer-events-none absolute -top-24 right-0 h-[520px] w-[520px] rounded-full bg-sage-100/60 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-[480px] w-[480px] rounded-full bg-sky-100/50 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 items-center gap-16 lg:gap-20">
          {/* copy */}
          <div className="text-center lg:text-left animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-slate-900 leading-[1.05] tracking-tight">
              {t("home.hero_title_1")}
              <br />
              <span className="bg-gradient-to-r from-sage-600 via-sage-500 to-teal-400 bg-clip-text text-transparent">
                {t("home.hero_title_2")}
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              {t("home.hero_description")}
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <button
                onClick={() => navigate("/register")}
                className="btn btn-primary btn-lg group hover:-translate-y-1 hover:shadow-glow cursor-pointer"
              >
                <ZapIcon className="w-5 h-5" />
                {t("home.hero_cta")}
                <ChevronRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
              {[
                t("home.hero_check_1"),
                t("home.hero_check_2"),
                t("home.hero_check_3"),
              ].map((text) => (
                <span key={text} className="inline-flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4 text-sage-500" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* product showcase */}
          <div className="relative animate-fade-in-up [animation-delay:120ms]">
            <ProductShowcase />
          </div>
        </div>
      </div>
    </section>
  );
};

/* Telas reais reconstruídas com o mesmo design system do app. */
const DashFrame: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const isEn = currentLang.startsWith("en");

  const monthlyLabels = isEn
    ? ["jan", "feb", "mar", "apr", "may", "jun"]
    : ["jan", "fev", "mar", "abr", "mai", "jun"];

  return (
    <div className="p-4 bg-slate-50 space-y-3 min-h-[296px]">
      <div className="grid grid-cols-3 gap-2">
        {[
          [t("nav.patients"), "48", "bg-sky-50 text-sky-700"],
          [t("dashboard.created_plans"), "124", "bg-sage-50 text-sage-700"],
          [
            t("dashboard.retention", { rate: 87 }),
            "87%",
            "bg-emerald-50 text-emerald-700",
          ],
        ].map(([label, val, cls]) => (
          <div key={label} className={`${cls} rounded-xl p-3`}>
            <p className="text-[11px] font-bold uppercase opacity-60">
              {label}
            </p>
            <p className="text-xl font-extrabold stat-number">{val}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-3 border border-slate-100">
        <p className="text-[11px] font-bold text-slate-400 uppercase mb-2">
          {isEn
            ? "Performance · last 6 months"
            : "Performance · últimos 6 meses"}
        </p>
        <div className="flex items-end justify-between gap-2 h-20">
          {[
            [monthlyLabels[0], 40],
            [monthlyLabels[1], 58],
            [monthlyLabels[2], 48],
            [monthlyLabels[3], 72],
            [monthlyLabels[4], 64],
            [monthlyLabels[5], 92],
          ].map(([label, h]) => (
            <div
              key={label as string}
              className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
            >
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-sage-300 to-sage-500"
                style={{ height: `${h}%` }}
              />
              <span className="text-[9px] font-semibold text-slate-400 uppercase">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl p-3 border border-slate-100">
        <p className="text-[11px] font-bold text-slate-400 uppercase mb-2">
          {t("dashboard.recent_activity")}
        </p>
        <div className="space-y-2">
          {[
            [
              "🥗",
              t("dashboard.activity_diet", { name: "Ana Lima" }),
              isEn ? "Today" : "Hoje",
            ],
            [
              "👤",
              t("dashboard.activity_registered", { name: "Carlos Melo" }),
              isEn ? "Yesterday" : "Ontem",
            ],
          ].map(([icon, text, when]) => (
            <div key={text} className="flex items-center gap-2.5">
              <span className="text-sm">{icon}</span>
              <span className="text-[11px] text-slate-600 font-medium flex-1">
                {text}
              </span>
              <span className="text-[11px] text-slate-400">{when}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PatientsFrame: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith("en");

  return (
    <div className="p-4 bg-slate-50 min-h-[296px]">
      <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl mb-3">
        <SearchIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-[11px] text-slate-400">
          {t("search.placeholder")}
        </span>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
        {[
          [
            "AL",
            "Ana Lima",
            isEn ? "32 years" : "32 anos",
            isEn ? "Active" : "Ativa",
            "bg-emerald-50 text-emerald-700",
            "bg-sage-100 text-sage-700",
          ],
          [
            "CM",
            "Carlos Melo",
            isEn ? "45 years" : "45 anos",
            isEn ? "Needs review" : "Requer revisão",
            "bg-amber-50 text-amber-700",
            "bg-sky-100 text-sky-700",
          ],
          [
            "JS",
            "Juliana Souza",
            isEn ? "28 years" : "28 anos",
            isEn ? "Active" : "Ativa",
            "bg-emerald-50 text-emerald-700",
            "bg-violet-100 text-violet-700",
          ],
          [
            "RP",
            "Rafael Pinto",
            isEn ? "51 years" : "51 anos",
            isEn ? "No diet" : "Sem dieta",
            "bg-slate-100 text-slate-500",
            "bg-rose-100 text-rose-700",
          ],
        ].map(([ini, name, age, status, badgeCls, avCls]) => (
          <div key={name} className="flex items-center gap-3 px-3 py-2.5">
            <div
              className={`w-8 h-8 rounded-lg ${avCls} text-[10px] font-bold flex items-center justify-center`}
            >
              {ini}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-slate-800 truncate">
                {name}
              </p>
              <p className="text-[10px] text-slate-400">{age}</p>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeCls}`}
            >
              {status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PlanFrame: React.FC = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language.startsWith("en");

  return (
    <div className="p-4 bg-slate-50 space-y-3 min-h-[296px]">
      <div className="bg-sage-50 rounded-xl p-3 grid grid-cols-4 gap-1 text-center border border-sage-100">
        {[
          ["2.040", "kcal", "text-slate-800"],
          ["150g", "Prot", "text-sage-700"],
          ["210g", "Carb", "text-sky-700"],
          ["62g", "Gord", "text-amber-700"],
        ].map(([v, l, c]) => (
          <div key={l}>
            <p className={`text-sm font-extrabold stat-number ${c}`}>{v}</p>
            <p className="text-[9px] text-slate-400 uppercase font-bold">{l}</p>
          </div>
        ))}
      </div>
      {[
        [
          isEn ? "Breakfast" : "Café da Manhã",
          "07:00",
          "510 kcal",
          isEn
            ? "Scrambled eggs, Tapioca and Avocado"
            : "Ovos mexidos, Tapioca e Abacate",
        ],
        [
          isEn ? "Lunch" : "Almoço",
          "12:30",
          "714 kcal",
          isEn
            ? "Grilled chicken, Brown rice and Olive oil"
            : "Frango grelhado, Arroz integral e Azeite",
        ],
      ].map(([meal, time, kcal, items]) => (
        <div
          key={meal}
          className="bg-white rounded-xl p-3 border border-slate-100 relative overflow-hidden"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-sage-500" />
          <div className="flex items-center justify-between mb-1 pl-1.5">
            <p className="text-[12px] font-bold text-slate-800">
              {meal}{" "}
              <span className="text-slate-400 font-medium">— {time}</span>
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage-100 text-sage-700">
              {kcal}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 pl-1.5">{items}</p>
        </div>
      ))}
    </div>
  );
};

const showcaseFrames = [
  { url: "stormnutrition.app/visao-geral", Frame: DashFrame },
  { url: "stormnutrition.app/pacientes", Frame: PatientsFrame },
  { url: "stormnutrition.app/gerador", Frame: PlanFrame },
];

const ProductShowcase: React.FC = () => {
  const [active, setActive] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const id = setInterval(
      () => setActive((i) => (i + 1) % showcaseFrames.length),
      3800,
    );
    return () => clearInterval(id);
  }, []);

  const { url, Frame } = showcaseFrames[active];

  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-gradient-to-tr from-sage-200/40 to-sky-200/40 blur-2xl rounded-[2rem]" />
      <div className="relative rounded-[1.75rem] bg-slate-900 p-2.5 shadow-pop">
        <div className="rounded-[1.35rem] overflow-hidden bg-white">
          {/* window chrome */}
          <div className="bg-slate-900 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400/80" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
            </div>
            <div className="flex-1 text-center">
              <span className="inline-block bg-slate-800/60 text-slate-400 text-[11px] font-medium px-4 py-1 rounded-md border border-slate-700/50 transition-all">
                {url}
              </span>
            </div>
          </div>
          {/* rotating body */}
          <div key={active} className="animate-fade-in">
            <Frame />
          </div>
        </div>
      </div>

      {/* frame indicators */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {showcaseFrames.map((f, i) => (
          <button
            key={f.url}
            onClick={() => setActive(i)}
            aria-label={`Ver ${f.url}`}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              i === active
                ? "w-6 bg-sage-500"
                : "w-1.5 bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>

      {/* floating chip */}
      <div className="absolute -left-6 top-24 hidden sm:flex items-center gap-2.5 bg-white rounded-2xl shadow-card border border-slate-100 px-4 py-3 animate-float">
        <div className="h-9 w-9 rounded-xl bg-sage-50 text-sage-600 flex items-center justify-center">
          <ZapIcon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-900">
            {t("home.portal_mock_checkin_title", "Dieta gerada")}
          </p>
          <p className="text-[11px] text-slate-400">
            {t("home.portal_mock_checkin_desc", "em 3 segundos")}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------------------------------------------------------
   Stats band
   -------------------------------------------------------------------------- */
const Stats: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="border-y border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          ["stats_1_val", "stats_1_lbl"],
          ["stats_2_val", "stats_2_lbl"],
          ["stats_3_val", "stats_3_lbl"],
          ["stats_4_val", "stats_4_lbl"],
        ].map(([valKey, lblKey]) => (
          <div key={lblKey} className="text-center lg:text-left">
            <p className="text-3xl lg:text-4xl font-extrabold text-sage-600 stat-number">
              {t(`home.${valKey}`)}
            </p>
            <p className="mt-1 text-sm text-slate-500 font-medium">
              {t(`home.${lblKey}`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ----------------------------------------------------------------------------
   Features
   -------------------------------------------------------------------------- */
const Features: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <UsersIcon className="w-6 h-6" />,
      title: t("home.feat_patients_title"),
      description: t("home.feat_patients_desc"),
    },
    {
      icon: <ZapIcon className="w-6 h-6" />,
      title: t("home.feat_diet_title"),
      description: t("home.feat_diet_desc"),
    },
    {
      icon: <BarChart3Icon className="w-6 h-6" />,
      title: t("home.feat_metabolic_title"),
      description: t("home.feat_metabolic_desc"),
    },
    {
      icon: <TargetIcon className="w-6 h-6" />,
      title: t("home.feat_tags_title"),
      description: t("home.feat_tags_desc"),
    },
    {
      icon: <ClipboardListIcon className="w-6 h-6" />,
      title: t("home.feat_reports_title"),
      description: t("home.feat_reports_desc"),
    },
    {
      icon: <PaperAirplaneIcon className="w-6 h-6" />,
      title: t("home.feat_email_title"),
      description: t("home.feat_email_desc"),
    },
  ];

  return (
    <section id="recursos" className="py-24 bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="eyebrow mb-3">{t("home.features_eyebrow")}</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            {t("home.features_title")}
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            {t("home.features_subtitle")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
          {features.map((f) => (
            <div key={f.title} className="group card-hover p-7">
              <div className="w-13 h-13 mb-5 flex items-center justify-center rounded-2xl bg-sage-50 text-sage-600 transition-all duration-300 group-hover:bg-sage-600 group-hover:text-white group-hover:scale-105">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-slate-500 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ----------------------------------------------------------------------------
   How it works
   -------------------------------------------------------------------------- */
const HowItWorks: React.FC = () => {
  const { t } = useTranslation();

  const steps = [
    {
      n: t("home.step_1_num"),
      title: t("home.step_1_title"),
      text: t("home.step_1_desc"),
    },
    {
      n: t("home.step_2_num"),
      title: t("home.step_2_title"),
      text: t("home.step_2_desc"),
    },
    {
      n: t("home.step_3_num"),
      title: t("home.step_3_title"),
      text: t("home.step_3_desc"),
    },
  ];

  return (
    <section id="fluxo" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="eyebrow mb-3">{t("home.how_eyebrow")}</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t("home.how_title")}
          </h2>
        </div>

        <div className="relative grid md:grid-cols-3 gap-8">
          <div className="hidden md:block absolute top-7 left-[16%] right-[16%] h-px bg-gradient-to-r from-sage-200 via-sage-300 to-sage-200" />
          {steps.map((s) => (
            <div key={s.n} className="relative text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white border-2 border-sage-100 text-sage-600 font-extrabold text-lg shadow-soft">
                {s.n}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-slate-500 leading-relaxed max-w-xs mx-auto">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ----------------------------------------------------------------------------
   Patient portal highlight
   -------------------------------------------------------------------------- */
const PatientPortalHighlight: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section id="paciente" className="py-24 bg-slate-50/60">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 items-center gap-12">
          <div>
            <p className="eyebrow mb-3">{t("home.portal_eyebrow")}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t("home.portal_title")}
            </h2>
            <p className="mt-4 text-lg text-slate-500 leading-relaxed">
              {t("home.portal_desc")}
            </p>
            <ul className="mt-7 space-y-3">
              {[
                t("home.portal_check_1"),
                t("home.portal_check_2"),
                t("home.portal_check_3"),
              ].map((text) => (
                <li
                  key={text}
                  className="flex items-center gap-3 text-slate-700 font-medium"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                    <CheckCircleIcon className="w-4 h-4" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="mx-auto w-64 rounded-[2.25rem] bg-slate-900 p-2.5 shadow-pop">
              <div className="rounded-[1.85rem] overflow-hidden bg-white">
                <div className="bg-gradient-to-br from-sage-600 to-sage-500 px-5 pt-8 pb-6 text-white">
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                    {t("home.portal_mock_greeting")}
                  </p>
                  <p className="text-xl font-extrabold">Mariana</p>
                  <div className="mt-4 flex items-center gap-2 text-xs bg-white/15 rounded-lg px-3 py-2 w-fit">
                    <HeartIcon className="w-4 h-4" />{" "}
                    {t("home.portal_mock_current")}
                  </div>
                </div>
                <div className="p-4 space-y-2.5">
                  {/* Check-in de adesão (igual ao portal real) */}
                  <div className="flex items-center gap-2.5 rounded-xl bg-sage-50 border border-sage-100 px-3 py-2.5">
                    <span className="text-base">🌟</span>
                    <div>
                      <p className="text-[9px] font-bold text-sage-600 uppercase tracking-wide">
                        {t("home.portal_mock_checkin_title")}
                      </p>
                      <p className="text-[11px] font-bold text-slate-700">
                        {t("home.portal_mock_checkin_desc")}
                      </p>
                    </div>
                  </div>
                  {[
                    [t("home.portal_mock_meal_breakfast"), "07:00", "510 kcal"],
                    [t("home.portal_mock_meal_lunch"), "12:30", "714 kcal"],
                    [t("home.portal_mock_meal_snack"), "16:00", "306 kcal"],
                    [t("home.portal_mock_meal_dinner"), "20:00", "510 kcal"],
                  ].map(([m, time, kcal]) => (
                    <div
                      key={m}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 border border-slate-100"
                    >
                      <div>
                        <p className="text-[12px] font-semibold text-slate-700 leading-tight">
                          {m}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {time} · {kcal}
                        </p>
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ----------------------------------------------------------------------------
   Pricing
   -------------------------------------------------------------------------- */
const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const plans = [
    {
      name: t("home.pricing_free_title"),
      price: "R$ 0",
      period: i18n.language.startsWith("pt") ? "para sempre" : "forever",
      tagline: t("home.pricing_free_tagline"),
      cta: t("home.pricing_free_cta"),
      highlighted: false,
      features: t("home.pricing_free_features", {
        returnObjects: true,
      }) as string[],
    },
    {
      name: t("home.pricing_pro_title"),
      price: i18n.language.startsWith("pt") ? "R$ 89" : "$19",
      period: i18n.language.startsWith("pt") ? "/mês" : "/mo",
      tagline: t("home.pricing_pro_tagline"),
      cta: t("home.pricing_pro_cta"),
      highlighted: true,
      features: t("home.pricing_pro_features", {
        returnObjects: true,
      }) as string[],
    },
    {
      name: t("home.pricing_clinic_title"),
      price: i18n.language.startsWith("pt") ? "R$ 199" : "$49",
      period: i18n.language.startsWith("pt") ? "/mês" : "/mo",
      tagline: t("home.pricing_clinic_tagline"),
      cta: t("home.pricing_clinic_cta"),
      highlighted: false,
      features: t("home.pricing_clinic_features", {
        returnObjects: true,
      }) as string[],
    },
  ];

  return (
    <section id="precos" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="eyebrow mb-3">{t("home.pricing_eyebrow")}</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            {t("home.pricing_title")}
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            {t("home.pricing_desc")}
          </p>
          <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-50 border border-sage-100 text-sage-700 text-xs font-bold">
            <CheckCircleIcon className="w-4 h-4" />
            {t("home.pricing_annual_discount")}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl p-7 transition-all duration-300 ${
                plan.highlighted
                  ? "bg-gradient-to-br from-sage-700 via-sage-600 to-sage-500 text-white shadow-pop lg:-translate-y-3"
                  : "bg-white border border-slate-200/80 shadow-soft hover:-translate-y-1 hover:shadow-card"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute top-5 right-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider">
                  {i18n.language.startsWith("pt")
                    ? "Mais popular"
                    : "Most popular"}
                </span>
              )}
              <h3
                className={`text-lg font-extrabold ${plan.highlighted ? "text-white" : "text-slate-900"}`}
              >
                {plan.name}
              </h3>
              <p
                className={`text-sm mt-0.5 ${plan.highlighted ? "text-sage-50/90" : "text-slate-500"}`}
              >
                {plan.tagline}
              </p>
              <div className="mt-5 flex items-baseline gap-1">
                <span
                  className={`text-4xl font-extrabold stat-number ${plan.highlighted ? "text-white" : "text-slate-900"}`}
                >
                  {plan.price}
                </span>
                <span
                  className={`text-sm font-medium ${plan.highlighted ? "text-sage-50/80" : "text-slate-400"}`}
                >
                  {plan.period}
                </span>
              </div>

              <ul className="mt-7 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        plan.highlighted
                          ? "bg-white/20 text-white"
                          : "bg-sage-100 text-sage-600"
                      }`}
                    >
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                    </span>
                    <span
                      className={
                        plan.highlighted ? "text-sage-50" : "text-slate-600"
                      }
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate("/register")}
                className={`btn btn-md mt-8 w-full justify-center cursor-pointer ${
                  plan.highlighted
                    ? "bg-white text-sage-700 hover:bg-sage-50"
                    : "btn-secondary"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-400">
          {t("home.pricing_footnote")}
        </p>
      </div>
    </section>
  );
};

/* ----------------------------------------------------------------------------
   CTA
   -------------------------------------------------------------------------- */
const CTA: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sage-700 via-sage-600 to-sage-500 px-8 py-16 lg:px-16 text-center shadow-pop">
          <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-teal-300/20 blur-2xl" />
          <div className="relative">
            <ShieldIcon className="w-10 h-10 text-white/90 mx-auto mb-5" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {t("home.cta_title")}
            </h2>
            <p className="mt-4 text-lg text-sage-50/90 max-w-xl mx-auto">
              {t("home.cta_desc")}
            </p>
            <button
              onClick={() => navigate("/register")}
              className="btn btn-lg mt-8 bg-white text-sage-700 hover:bg-sage-50 hover:-translate-y-1 shadow-xl cursor-pointer"
            >
              <ZapIcon className="w-5 h-5" />
              {t("home.cta_btn")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ----------------------------------------------------------------------------
   Footer
   -------------------------------------------------------------------------- */
const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-sage-600 to-sage-400 p-2 rounded-xl">
              <LogoIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-extrabold text-white tracking-tight">
              Storm <span className="text-sage-400">Nutrition</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => navigate("/login")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t("home.login")}
            </button>
            <button
              onClick={() => navigate("/register")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t("home.register")}
            </button>
            <button
              onClick={() => navigate("/paciente")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t("home.footer_patient_area")}
            </button>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-slate-800 text-center text-sm">
          &copy; {new Date().getFullYear()} Storm Nutrition.{" "}
          {t("home.footer_text")}
        </div>
      </div>
    </footer>
  );
};

const Home: React.FC = () => (
  <div className="font-sans antialiased text-slate-800 bg-white">
    <Navbar />
    <Hero />
    <Stats />
    <Features />
    <HowItWorks />
    <Pricing />
    <PatientPortalHighlight />
    <CTA />
    <Footer />
  </div>
);

export default Home;
