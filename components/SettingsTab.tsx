
import React from 'react';
import { AppConfig, AppState } from '../types';

interface SettingsTabProps {
  config: AppConfig;
  onUpdateConfig: (c: AppConfig) => void;
  onResetData: () => void;
  allData: AppState;
  onImportData: (data: AppState) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ config, onUpdateConfig, onResetData, allData, onImportData }) => {
  const handleExport = () => {
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradermaster_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (confirm("Deseja importar os dados? Isso substituirá seus dados atuais.")) {
            onImportData(data);
          }
        } catch (err) {
          alert("Erro ao importar arquivo.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-2xl font-bold">Configurações do Sistema</h2>
        <p className="text-zinc-500 text-sm">Ajustes globais e manutenção de dados</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* General Settings */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h3 className="font-bold border-b border-zinc-800 pb-2 mb-4">Geral</h3>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Cotação USD/BRL</label>
              <input 
                type="number" step="0.01" 
                className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm" 
                value={config.usdToBrlRate} 
                onChange={e => onUpdateConfig({...config, usdToBrlRate: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Formato de Data</label>
              <select 
                className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm"
                value={config.dateFormat}
                onChange={e => onUpdateConfig({...config, dateFormat: e.target.value as any})}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h3 className="font-bold border-b border-zinc-800 pb-2 mb-4">Alertas Visuais</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-blue-600 focus:ring-0" 
                checked={config.notifications.goalReached}
                onChange={e => onUpdateConfig({...config, notifications: {...config.notifications, goalReached: e.target.checked}})}
              />
              <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">Alertar ao atingir meta semanal</span>
            </label>
            <div className="flex flex-col gap-1">
               <label className="text-[10px] font-bold text-zinc-500 uppercase">Sequência de perdas alerta</label>
               <input 
                type="number" 
                className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm" 
                value={config.notifications.lossStreak} 
                onChange={e => onUpdateConfig({...config, notifications: {...config.notifications, lossStreak: parseInt(e.target.value) || 0}})}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
        <h3 className="font-bold border-b border-zinc-800 pb-2 mb-4 text-red-500">Zona de Perigo</h3>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleExport}
            className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Exportar Backup
          </button>
          <label className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Importar Backup
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <button 
            onClick={onResetData}
            className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
          >
            Limpar Todos os Dados
          </button>
        </div>
        <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Informações do Sistema</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="flex flex-col">
              <span className="text-zinc-500">Versão</span>
              <span className="font-bold">2.0.1 (Local)</span>
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-500">Total Trades</span>
              <span className="font-bold">{allData.trades.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-500">Contas</span>
              <span className="font-bold">{allData.accounts.length}</span>
            </div>
             <div className="flex flex-col">
              <span className="text-zinc-500">Espaço</span>
              <span className="font-bold">~{(JSON.stringify(allData).length / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center text-zinc-600 text-xs py-8">
        <p>Forex Trade Master v2.0 &bull; Armazenamento Local Seguro</p>
      </footer>
    </div>
  );
};

export default SettingsTab;
