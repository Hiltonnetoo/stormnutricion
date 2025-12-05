import React from 'react';
import { LogInIcon, TargetIcon, UtensilsIcon, CheckCircleIcon, StarIcon, ShieldIcon, HeartIcon, AwardIcon, UsersIcon, BarChart3Icon, ZapIcon } from './icons';

const Navbar: React.FC<{ onLoginClick: () => void; onRegisterClick: () => void }> = ({ onLoginClick, onRegisterClick }) => (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-gray-100 bg-white/90 backdrop-blur-xl transition-all">
        <div className="max-w-7xl flex flex-wrap items-center justify-between mx-auto p-4 lg:px-8">
            <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse group">
                <div className="bg-gradient-to-tr from-sage-600 to-sage-400 p-2 rounded-xl shadow-lg shadow-sage-500/30 group-hover:scale-105 transition-transform duration-300">
                    <UtensilsIcon className="w-5 h-5 text-white" />
                </div>
                <span className="self-center text-xl font-bold whitespace-nowrap text-slate-900 tracking-tight">Isanutri<span className="text-sage-600">.pro</span></span>
            </a>
            <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse gap-4">
                <button onClick={onLoginClick} type="button" className="text-slate-600 hover:text-sage-600 font-semibold rounded-lg text-sm px-4 py-2 text-center transition-colors">Entrar</button>
                <button onClick={onRegisterClick} type="button" className="text-white bg-sage-600 hover:bg-sage-700 focus:ring-4 focus:outline-none focus:ring-sage-300 font-bold rounded-xl text-sm px-6 py-2.5 text-center shadow-lg shadow-sage-500/30 transition-all hover:-translate-y-0.5 hover:shadow-sage-500/40">Começar Grátis</button>
            </div>
        </div>
    </nav>
);

const Hero: React.FC<{ onRegisterClick: () => void }> = ({ onRegisterClick }) => (
    <section className="bg-white pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden relative">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
            {/* Ambient Background Lights */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-sage-50 rounded-full blur-[100px] opacity-60 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] opacity-60 pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                <div className="lg:w-1/2 z-10 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-sage-100 text-sage-700 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-sage-500"></span>
                        </span>
                        Nova Versão 5.0
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
                        O futuro da sua <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-600 to-teal-400">Prática Clínica</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                        Potencialize seus atendimentos com inteligência artificial, cálculos precisos e uma experiência que seus pacientes vão amar.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <button onClick={onRegisterClick} className="flex items-center justify-center gap-2 bg-sage-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-sage-500/20 hover:bg-sage-700 hover:shadow-2xl hover:shadow-sage-500/30 transition-all transform hover:-translate-y-1">
                            <ZapIcon className="w-5 h-5"/>
                            Experimentar Gratuitamente
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 font-bold py-4 px-8 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                            <UsersIcon className="w-5 h-5"/>
                            Ver Demonstração
                        </button>
                    </div>
                    <div className="mt-12 flex items-center justify-center lg:justify-start gap-5 text-sm font-medium text-slate-500">
                        <div className="flex -space-x-3">
                            {[1,2,3,4].map(i => (
                                <img key={i} className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" src={`https://ui-avatars.com/api/?name=User+${i}&background=random&color=fff`} alt="User" />
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shadow-sm">+2k</div>
                        </div>
                        <p>Nutricionistas confiam na Isanutri</p>
                    </div>
                </div>
                
                <div className="lg:w-1/2 relative w-full">
                    <div className="relative rounded-3xl bg-slate-900 p-2.5 shadow-2xl shadow-slate-900/20 transform rotate-2 hover:rotate-0 transition-all duration-700 ease-out">
                         <div className="rounded-2xl overflow-hidden bg-white border border-slate-800 relative">
                            {/* Browser Header */}
                            <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                </div>
                                <div className="bg-slate-800/50 px-4 py-1.5 rounded-lg text-xs font-medium text-slate-400 flex-1 text-center border border-slate-700/50">isanutri.app/dashboard</div>
                            </div>
                            
                            {/* Dashboard Mockup */}
                            <div className="p-6 bg-slate-50 grid grid-cols-2 gap-4">
                                <div className="col-span-2 flex items-center justify-between mb-2">
                                    <div>
                                        <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                                        <div className="h-3 w-48 bg-slate-100 rounded"></div>
                                    </div>
                                    <div className="h-10 w-10 bg-sage-500 rounded-full shadow-lg shadow-sage-500/30"></div>
                                </div>
                                
                                {/* Stat Cards */}
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 mb-3 text-blue-500 flex items-center justify-center"><UsersIcon className="w-4 h-4"/></div>
                                    <div className="h-6 w-12 bg-slate-800 rounded mb-1"></div>
                                    <div className="h-3 w-20 bg-slate-200 rounded"></div>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                    <div className="w-8 h-8 rounded-lg bg-sage-50 mb-3 text-sage-500 flex items-center justify-center"><UtensilsIcon className="w-4 h-4"/></div>
                                    <div className="h-6 w-12 bg-slate-800 rounded mb-1"></div>
                                    <div className="h-3 w-20 bg-slate-200 rounded"></div>
                                </div>

                                {/* Chart Area */}
                                <div className="col-span-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 h-40 flex flex-col justify-end gap-2 items-end">
                                    <div className="w-full flex justify-between items-end h-24 px-2 gap-2">
                                         {[40, 70, 50, 90, 60, 80, 95].map((h, i) => (
                                             <div key={i} className="w-full bg-sage-100 rounded-t-sm hover:bg-sage-200 transition-colors relative group">
                                                 <div style={{height: `${h}%`}} className="absolute bottom-0 w-full bg-sage-500 rounded-t-sm group-hover:bg-sage-600 transition-colors"></div>
                                             </div>
                                         ))}
                                    </div>
                                    <div className="w-full h-px bg-slate-100"></div>
                                </div>
                            </div>
                         </div>
                    </div>
                    {/* Floating Cards */}
                    <div className="absolute -left-4 lg:-left-12 top-24 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-white animate-bounce delay-100 max-w-[200px]">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-100 p-2.5 rounded-xl"><CheckCircleIcon className="w-5 h-5 text-emerald-600"/></div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Status</p>
                                <p className="text-sm font-bold text-slate-800">Dieta Gerada</p>
                            </div>
                        </div>
                    </div>
                     <div className="absolute -right-4 lg:-right-8 bottom-16 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-white animate-bounce delay-700 max-w-[200px]">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-100 p-2.5 rounded-xl"><StarIcon className="w-5 h-5 text-amber-600"/></div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Avaliação</p>
                                <p className="text-sm font-bold text-slate-800">5.0 Estrelas</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; delay?: string }> = ({ icon, title, description, delay }) => (
  <div className={`bg-white p-8 rounded-3xl border border-slate-100 shadow-soft hover:shadow-xl hover:border-sage-200 transition-all duration-300 group ${delay}`}>
    <div className="w-14 h-14 bg-sage-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-sage-600 group-hover:scale-110 transition-all duration-300 shadow-sm">
      <div className="text-sage-600 group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed font-medium">{description}</p>
  </div>
);

const Features: React.FC = () => (
    <section className="py-24 bg-slate-50/50">
        <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
                <h2 className="text-sm font-bold text-sage-600 uppercase tracking-widest mb-3">Recursos Poderosos</h2>
                <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Tudo que você precisa em um só lugar</h2>
                <p className="text-xl text-slate-500 font-medium">Otimizamos cada etapa do seu atendimento para que você foque no que realmente importa: a saúde do seu paciente.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={<UsersIcon className="w-7 h-7" />} 
                    title="Gestão de Pacientes" 
                    description="Histórico completo, anamnese personalizável e acompanhamento de evolução em uma interface intuitiva."
                />
                <FeatureCard 
                    icon={<ZapIcon className="w-7 h-7" />} 
                    title="IA Generativa" 
                    description="Crie planos alimentares complexos e personalizados em segundos com nossa inteligência artificial avançada."
                />
                <FeatureCard 
                    icon={<BarChart3Icon className="w-7 h-7" />} 
                    title="Cálculos Metabólicos" 
                    description="Harris-Benedict, Mifflin-St Jeor e muito mais. Cálculos automáticos de TMB, GET e macros precisos."
                />
                <FeatureCard 
                    icon={<ShieldIcon className="w-7 h-7" />} 
                    title="Segurança de Dados" 
                    description="Criptografia de ponta a ponta e conformidade total com a LGPD para proteger sua clínica."
                />
                <FeatureCard 
                    icon={<TargetIcon className="w-7 h-7" />} 
                    title="Foco em Resultados" 
                    description="Dashboards visuais que mostram a adesão e o progresso do paciente de forma clara e motivadora."
                />
                <FeatureCard 
                    icon={<AwardIcon className="w-7 h-7" />} 
                    title="Suporte Premium" 
                    description="Equipe dedicada para garantir que você extraia o máximo da plataforma todos os dias."
                />
            </div>
        </div>
    </section>
);

const Footer: React.FC = () => (
    <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
        <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center space-x-3 mb-6">
                         <div className="bg-sage-600 p-2 rounded-xl">
                            <UtensilsIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">Isanutri.v5</span>
                    </div>
                    <p className="text-slate-400 max-w-sm leading-relaxed mb-6">
                        A plataforma definitiva para nutricionistas que buscam excelência, produtividade e resultados reais.
                    </p>
                    <div className="flex gap-4">
                        {/* Social Placeholders */}
                        <div className="w-10 h-10 rounded-full bg-slate-800 hover:bg-sage-600 transition-colors cursor-pointer flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-800 hover:bg-sage-600 transition-colors cursor-pointer flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.072 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-6 text-lg">Produto</h4>
                    <ul className="space-y-3 text-sm font-medium">
                        <li><a href="#" className="hover:text-sage-400 transition-colors">Funcionalidades</a></li>
                        <li><a href="#" className="hover:text-sage-400 transition-colors">Planos e Preços</a></li>
                        <li><a href="#" className="hover:text-sage-400 transition-colors">Casos de Sucesso</a></li>
                        <li><a href="#" className="hover:text-sage-400 transition-colors">Novidades</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-6 text-lg">Legal</h4>
                    <ul className="space-y-3 text-sm font-medium">
                        <li><a href="#" className="hover:text-sage-400 transition-colors">Política de Privacidade</a></li>
                        <li><a href="#" className="hover:text-sage-400 transition-colors">Termos de Uso</a></li>
                        <li><a href="#" className="hover:text-sage-400 transition-colors">Fale Conosco</a></li>
                    </ul>
                </div>
            </div>
            <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-500 font-medium">
                &copy; {new Date().getFullYear()} Isanutri Tecnologia em Saúde. Feito com ❤️ para nutricionistas.
            </div>
        </div>
    </footer>
);

const Home: React.FC<{ onLoginClick: () => void; onRegisterClick: () => void }> = ({ onLoginClick, onRegisterClick }) => {
  return (
    <div className="font-sans antialiased text-slate-800 bg-white">
      <Navbar onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />
      <Hero onRegisterClick={onRegisterClick} />
      <Features />
      <section className="py-24 bg-gradient-to-br from-sage-600 to-teal-800 text-white text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">Pronto para elevar seu atendimento?</h2>
              <p className="text-sage-100 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">Junte-se a comunidade que está redefinindo o padrão da nutrição clínica no Brasil.</p>
              <button onClick={onRegisterClick} className="bg-white text-sage-700 font-bold py-4 px-12 rounded-2xl shadow-2xl hover:bg-sage-50 transition-all transform hover:scale-105">
                  Começar Agora Gratuitamente
              </button>
          </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;