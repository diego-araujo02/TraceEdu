import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 animate-fade-in pb-20">
      
      {/* ── Seção Hero (Gradiente Escuro Web3) ── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white py-24 px-6 mb-16 shadow-2xl rounded-b-[3rem] overflow-hidden">
        {/* Efeito de brilho no fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-200 border border-blue-400/30 px-5 py-2 rounded-full text-sm font-semibold tracking-widest uppercase mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Sistemas Web 3.0
          </span>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tight">
            Transparência Matemática na <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-emerald-300">
              Educação Pública
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-blue-100/80 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            O TraceEdu transforma a prestação de contas de merenda e infraestrutura em um registro lacrado por criptografia. 
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link 
              to="/diretor" 
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-400 hover:to-blue-500 transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-105"
            >
              Acessar Painel da Escola
            </Link>
            <Link 
              to="/auditoria" 
              className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-md"
            >
              Portal de Auditoria
            </Link>
          </div>
        </div>
      </section>

      {/* ── Seção de Funcionalidades (Cards Flutuantes) ── */}
      <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 -mt-24 relative z-10">
        
        {/* Card 1 */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center text-emerald-600 text-2xl mb-6 shadow-sm border border-emerald-100/50">
            🔒
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">Imutabilidade</h3>
          <p className="text-slate-500 leading-relaxed text-lg">
            Depois que uma licitação ou nota fiscal é registrada na blockchain, ela não pode ser apagada ou editada. O passado fica gravado em pedra.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 text-2xl mb-6 shadow-sm border border-blue-100/50">
            🛡️
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">Prevenção de Desvios</h3>
          <p className="text-slate-500 leading-relaxed text-lg">
            O <i className="italic text-slate-700">Smart Contract</i> possui regras rígidas. É matematicamente impossível aprovar uma compra sem o registro prévio de 3 cotações.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center text-indigo-600 text-2xl mb-6 shadow-sm border border-indigo-100/50">
            ⚡
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">Auditoria em Segundos</h3>
          <p className="text-slate-500 leading-relaxed text-lg">
            Diga adeus aos processos morosos. Tribunais de contas podem auditar o repasse desde o governo até a escola com um único clique.
          </p>
        </div>

      </section>

    </div>
  );
}