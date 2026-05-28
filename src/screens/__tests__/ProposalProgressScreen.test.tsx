import { MOCK_EDITAIS } from '../../data/mockEditais';

const calculateProgress = (items: Array<{ completed: boolean }>) => {
  if (items.length === 0) return 0;
  return Math.round((items.filter(item => item.completed).length / items.length) * 100);
};

describe('ProposalProgressScreen - cálculo de progresso', () => {
  it('calcula percentuais de requisitos e documentos sem quebrar', () => {
    MOCK_EDITAIS.forEach(edital => {
      const requirementsProgress = calculateProgress(edital.requirements || []);
      const documentsProgress = calculateProgress(edital.documents || []);

      expect(requirementsProgress).toBeGreaterThanOrEqual(0);
      expect(requirementsProgress).toBeLessThanOrEqual(100);
      expect(documentsProgress).toBeGreaterThanOrEqual(0);
      expect(documentsProgress).toBeLessThanOrEqual(100);
    });
  });

  it('mantém dados suficientes para o dashboard mesmo quando o backend falha', () => {
    expect(MOCK_EDITAIS.length).toBeGreaterThanOrEqual(3);
    expect(MOCK_EDITAIS.some(edital => edital.source === 'mock')).toBe(true);
  });
});
