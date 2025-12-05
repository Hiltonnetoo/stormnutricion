import React from 'react';
import type { Patient } from '../../types';

interface Step1Props {
    data: Partial<Patient>;
    onDataChange: (data: Partial<Patient>) => void;
    errors: Record<string, string>;
}

const Step1Personal: React.FC<Step1Props> = ({ data, onDataChange, errors }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        let { name, value } = e.target;

        if (name === 'dob') {
            value = value.replace(/\D/g, ''); // Remove non-digits
            if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
            if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
        }

        onDataChange({ [name]: value });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Dados Pessoais</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                    <input type="text" name="firstName" id="firstName" value={data.firstName || ''} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm ${errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white focus:border-sage-500 focus:ring-sage-500`} />
                    {errors.firstName && <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>}
                </div>

                <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sobrenome</label>
                    <input type="text" name="lastName" id="lastName" value={data.lastName || ''} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm ${errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white focus:border-sage-500 focus:ring-sage-500`} />
                    {errors.lastName && <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>}
                </div>

                <div>
                    <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Nascimento</label>
                    <input type="text" name="dob" id="dob" value={data.dob || ''} onChange={handleChange} maxLength={10} placeholder="DD/MM/AAAA" className={`mt-1 block w-full rounded-md shadow-sm ${errors.dob ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white focus:border-sage-500 focus:ring-sage-500`} />
                    {errors.dob && <p className="mt-2 text-sm text-red-600">{errors.dob}</p>}
                </div>

                <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gênero</label>
                    <select id="gender" name="gender" value={data.gender || 'female'} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500">
                        <option value="female">Feminino</option>
                        <option value="male">Masculino</option>
                        <option value="other">Outro</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default Step1Personal;