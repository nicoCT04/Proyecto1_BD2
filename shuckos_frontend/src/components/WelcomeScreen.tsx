import React from 'react';
import { Store, ArrowRight, Activity, Database, CheckCircle2 } from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl text-emerald-500"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        
        {/* Logo and Icon */}
        <div className="mb-10 flex flex-col items-center animate-fade-in-up">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-6 transform transition-transform hover:scale-105">
            <Store size={48} className="text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight text-center mb-4">
            Shukos <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">MVP</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl text-center leading-relaxed">
            Plataforma analítica y de gestión unificada para el control total de operaciones, menú, pedidos y reseñas de restaurantes.
          </p>
        </div>

        {/* Features/Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mb-12">
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800 transition-colors group">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Database size={24} />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Sincronización Total</h3>
            <p className="text-slate-400 text-sm">Integración completa con bases de datos MongoDB y analíticas en tiempo real.</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800 transition-colors group">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Métricas en Vivo</h3>
            <p className="text-slate-400 text-sm">Visualización avanzada a través de MongoDB Atlas Charts integrados en la plataforma.</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800 transition-colors group">
            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Control Global</h3>
            <p className="text-slate-400 text-sm">Gestiona usuarios, inspecciones, visitas y la rúbrica con un solo clic.</p>
          </div>

        </div>

        {/* Action Button */}
        <button 
          onClick={onGetStarted}
          className="group relative inline-flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/20 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
        >
          <span>Entrar a la Plataforma</span>
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>

      </div>
      
      {/* Footer */}
      <div className="p-6 text-center z-10 relative">
        <p className="text-slate-500 text-sm">
          Proyecto 1 • Bases de Datos 2 • {new Date().getFullYear()}
        </p>
      </div>

    </div>
  );
}
