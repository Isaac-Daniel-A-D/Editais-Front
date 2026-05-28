import { MOCK_EDITAIS } from '../../data/mockEditais';

describe('HomeScreen - dados de listagem', () => {
  it('possui editais mockados para fallback da tela inicial', () => {
    expect(MOCK_EDITAIS.length).toBeGreaterThan(0);
    expect(MOCK_EDITAIS[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: expect.any(String),
        region: expect.any(String),
        source: 'mock',
      }),
    );
  });

  it('mantém campos essenciais para busca e filtros', () => {
    MOCK_EDITAIS.forEach(edital => {
      expect(edital.title).toBeTruthy();
      expect(edital.region).toBeTruthy();
      expect(edital.cnae).toBeTruthy();
      expect(edital.deadline).toBeTruthy();
    });
  });
});
