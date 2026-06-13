import React, { Suspense, lazy } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

// Layout Components
import AppShell from "./components/AppShell";

// Lazy Loaded Pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Patients = lazy(() => import("./pages/Patients"));
const PatientProfile = lazy(() => import("./pages/PatientProfile"));
const DietGenerator = lazy(() => import("./pages/DietGenerator"));
const FoodDatabase = lazy(() => import("./pages/FoodDatabase"));
const EmailAdmin = lazy(() => import("./pages/EmailAdmin"));
const Settings = lazy(() => import("./pages/Settings"));
const Calendar = lazy(() => import("./pages/Calendar"));
const PatientPortal = lazy(() => import("./pages/PatientPortal"));
const Reports = lazy(() => import("./pages/Reports"));
const MetabolicCalculator = lazy(() => import("./pages/MetabolicCalculator"));

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <svg
      className="animate-spin h-8 w-8 text-sage-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </div>
);

const App: React.FC = () => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return null;

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        {!currentUser ? (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/paciente" element={<Login isPatient={true} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        ) : userRole === "patient" ? (
          <Routes>
            <Route path="/paciente" element={<PatientPortal />} />
            <Route path="*" element={<Navigate to="/paciente" />} />
          </Routes>
        ) : (
          <AppShell>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/patients/:id" element={<PatientProfile />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/diet-generator" element={<DietGenerator />} />
              <Route
                path="/metabolic-calculator"
                element={<MetabolicCalculator />}
              />
              <Route path="/food-database" element={<FoodDatabase />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/email-admin" element={<EmailAdmin />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </AppShell>
        )}
      </Suspense>
    </Router>
  );
};

export default App;
