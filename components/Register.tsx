import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../services/firebaseService';
import { UtensilsIcon, EyeIcon, EyeOffIcon } from './icons';

interface RegisterProps {
    onGoToLogin: () => void;
    onBackToHomeClick: () => void;
}

const Register: React.FC<RegisterProps> = ({ onGoToLogin, onBackToHomeClick }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.");
        return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // After creating the user, update their profile with the display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: displayName });
      }
      // No need to redirect, onAuthStateChanged in AuthContext will handle it
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const getFriendlyErrorMessage = (errorCode: string) => {
      switch (errorCode) {
          case 'auth/email-already-in-use':
              return 'Este e-mail já está em uso por outra conta.';
          case 'auth/invalid-email':
              return 'O formato do e-mail é inválido.';
          case 'auth/weak-password':
              return 'A senha é muito fraca. A senha deve ter no mínimo 6 caracteres.';
          default:
              return 'Ocorreu um erro ao criar a conta. Tente novamente.';
      }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
      <button onClick={onBackToHomeClick} className="absolute top-4 left-4 text-sm text-sage-600 hover:underline flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m15 18-6-6 6-6"/></svg>
          Voltar para Home
      </button>
      <div className="max-w-md w-full mx-auto">
        <div className="flex justify-center mb-6">
            <div className="flex items-center">
                <div className="bg-sage-500 p-3 rounded-xl">
                    <UtensilsIcon className="h-8 w-8 text-white" />
                </div>
                <h1 className="ml-4 text-3xl font-bold text-gray-800 dark:text-white">Isanutri v5</h1>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <h2 className="text-2xl font-semibold text-center text-gray-700 dark:text-gray-200 mb-6">Crie sua conta</h2>

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome Completo
              </label>
              <div className="mt-1">
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  autoComplete="name"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sage-500 focus:border-sage-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sage-500 focus:border-sage-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Senha (mínimo 6 caracteres)
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={passwordVisible ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sage-500 focus:border-sage-500 dark:bg-gray-700 dark:text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                >
                  {passwordVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            {error && (
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sage-500 hover:bg-sage-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500 disabled:bg-sage-300 transition-colors"
              >
                {loading ? 'Criando conta...' : 'Cadastrar'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Já tem uma conta?{' '}
            <button onClick={onGoToLogin} className="font-medium text-sage-600 hover:text-sage-500">
              Faça o login
            </button>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;