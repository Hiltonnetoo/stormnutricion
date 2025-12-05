import React, { useState, useCallback, useEffect } from 'react';
import { addPatient, updatePatient } from '../../services/firebaseService';
import { useAuth } from '../../contexts/AuthContext';
import type { Patient } from '../../types';
import usePersistentState from '../../hooks/usePersistentState';
import { loadState } from '../../utils/localStorage';
import { CloseIcon } from '../icons';

import ProgressBar from '../patient-form/ProgressBar';
import Step1Personal from '../patient-form/Step1Personal';
import Step2Contact from '../patient-form/Step2Contact';
import Step3Professional from '../patient-form/Step3Professional';
import Step4Nutritional from '../patient-form/Step4Nutritional';
import Step5Anthropometric from '../patient-form/Step5Anthropometric';
import Step6Summary from '../patient-form/Step6Summary';


interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
  showToast: (toast: { title: string, message: string, type: 'success' | 'error' }) => void;
}

const TOTAL_STEPS = 6;
const FORM_STATE_KEY = 'newPatientFormState';

const initialFormData = {
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'female' as Patient['gender'],
    email: '',
    phone: '',
    address: { cep: '', street: '', number: '', neighborhood: '', city: '', state: '' },
    profession: '',
    activityLevel: 'moderately_active' as Patient['activityLevel'],
    mealsPerDay: 4,
    hydrationLevel: 'moderate' as Patient['hydrationLevel'],
    dietaryRestrictions: [],
    foodAllergies: '',
    weight: 0,
    height: 0,
    termsAccepted: false,
};


const NewPatientModal: React.FC<NewPatientModalProps> = ({ isOpen, onClose, patient, showToast }) => {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData, clearFormData] = usePersistentState<Omit<Patient, 'id' | 'createdAt' | 'avatarUrl' | 'status'>>(FORM_STATE_KEY, initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!patient;

  useEffect(() => {
    if (isOpen) {
        if (isEditMode && patient) {
            const { id, createdAt, avatarUrl, status, ...formDataFromPatient } = patient;
            setFormData(formDataFromPatient);
        } else if (!isEditMode && loadState(FORM_STATE_KEY)) {
            // Data is already loaded by the hook
        } else {
             setFormData(initialFormData);
        }
        setCurrentStep(1);
        setErrors({});
    }
  }, [isOpen, patient, isEditMode]);


  const handleDataChange = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };
  
  const validateStep = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
        if (formData.firstName.length < 2) newErrors.firstName = 'Nome deve ter no mínimo 2 caracteres.';
        if (formData.lastName.length < 2) newErrors.lastName = 'Sobrenome deve ter no mínimo 2 caracteres.';
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.dob)) {
            newErrors.dob = 'Data deve estar no formato DD/MM/AAAA.';
        } else {
            const [day, month, year] = formData.dob.split('/').map(Number);
            const birthDate = new Date(year, month - 1, day);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
            if (age < 1) newErrors.dob = 'Paciente deve ter no mínimo 1 ano.';
        }
    } else if (currentStep === 2) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email inválido.';
        if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(formData.phone)) newErrors.phone = 'Telefone inválido. Formato: (XX) XXXXX-XXXX';
        if (formData.address.cep && !/^\d{5}-\d{3}$/.test(formData.address.cep)) newErrors.cep = 'CEP inválido. Formato: XXXXX-XXX';
    } else if (currentStep === 3) {
        if (!formData.profession) newErrors.profession = 'Profissão é obrigatória.';
    } else if (currentStep === 5) {
        if (formData.weight < 20 || formData.weight > 300) newErrors.weight = 'Peso deve ser entre 20kg e 300kg.';
        // formData.height is in cm. Range 0.1m to 3.0m is 10cm to 300cm.
        if (formData.height < 10 || formData.height > 300) newErrors.height = 'Altura inválida. Use um valor entre 0,10m e 3,00m.';
        if (!formData.termsAccepted) newErrors.termsAccepted = 'Você deve aceitar os termos.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData]);


  const nextStep = () => {
    if (validateStep()) {
        setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const goToStep = (step: number) => {
      if (isEditMode) {
          setCurrentStep(step);
          return;
      }
      if (step < currentStep) {
          setCurrentStep(step);
      } else if (validateStep()) {
          setCurrentStep(step);
      }
  }

  const handleForceClose = () => {
      if(!isEditMode) {
        clearFormData();
      }
      onClose();
  }

  const handleSubmit = async () => {
      if (!currentUser) return;
      setIsSubmitting(true);
      try {
        if (isEditMode && patient?.id) {
            const dietRelatedFields: (keyof Patient)[] = ['weight', 'height', 'activityLevel', 'mealsPerDay', 'dietaryRestrictions', 'foodAllergies'];
            
            const hasRelevantChanges = dietRelatedFields.some(field => {
                const originalValue = patient[field];
                const newValue = formData[field as keyof typeof formData];
                return JSON.stringify(originalValue) !== JSON.stringify(newValue);
            });

            await updatePatient(currentUser.uid, patient.id, formData);
            
            onClose(); // Close modal first
            
            // Then show the toast on the main page
            if (hasRelevantChanges) {
                showToast({
                    title: 'Aviso Importante!',
                    message: 'Dados críticos (peso, altura, etc.) foram alterados. É essencial revisar o plano alimentar do paciente.',
                    type: 'error'
                });
            } else {
                 showToast({
                    title: 'Sucesso!',
                    message: 'Paciente atualizado com sucesso!',
                    type: 'success'
                });
            }

        } else {
            const fullPatientData: Omit<Patient, 'id'> = {
                ...formData,
                status: 'Active',
                createdAt: new Date().toISOString(),
                avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.firstName + ' ' + formData.lastName)}&background=8FBC8F&color=fff`,
            };
            await addPatient(currentUser.uid, fullPatientData);
            onClose(); // Close modal
            showToast({ 
                title: 'Sucesso!',
                message: 'Paciente cadastrado com sucesso!',
                type: 'success'
            });
        }
        clearFormData();
      } catch (error: any) {
          console.error("Failed to save patient:", error);
          let errorMessage = 'Ocorreu um erro ao salvar o paciente. Tente novamente.';
          
          if (error.code === 'permission-denied') {
              errorMessage = 'Permissão negada. Verifique se você tem permissão para gravar neste banco de dados.';
          }

          showToast({
            title: 'Erro!',
            message: errorMessage,
            type: 'error'
          });
          // Do NOT close the modal on error so user can retry or save data
      } finally {
          setIsSubmitting(false);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[95vh]" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{isEditMode ? 'Editar Paciente' : 'Cadastrar Novo Paciente'}</h2>
          <button onClick={handleForceClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 flex-shrink-0">
            <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} goToStep={goToStep} isEditMode={isEditMode} />
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
            {currentStep === 1 && <Step1Personal data={formData} onDataChange={handleDataChange} errors={errors} />}
            {currentStep === 2 && <Step2Contact data={formData} onDataChange={handleDataChange} errors={errors} />}
            {currentStep === 3 && <Step3Professional data={formData} onDataChange={handleDataChange} errors={errors} />}
            {currentStep === 4 && <Step4Nutritional data={formData} onDataChange={handleDataChange} errors={errors} />}
            {currentStep === 5 && <Step5Anthropometric data={formData} onDataChange={handleDataChange} errors={errors} />}
            {currentStep === 6 && <Step6Summary data={formData} goToStep={goToStep} />}
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <button 
            onClick={prevStep} 
            disabled={currentStep === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          {currentStep < TOTAL_STEPS ? (
             <button 
                onClick={nextStep} 
                className="px-4 py-2 text-sm font-medium text-white bg-sage-500 border border-transparent rounded-md shadow-sm hover:bg-sage-600"
             >
                Próximo
            </button>
          ) : (
            <button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-accent border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
            >
                {isSubmitting ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Finalizar Cadastro')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewPatientModal;