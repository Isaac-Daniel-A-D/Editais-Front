import { DEFAULT_DOCUMENTS, MOCK_EDITAIS } from '../../data/mockEditais';

describe('DocumentsScreen - documentos do fallback', () => {
  it('possui documentos padrão para orientar a preparação da proposta', () => {
    expect(DEFAULT_DOCUMENTS.length).toBeGreaterThan(0);
    DEFAULT_DOCUMENTS.forEach(document => {
      expect(document).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          label: expect.any(String),
          description: expect.any(String),
        }),
      );
    });
  });

  it('garante que os editais mockados tenham estrutura compatível com documentos', () => {
    MOCK_EDITAIS.forEach(edital => {
      expect(edital.documents).toBeDefined();
      expect(Array.isArray(edital.documents)).toBe(true);
    });
  });
});
