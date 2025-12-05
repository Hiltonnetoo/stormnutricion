import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, signInWithPopup, googleProvider } from '../services/firebaseService';
import { UtensilsIcon, EyeIcon, EyeOffIcon, GoogleIcon, ShieldIcon, CheckCircleIcon } from './icons';

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
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: displayName });
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
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
          case 'auth/email-already-in-use':
              return 'Este e-mail ja esta em uso por outra conta.';
          case 'auth/invalid-email':
              return 'O formato do e-mail e invalido.';
          case 'auth/weak-password':
              return 'A senha e muito fraca. A senha deve ter no minimo 6 caracteres.';
          case 'auth/unauthorized-domain':
              return 'Erro de Dominio: Este dominio nao esta autorizado no Firebase.';
          case 'auth/popup-closed-by-user':
              return 'O cadastro com Google foi cancelado.';
          default:
              return 'Ocorreu um erro ao criar a conta. Tente novamente.';
      }
  }

  const passwordStrength = () => {
    if (password.length === 0) return { width: '0%', color: 'bg-gray-200', text: '' };
    if (password.length < 6) return { width: '33%', color: 'bg-red-500', text: 'Fraca' };
    if (password.length < 10) return { width: '66%', color: 'bg-amber-500', text: 'Media' };
    return { width: '100%', color: 'bg-emerald-500', text: 'Forte' };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen flex bg-white">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-[480px] xl:w-[560px] bg-white z-10 relative">
        <button onClick={onBackToHomeClick} className="absolute top-8 left-8 text-sm text-slate-500 hover:text-sage-600 flex items-center gap-2 font-medium transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Voltar
        </button>

        <div className="mx-auto w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-sage-50 rounded-xl mb-6">
              <UtensilsIcon className="h-8 w-8 text-sage-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Crie sua conta</h2>
            <p className="mt-2 text-sm text-slate-500">Comece sua jornada de excelencia clinica.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-semibold text-slate-700 mb-1">
                Nome Completo
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all"
                placeholder="Dr(a). Maria Silva"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
                Email Profissional
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
                placeholder="seunome@clinica.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={passwordVisible ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all pr-12"
                  placeholder="Minimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {passwordVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: strength.width }}></div>
                    </div>
                    <span className={`text-xs font-medium ${strength.color.replace('bg-', 'text-')}`}>{strength.text}</span>
                  </div>
                </div>
              )}
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
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Criar Conta Gratuita'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">ou cadastre-se com</span>
              </div>
            </div>

            <div className="mt-4">
              <button 
                onClick={handleGoogleRegister} 
                disabled={loading} 
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <GoogleIcon className="w-5 h-5 mr-3" />
                <span>Google</span>
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircleIcon className="w-4 h-4 text-sage-500" />
              <span>Teste gratuito por 14 dias</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircleIcon className="w-4 h-4 text-sage-500" />
              <span>Sem necessidade de cartao de credito</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircleIcon className="w-4 h-4 text-sage-500" />
              <span>Dados protegidos com criptografia</span>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            Ja tem uma conta?{' '}
            <button onClick={onGoToLogin} className="font-bold text-sage-600 hover:text-sage-700 hover:underline">
              Faca o login
            </button>
          </p>
        </div>
      </div>

      <div className="hidden lg:block relative w-0 flex-1 bg-sage-50">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-teal-600 to-sage-800">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-sage-900/80 to-transparent"></div>
        </div>

        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl border border-white/20">
              <UtensilsIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Isanutri.pro</span>
          </div>

          <div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-md mb-8">
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src="https://ui-avatars.com/api/?name=Ana+Nutricionista&background=0D9488&color=fff&size=48" 
                  alt="Testimonial" 
                  className="w-12 h-12 rounded-full border-2 border-white/30"
                />
                <div>
                  <p className="font-semibold text-white">Dra. Ana Carolina</p>
                  <p className="text-sm text-sage-200">Nutricionista Clinica - SP</p>
                </div>
              </div>
              <p className="text-sage-100 text-sm leading-relaxed italic">
                "O Isanutri revolucionou minha pratica clinica. Economizo horas por semana na criacao de planos alimentares e meus pacientes adoram a experiencia."
              </p>
              <div className="flex gap-1 mt-4">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                ))}
              </div>
            </div>

            <div className="max-w-md">
              <h2 className="text-3xl font-bold mb-4 text-white">Junte-se a milhares de profissionais.</h2>
              <p className="text-sage-100 text-lg leading-relaxed">
                Crie sua conta e comece a transformar a saude dos seus pacientes com a plataforma mais completa do mercado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
