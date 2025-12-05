import React, { useState } from 'react';
import type { DietPlan } from '../../types';
import { generateCustomLayoutPdf, generateScreenshotPdf } from '../../utils/pdfExporter';
import { CloseIcon, DocumentTextIcon, DownloadIcon } from '../icons';

interface ExportDietModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: DietPlan;
  targetElementId: string;
}

const ExportDietModal: React.FC<ExportDietModalProps> = ({ isOpen, onClose, plan, targetElementId }) => {
  const [exportingType, setExportingType] = useState<'custom' | 'screenshot' | null>(null);

  const handleExport = async (type: 'custom' | 'screenshot') => {
    setExportingType(type);
    try {
      if (type === 'custom') {
        await generateCustomLayoutPdf(plan);
      } else {
        const element = document.getElementById(targetElementId);
        if (element) {
          document.body.classList.add('preparing-for-export');
          await generateScreenshotPdf(element, plan);
        } else {
          throw new Error('Elemento alvo para captura não encontrado.');
        }
      }
    } catch (error) {
      console.error('Falha na exportação do PDF:', error);
      alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
    } finally {
      document.body.classList.remove('preparing-for-export');
      setExportingType(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const isLoading = exportingType !== null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Exportar Plano Alimentar</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Escolha o formato de PDF que deseja exportar para o plano de <strong>{plan.patientName}</strong>.
          </p>
          <button
            onClick={() => handleExport('custom')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 text-left p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <DocumentTextIcon className="w-8 h-8 text-sage-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800 dark:text-white">Layout Padrão (PDF Otimizado)</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ideal para impressão. Gera um PDF limpo e bem formatado.</p>
            </div>
             {exportingType === 'custom' && <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
          </button>
          <button
            onClick={() => handleExport('screenshot')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 text-left p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <DownloadIcon className="w-8 h-8 text-accent flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800 dark:text-white">Captura da Tela (PDF Visual)</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Exporta o plano exatamente como você o vê na tela.</p>
            </div>
             {exportingType === 'screenshot' && <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDietModal;