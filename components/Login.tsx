import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, googleProvider, auth } from '../services/firebaseService';
import { UtensilsIcon, GoogleIcon, ShieldIcon } from './icons';

interface LoginProps {
    onBackToHomeClick: () => void;
    onGoToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onBackToHomeClick, onGoToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
       setError(getFriendlyErrorMessage(err.code));
    } finally {
        setLoading(false);
    }
  };

  const getFriendlyErrorMessage = (errorCode: string) => {
      switch (errorCode) {
          case 'auth/invalid-email':
              return 'O formato do e-mail é inválido.';
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
              return 'E-mail ou senha incorretos. Verifique suas credenciais.';
          case 'auth/user-disabled':
              return 'Esta conta de usuário foi desabilitada.';
          case 'auth/unauthorized-domain':
              return 'Erro de Domínio: Este domínio não está autorizado no Firebase. Adicione este domínio em Authentication > Settings > Authorized Domains no console.';
          case 'auth/popup-closed-by-user':
              return 'O login com Google foi cancelado.';
          default:
              console.error('Firebase Login Error:', errorCode); 
              return `Erro no login (${errorCode}). Tente novamente.`;
      }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-[480px] xl:w-[560px] bg-white z-10 relative">
         <button onClick={onBackToHomeClick} className="absolute top-8 left-8 text-sm text-slate-500 hover:text-sage-600 flex items-center gap-2 font-medium transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Voltar
        </button>

        <div className="mx-auto w-full max-w-sm">
          <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center p-3 bg-sage-50 rounded-xl mb-6">
                  <UtensilsIcon className="h-8 w-8 text-sage-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bem-vindo de volta</h2>
              <p className="mt-2 text-sm text-slate-500">Acesse sua plataforma clínica.</p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all"
                placeholder="seunome@exemplo.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password"className="block text-sm font-semibold text-slate-700">
                    Senha
                </label>
                <a href="#" className="text-xs text-sage-600 hover:text-sage-700 font-medium">Esqueceu?</a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-3">
                    <ShieldIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-sage-600 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500 disabled:opacity-70 disabled:cursor-wait transition-all shadow-lg shadow-sage-600/20"
            >
              {loading ? <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Entrar'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">ou continue com</span>
              </div>
            </div>

            <div className="mt-6">
              <button onClick={handleGoogleLogin} disabled={loading} className="w-full inline-flex justify-center items-center py-3 px-4 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all">
                  <GoogleIcon className="w-5 h-5 mr-3" />
                  <span>Google</span>
              </button>
            </div>
          </div>
          
           <p className="mt-8 text-center text-sm text-slate-600">
            Não tem uma conta?{' '}
            <button onClick={onGoToRegister} className="font-bold text-sage-600 hover:text-sage-700 hover:underline">
              Cadastre-se grátis
            </button>
          </p>
        </div>
      </div>

      {/* Right Side - Image/Visual */}
      <div className="hidden lg:block relative w-0 flex-1 bg-sage-50">
         <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-sage-600 to-teal-800">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-sage-900/80 to-transparent"></div>
         </div>
         <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
            <div className="max-w-md">
                <h2 className="text-3xl font-bold mb-4">Nutrição Inteligente e Eficiente.</h2>
                <p className="text-sage-100 text-lg leading-relaxed">
                    Junte-se a milhares de profissionais que estão transformando a saúde de seus pacientes com a plataforma mais completa do mercado.
                </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Login;