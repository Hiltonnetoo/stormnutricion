import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, uploadProfilePicture, auth } from '../services/firebaseService';

const Settings = () => {
  const { currentUser } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(currentUser?.photoURL || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Usuário não autenticado.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updates: { displayName?: string; photoURL?: string } = {};

      // Adiciona o nome para atualização apenas se ele mudou
      if (displayName !== currentUser.displayName) {
        updates.displayName = displayName;
      }

      // Se um novo arquivo foi selecionado, faz o upload e adiciona a nova URL para atualização
      if (photoFile) {
        const newPhotoURL = await uploadProfilePicture(currentUser.uid, photoFile);
        updates.photoURL = newPhotoURL;
      }

      // Executa a atualização no Firebase apenas se houver algo para atualizar
      if (Object.keys(updates).length > 0) {
        await updateProfile(currentUser, updates);
      }
      
      setSuccess('Perfil atualizado com sucesso!');
      setPhotoFile(null); // Limpa o arquivo selecionado
      
      // Mantém o estado de "loading" para desabilitar o botão até o recarregamento da página
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err: any) {
      setError(`Falha ao atualizar o perfil: ${err.message}`);
      setLoading(false); // Para o "loading" em caso de erro para permitir nova tentativa
    }
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Configurações</h1>
      <div className="max-w-2xl">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Perfil</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Atualize suas informações de perfil.</p>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome de Exibição
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={currentUser?.email || ''}
                disabled
                className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900/50 dark:text-gray-400 shadow-sm cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Foto de Perfil
              </label>
              <div className="mt-2 flex items-center gap-4">
                <img 
                  src={photoPreview || `https://ui-avatars.com/api/?name=${displayName || currentUser?.email}&background=8FBC8F&color=fff`} 
                  alt="Profile Preview" 
                  className="h-16 w-16 rounded-full object-cover bg-gray-200"
                />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoChange} 
                  className="hidden"
                  accept="image/png, image/jpeg"
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Alterar Foto
                </button>
              </div>
            </div>
            
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-500">{success}</p>}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-sage-500 border border-transparent rounded-md shadow-sm hover:bg-sage-600 disabled:bg-sage-300 disabled:cursor-wait w-36 transition-colors duration-300"
              >
                {loading ? (success ? 'Salvo!' : 'Salvando...') : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;