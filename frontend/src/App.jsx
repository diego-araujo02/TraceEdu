import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import Header from "./components/common/Header";

// Páginas
import Home from "./pages/Home";
import Diretor from "./pages/Diretor";
import Auditoria from "./pages/Auditoria";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Header />

          {/* Área principal onde as páginas serão renderizadas */}
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/diretor/*" element={<Diretor />} />
              <Route path="/auditoria/*" element={<Auditoria />} />
              <Route path="/admin/*" element={<Admin />} />
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
    </WalletProvider>
  );
}