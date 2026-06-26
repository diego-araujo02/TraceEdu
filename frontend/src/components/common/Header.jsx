import { Link, NavLink } from "react-router-dom";
import ConnectWallet from "./ConnectWallet";
import { useRole } from "../../hooks/useRole";

const linkBase =
  "font-semibold text-sm transition-colors px-1 py-1 border-b-2 border-transparent";

function navClass({ isActive }, color) {
  return `${linkBase} ${
    isActive ? `${color} border-current` : "text-slate-500 hover:text-slate-800"
  }`;
}

export default function Header() {
  const { isOwner } = useRole();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex flex-col leading-tight">
          <span className="text-xl font-extrabold text-slate-900">
            Trace<span className="text-blue-600">Edu</span>
          </span>
          <span className="text-xs text-slate-400">Transparência Escolar On-chain</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" end className={(s) => navClass(s, "text-slate-800")}>
            Início
          </NavLink>
          <NavLink to="/diretor" className={(s) => navClass(s, "text-blue-600")}>
            Área do Diretor
          </NavLink>
          <NavLink to="/auditoria" className={(s) => navClass(s, "text-emerald-600")}>
            Auditoria
          </NavLink>
          {isOwner && (
            <NavLink to="/admin" className={(s) => navClass(s, "text-indigo-600")}>
              Admin
            </NavLink>
          )}
        </nav>
      </div>

      <ConnectWallet />
    </header>
  );
}
