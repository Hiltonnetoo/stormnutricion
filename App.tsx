import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Public Pages
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';

// App Pages
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import DietGenerator from './components/DietGenerator';
import FoodDatabase from './components/FoodDatabase';
import EmailAdmin from './components/EmailAdmin';
import Settings from './components/Settings';
import Breadcrumbs from './components/Breadcrumbs';

const App: React.FC = () => {
    const { currentUser } = useAuth();
    const [view, setView] = useState<'home' | 'login' | 'register'>('home');

    if (!currentUser) {
        switch (view) {
            case 'login':
                return <Login onBackToHomeClick={() => setView('home')} onGoToRegister={() => setView('register')} />;
            case 'register':
                return <Register onBackToHomeClick={() => setView('home')} onGoToLogin={() => setView('login')} />;
            default:
                return <Home onLoginClick={() => setView('login')} onRegisterClick={() => setView('register')} />;
        }
    }

    return (
        <Router>
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                <Sidebar />
                <main className="flex-1 flex flex-col overflow-y-auto">
                    <Breadcrumbs />
                    <div className="flex-grow">
                        <Routes>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/patients" element={<Patients />} />
                            <Route path="/diet-generator" element={<DietGenerator />} />
                            <Route path="/food-database" element={<FoodDatabase />} />
                            <Route path="/email-admin" element={<EmailAdmin />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="*" element={<Navigate to="/dashboard" />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </Router>
    );
};

export default App;