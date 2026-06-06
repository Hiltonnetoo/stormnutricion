import React from "react";
import type { Patient } from "../../types";
import { EditIcon } from "../icons";

interface Step6Props {
  data: Partial<Patient>;
  goToStep: (step: number) => void;
}

const SummaryItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</dt>
    <dd className="mt-0.5 text-sm text-slate-900 dark:text-white">{value || "-"}</dd>
  </div>
);

const Section: React.FC<{ title: string; step: number; onEdit: (step: number) => void; children: React.ReactNode }> = ({ title, step, onEdit, children }) => (
  <div className="py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
    <div className="flex justify-between items-center mb-3">
      <h4 className="font-bold text-slate-800 dark:text-white">{title}</h4>
      <button onClick={() => onEdit(step)} className="text-sm font-semibold text-sage-600 hover:text-sage-700 flex items-center gap-1">
        <EditIcon className="w-4 h-4" /> Editar
      </button>
    </div>
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">{children}</dl>
  </div>
);

const Step6Summary: React.FC<Step6Props> = ({ data, goToStep }) => (
  <div className="space-y-2">
    <h3 className="text-base font-bold text-slate-900 dark:text-white">Resumo do Cadastro</h3>
    <p className="text-sm text-slate-500">Por favor, revise todas as informações antes de finalizar o cadastro.</p>

    <div className="mt-3 rounded-2xl border border-slate-100 dark:border-slate-800 px-5">
      <Section title="Dados Pessoais" step={1} onEdit={goToStep}>
        <SummaryItem label="Nome Completo" value={`${data.firstName} ${data.lastName}`} />
        <SummaryItem label="Data de Nascimento" value={data.dob} />
        <SummaryItem label="Gênero" value={data.gender} />
      </Section>
      <Section title="Contato e Endereço" step={2} onEdit={goToStep}>
        <SummaryItem label="E-mail" value={data.email} />
        <SummaryItem label="Telefone" value={data.phone} />
        <SummaryItem label="Endereço" value={`${data.address?.street}, ${data.address?.number} - ${data.address?.neighborhood}, ${data.address?.city} - ${data.address?.state}, ${data.address?.cep}`} />
      </Section>
      <Section title="Dados Profissionais e Atividade" step={3} onEdit={goToStep}>
        <SummaryItem label="Profissão" value={data.profession} />
        <SummaryItem label="Nível de Atividade" value={data.activityLevel?.replace(/_/g, " ")} />
      </Section>
      <Section title="Dados Nutricionais e Clínicos" step={4} onEdit={goToStep}>
        <SummaryItem label="Modo" value={data.mode?.toUpperCase()} />
        <SummaryItem label="Objetivo" value={data.nutritionalGoal?.replace(/_/g, " ")} />
        <SummaryItem label="Consulta" value={data.consultationMode} />
        <SummaryItem label="Tags Clínicas" value={(data.clinicalTags || []).join(", ") || "Nenhuma"} />
        <SummaryItem label="Refeições por Dia" value={data.mealsPerDay} />
        <SummaryItem label="Hidratação" value={data.hydrationLevel} />
        <SummaryItem label="Restrições" value={(data.dietaryRestrictions || []).join(", ") || "Nenhuma"} />
        <SummaryItem label="Medicamentos" value={data.medications || "Nenhum"} />
      </Section>
      <Section title="Dados Antropométricos" step={5} onEdit={goToStep}>
        <SummaryItem label="Peso" value={`${data.weight} kg (${data.anthropometryMetadata?.weightOrigin || "-"})`} />
        <SummaryItem label="Altura" value={`${data.height ? (data.height / 100).toFixed(2).replace(".", ",") : "-"} m (${data.anthropometryMetadata?.heightOrigin || "-"})`} />
        <SummaryItem label="Circ. Abdominal" value={data.circumferenceAbdominal ? `${data.circumferenceAbdominal} cm` : "N/A"} />
        <SummaryItem label="% Gordura" value={data.bodyFatPercentage ? `${data.bodyFatPercentage}%` : "N/A"} />
        <SummaryItem label="Massa Muscular" value={data.muscleMassKg ? `${data.muscleMassKg} kg` : "N/A"} />
        <SummaryItem label="Pressão Arterial" value={data.bloodPressure || "N/A"} />
      </Section>
      <Section title="Exames Laboratoriais" step={6} onEdit={goToStep}>
        <SummaryItem label="Exames Informados" value={`${(data.lastLabExams || []).length} testes registrados`} />
      </Section>
    </div>
  </div>
);

export default Step6Summary;
