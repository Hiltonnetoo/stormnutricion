import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPatients, getDietPlansForPatient } from '../services/firebaseService';
import { CheckCircleIcon, XCircleIcon, PaperAirplaneIcon } from './icons';
import type { Patient, DietPlan, EmailLog, AnyDietPlan } from '../types';

// Mock data for initial email logs
const initialLogs: EmailLog[] = [
  { id: '1', patientName: 'Ana Silva', patientEmail: 'ana.silva@example.com', dietDate: '2023-10-26', sentAt: new Date(Date.now() - 86400000).toISOString(), status: 'Sent' },
  { id: '2', patientName: 'Carlos Souza', patientEmail: 'carlos.souza@example.com', dietDate: '2023-10-25', sentAt: new Date(Date.now() - 172800000).toISOString(), status: 'Sent' },
  { id: '3', patientName: 'Beatriz Costa', patientEmail: 'beatriz.costa@example.com', dietDate: '2023-10-24', sentAt: new Date(Date.now() - 259200000).toISOString(), status: 'Failed' },
];

const EmailAdmin = () => {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [dietPlans, setDietPlans] = useState<AnyDietPlan[]>([]);
  const [selectedDietId, setSelectedDietId] = useState<string>('');
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(initialLogs);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = getPatients(
          currentUser.uid, 
          setPatients,
          (error) => console.error("EmailAdmin: Error fetching patients", error)
      );
      return () => unsubscribe();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && selectedPatientId) {
      const unsubscribe = getDietPlansForPatient(
          currentUser.uid, 
          selectedPatientId, 
          setDietPlans,
          (error) => console.error("EmailAdmin: Error fetching diets", error)
      );
      setSelectedDietId(''); // Reset diet selection when patient changes
      return () => unsubscribe();
    } else {
      setDietPlans([]);
    }
  }, [currentUser, selectedPatientId]);

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDietId) {
        alert("Por favor, selecione um paciente e um plano de dieta.");
        return;
    }

    setIsSending(true);
    setSendStatus(null);
    
    // Simulate API call to email service
    setTimeout(() => {
        const patient = patients.find(p => p.id === selectedPatientId);
        const diet = dietPlans.find(d => d.id === selectedDietId);
        if(!patient || !diet) {
             setSendStatus('error');
             setIsSending(false);
             return;
        }

        const success = Math.random() > 0.2; // 80% success rate for simulation
        const newLog: EmailLog = {
            id: String(Date.now()),
            patientName: `${patient.firstName} ${patient.lastName}`,
            patientEmail: patient.email,
            dietDate: new Date(diet.createdAt).toLocaleDateString('pt-BR'),
            sentAt: new Date().toISOString(),
            status: success ? 'Sent' : 'Failed',
        };

        setEmailLogs(prevLogs => [newLog, ...prevLogs]);
        setSendStatus(success ? 'success' : 'error');
        setIsSending(false);
        
        // Reset form after a successful send
        if(success) {
            setSelectedPatientId('');
            setSelectedDietId('');
        }
    }, 1500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Administração de Emails</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Email Sender */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm self-start">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Enviar Dieta por Email</h2>
            <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label htmlFor="patient" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Paciente</label>
                  <select id="patient" value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-sage-500 focus:border-sage-500 sm:text-sm rounded-md" required>
                    <option value="" disabled>-- Selecione um paciente --</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{`${p.firstName} ${p.lastName}`}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="diet-plan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plano Alimentar</label>
                  <select id="diet-plan" value={selectedDietId} onChange={e => setSelectedDietId(e.target.value)} disabled={!selectedPatientId || dietPlans.length === 0} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-sage-500 focus:border-sage-500 sm:text-sm rounded-md disabled:bg-gray-100 dark:disabled:bg-gray-700/50" required>
                    <option value="" disabled>-- Selecione um plano --</option>
                    {dietPlans.map(d => <option key={d.id} value={d.id}>{`Plano de ${new Date(d.createdAt).toLocaleDateString('pt-BR')}`}</option>)}
                  </select>
                  {selectedPatientId && dietPlans.length === 0 && <p className="text-xs text-gray-500 mt-1">Este paciente não possui dietas salvas.</p>}
                </div>
                <button type="submit" disabled={isSending || !selectedDietId} className="w-full bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center">
                    {isSending ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8
 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Enviando...
                        </>
                    ) : (
                        <>
                            <PaperAirplaneIcon className="w-5 h-5 mr-2"/>
                            Enviar Email
                        </>
                    )}
                </button>
                {sendStatus === 'success' && <p className="text-sm text-green-600 dark:text-green-400">Email enviado com sucesso!</p>}
                {sendStatus === 'error' && <p className="text-sm text-red-600 dark:text-red-400">Falha ao enviar email. Tente novamente.</p>}
            </form>
        </div>
        {/* Email Logs */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white p-6 border-b border-gray-200 dark:border-gray-700">Histórico de Envios</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Paciente</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dieta</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                       {emailLogs.map(log => (
                           <tr key={log.id}>
                               <td className="px-6 py-4 whitespace-nowrap">
                                   <div className="text-sm font-medium text-gray-900 dark:text-white">{log.patientName}</div>
                                   <div className="text-sm text-gray-500 dark:text-gray-400">{log.patientEmail}</div>
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                   Plano de {log.dietDate}
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap">
                                   <div className="flex items-center">
                                       {log.status === 'Sent' ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <XCircleIcon className="w-5 h-5 text-red-500" />}
                                       <span className="ml-2 text-sm text-gray-800 dark:text-gray-200">{log.status === 'Sent' ? 'Enviado' : 'Falhou'}</span>
                                   </div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                      {new Date(log.sentAt).toLocaleString('pt-BR')}
                                    </div>
                               </td>
                           </tr>
                       ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EmailAdmin;