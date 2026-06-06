/**
 * Utilitários de data/hora "ingênuas" (sem fuso) usadas na Agenda.
 *
 * As consultas são armazenadas como hora de parede de Brasília, ex.:
 * "2026-06-04T14:00:00". O JavaScript interpreta strings SÓ-DATA
 * ("2026-06-04") como UTC, o que provoca desvio de 1 dia quando o sistema é
 * aberto em outro fuso. Estas funções constroem o Date a partir dos componentes
 * explícitos, garantindo que a data/hora exibida seja sempre a mesma que foi
 * registrada, independentemente do fuso do navegador. (correção E1)
 */

/**
 * Converte "YYYY-MM-DDTHH:mm[:ss]" (ou "YYYY-MM-DD") em um Date cujos
 * componentes locais correspondem EXATAMENTE aos da string.
 */
export const parseLocalDateTime = (value: string): Date => {
  if (!value) return new Date(NaN);
  const [datePart, timePart = "00:00:00"] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour = 0, minute = 0, second = 0] = timePart.split(":").map(Number);
  if (!year || !month || !day) return new Date(NaN);
  return new Date(year, month - 1, day, hour, minute, second);
};
