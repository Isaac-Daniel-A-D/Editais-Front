import { DEFAULT_DOCUMENTS, DEFAULT_REQUIREMENTS, MOCK_EDITAIS } from '../../data/mockEditais';

describe('EditalDetailScreen - contrato de dados', () => {
  it('possui requisitos padrão para checklist de habilitação', () => {
    expect(DEFAULT_REQUIREMENTS.length).toBeGreaterThan(0);
    DEFAULT_REQUIREMENTS.forEach(requirement => {
      expect(requirement).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          label: expect.any(String),
        }),
      );
    });
  });

  it('permite que cada edital mockado seja detalhado com segurança', () => {
    MOCK_EDITAIS.forEach(edital => {
      expect(edital.id).toBeTruthy();
      expect(edital.description).toBeTruthy();
      expect(edital.requirements || DEFAULT_REQUIREMENTS).toBeDefined();
      expect(edital.documents || DEFAULT_DOCUMENTS).toBeDefined();
    });
  });
});
