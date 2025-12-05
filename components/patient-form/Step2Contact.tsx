import React, { useState, useEffect } from 'react';
import type { Patient } from '../../types';

interface Step2Props {
    data: Partial<Patient>;
    onDataChange: (data: Partial<Patient>) => void;
    errors: Record<string, string>;
}

const Step2Contact: React.FC<Step2Props> = ({ data, onDataChange, errors }) => {
    const [cepLoading, setCepLoading] = useState(false);
    const [cepError, setCepError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { name, value } = e.target;

        if (name === 'phone') {
            value = value.replace(/\D/g, '');
            value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
        } else if (name === 'cep') {
            value = value.replace(/\D/g, '');
            value = value.replace(/^(\d{5})(\d)/, '$1-$2');
        }

        onDataChange({ [name]: value });
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDataChange({ address: { ...data.address, [e.target.name]: e.target.value } });
    };

    useEffect(() => {
        const cep = data.address?.cep?.replace(/\D/g, '');
        if (cep && cep.length === 8) {
            const fetchAddress = async () => {
                setCepLoading(true);
                setCepError('');
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const addressData = await response.json();
                    if (addressData.erro) {
                        setCepError('CEP não encontrado.');
                    } else {
                        onDataChange({
                            address: {
                                ...data.address,
                                street: addressData.logradouro,
                                neighborhood: addressData.bairro,
                                city: addressData.localidade,
                                state: addressData.uf,
                            }
                        });
                    }
                } catch (error) {
                    setCepError('Erro ao buscar CEP.');
                } finally {
                    setCepLoading(false);
                }
            };
            fetchAddress();
        }
    }, [data.address?.cep]);


    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Contato e Endereço</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input type="email" name="email" id="email" value={data.email || ''} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white focus:border-sage-500 focus:ring-sage-500`} />
                    {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
                    <input type="tel" name="phone" id="phone" value={data.phone || ''} onChange={handleInputChange} maxLength={15} placeholder="(XX) XXXXX-XXXX" className={`mt-1 block w-full rounded-md shadow-sm ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white focus:border-sage-500 focus:ring-sage-500`} />
                    {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="cep" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CEP</label>
                    <div className="flex items-center gap-2">
                         <input type="text" name="cep" id="cep" value={data.address?.cep || ''} onChange={handleAddressChange} maxLength={9} placeholder="XXXXX-XXX" className={`mt-1 block w-full sm:w-1/3 rounded-md shadow-sm ${errors.cep || cepError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white focus:border-sage-500 focus:ring-sage-500`} />
                         {cepLoading && <div className="mt-1 animate-spin rounded-full h-5 w-5 border-b-2 border-sage-500"></div>}
                    </div>
                    {errors.cep && <p className="mt-2 text-sm text-red-600">{errors.cep}</p>}
                    {cepError && <p className="mt-2 text-sm text-red-600">{cepError}</p>}
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rua</label>
                    <input type="text" name="street" id="street" value={data.address?.street || ''} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500" />
                </div>
                <div>
                    <label htmlFor="number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número</label>
                    <input type="text" name="number" id="number" value={data.address?.number || ''} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500" />
                </div>
                 <div>
                    <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bairro</label>
                    <input type="text" name="neighborhood" id="neighborhood" value={data.address?.neighborhood || ''} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500" />
                </div>
                <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cidade</label>
                    <input type="text" name="city" id="city" value={data.address?.city || ''} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500" />
                </div>
                <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                    <input type="text" name="state" id="state" value={data.address?.state || ''} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-sage-500 focus:ring-sage-500" />
                </div>
            </div>
        </div>
    );
};

export default Step2Contact;