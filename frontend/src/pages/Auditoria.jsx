import React from 'react';

export default function Auditoria() {
  return (
    <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginTop: 0, color: '#1f2937' }}>Painel de Controle (Auditor)</h2>
      <p style={{ color: '#4b5563' }}>Área restrita para verificação de conformidade e gastos em tempo real.</p>
      
      <div style={{ border: '1px dashed #d1d5db', borderRadius: '8px', padding: '1.5rem', marginTop: '2rem' }}>
        <h3 style={{ marginTop: 0, color: '#374151' }}>Próximos Componentes a Implementar:</h3>
        <ul style={{ color: '#4b5563', paddingLeft: '1.5rem' }}>
          <li>Histórico Geral de Verbas</li>
          <li>Verificação de Hashes on-chain (Anti-fraude)</li>
          <li>Download de Notas Fiscais (Via Supabase)</li>
        </ul>
      </div>
    </div>
  );
}