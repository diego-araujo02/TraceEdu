import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/common/Header";

// Importação das Páginas (vamos criá-las a seguir)
import Home from "./pages/Home";
import Diretor from "./pages/Diretor";
import Auditoria from "./pages/Auditoria";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        {/* Cabeçalho Global (inclui o ConnectWallet.jsx futuramente) */}
        <Header />

        {/* Área principal onde as páginas serão renderizadas */}
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* O asterisco permite sub-rotas dentro dos perfis, se necessário */}
            <Route path="/diretor/*" element={<Diretor />} />
            <Route path="/auditoria/*" element={<Auditoria />} />
          </Routes>
        </main>

        {/* Rodapé Global */}
        <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500">
            <p>TraceEdu &copy; {new Date().getFullYear()} — Transparência em Verbas Escolares via Blockchain.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}