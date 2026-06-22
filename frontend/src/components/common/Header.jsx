import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header style={{ padding: '1rem 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>TraceEdu</h1>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Transparência Escolar On-chain</p>
      </div>
      <nav style={{ display: 'flex', gap: '1.5rem' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#374151', fontWeight: 'bold' }}>Home</Link>
        <Link to="/diretor" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: 'bold' }}>Área do Diretor</Link>
        <Link to="/auditoria" style={{ textDecoration: 'none', color: '#059669', fontWeight: 'bold' }}>Auditoria</Link>
      </nav>
    </header>
  );
}