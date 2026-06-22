import React from 'react';

export default function Diretor() {
  return (
    <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginTop: 0, color: '#1f2937' }}>Painel da Escola (Diretor)</h2>
      <p style={{ color: '#4b5563' }}>Bem-vindo! Aqui você poderá lançar e acompanhar as licitações.</p>
      
      <div style={{ border: '1px dashed #d1d5db', borderRadius: '8px', padding: '1.5rem', marginTop: '2rem' }}>
        <h3 style={{ marginTop: 0, color: '#374151' }}>Próximos Componentes a Implementar:</h3>
        <ul style={{ color: '#4b5563', paddingLeft: '1.5rem' }}>
          <li>Registrar Nova Verba Recebida</li>
          <li>Lançar Cotações de Fornecedores</li>
          <li>Registrar Compra Aprovada</li>
          <li>Anexar Nota Fiscal em PDF</li>
        </ul>
      </div>
    </div>
  );
}