/**
 * calcAge — fonte única para cálculo de idade a partir de uma data no formato DD/MM/AAAA.
 * Valida o formato, calcula usando a diferença exata de milissegundos (considera mês e dia)
 * e retorna 0 para datas inválidas ou ausentes.
 *
 * Centralizado aqui para evitar divergências entre Pacientes, Perfil e Gerador de Dieta.
 */
export function calcAge(dob: string): number {
  if (!dob || typeof dob !== "string" || !/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) return 0;
  const [day, month, year] = dob.split("/").map(Number);
  const birthDate = new Date(year, month - 1, day);
  if (isNaN(birthDate.getTime())) return 0;
  const ageDate = new Date(Date.now() - birthDate.getTime());
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);
  return age >= 0 ? age : 0;
}
