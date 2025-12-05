import React, { useState, useEffect } from 'react';
import type { Patient } from '../../types';

interface Step5Props {
    data: Partial<Patient>;
    onDataChange: (data: Partial<Patient>) => void;
    errors: Record<string, string>;
}

const Step5Anthropometric: React.FC<Step5Props> = ({ data, onDataChange, errors }) => {
    // Local state to manage the display format (e.g., "1,75")
    const [displayHeight, setDisplayHeight] = useState('');

    useEffect(() => {
        // When data.height (in cm) changes from parent, update the local display string in meters
        if (data.height && data.height > 0) {
            setDisplayHeight((data.height / 100).toFixed(2).replace('.', ','));
        } else {
            setDisplayHeight('');
        }
    }, [data.height]);

    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        // Allow only numbers and a single comma
        value = value.replace(/[^0-9,]/g, '');
        const parts = value.split(',');
        if (parts.length > 2) {
            value = parts[0] + ',' + parts.slice(1).join('');
        }
        // Limit to 2 decimal places
        if (parts[1] && parts[1].length > 2) {
            value = parts[0] + ',' + parts[1].substring(0, 2);
        }

        setDisplayHeight(value);
        
        // Convert the display string "1,75" to a number in cm (175) for storage and calculations
        const numericValueInMeters = parseFloat(value.replace(',', '.')) || 0;
        onDataChange({ height: Math.round(numericValueInMeters * 100) });
    };

    const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            onDataChange({ [name]: checked });
        } else {
            onDataChange({ [name]: parseFloat(value) || 0 });
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Dados Antropométricos</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Peso Atual (kg)</label>
                    <input type="number" name="weight" id="weight" value={data.weight || ''} onChange={handleOtherChange} step="0.1" className={`mt-1 block w-full rounded-md shadow-sm ${errors.weight ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white focus:border-sage-500 focus:ring-sage-500`} />
                    {errors.weight && <p className="mt-2 text-sm text-red-600">{errors.weight}</p>}
                </div>

                <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Altura (m)</label>
                    <input 
                        type="text" 
                        inputMode="decimal" 
                        name="height" 
                        id="height" 
                        value={displayHeight} 
                        onChange={handleHeightChange}
                        placeholder="Ex: 1,75"
                        className={`mt-1 block w-full rounded-md shadow-sm ${errors.height ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white focus:border-sage-500 focus:ring-sage-500`} 
                    />
                    {errors.height && <p className="mt-2 text-sm text-red-600">{errors.height}</p>}
                </div>
            </div>

            <div className="relative flex items-start pt-4">
                <div className="flex h-6 items-center">
                    <input
                        id="termsAccepted"
                        name="termsAccepted"
                        type="checkbox"
                        checked={data.termsAccepted || false}
                        onChange={handleOtherChange}
                        className={`h-4 w-4 rounded ${errors.termsAccepted ? 'border-red-500' : 'border-gray-300'} text-sage-600 focus:ring-sage-500`}
                    />
                </div>
                <div className="ml-3 text-sm leading-6">
                    <label htmlFor="termsAccepted" className="font-medium text-gray-900 dark:text-white">
                        Aceite os Termos e Condições
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">Eu confirmo que todas as informações fornecidas são verdadeiras e precisas.</p>
                     {errors.termsAccepted && <p className="mt-2 text-sm text-red-600">{errors.termsAccepted}</p>}
                </div>
            </div>
        </div>
    );
};

export default Step5Anthropometric;