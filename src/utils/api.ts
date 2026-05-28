import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Edital, ProposalState } from '../types/Edital';
import { DEFAULT_DOCUMENTS, DEFAULT_REQUIREMENTS, MOCK_EDITAIS } from '../data/mockEditais';

const PROPOSAL_STATE_KEY = '@integrador_proposal_state';
const EDITAIS_CACHE_KEY = '@integrador_editais_cache';
const FAVORITE_EDITAIS_KEY = '@integrador_favorite_editais';
const REQUEST_TIMEOUT_MS = 12000;
const DEFAULT_UF = 'PE';
const DEFAULT_LIMIT = 50;

let memoryCache: Edital[] = [];

const getEnv = (name: string): string => {
  const env = (typeof process !== 'undefined' ? process.env : {}) as Record<string, string | undefined>;
  return env?.[name]?.trim() ?? '';
};

const normalizeDate = (value?: string): string => {
  if (!value) return 'Data não informada';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR');
};

const normalizeCurrency = (value?: number): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'Valor não informado';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const normalizeNumericValue = (value: unknown): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const normalized = value.replace(/\./g, '').replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getExpoHost = (): string | null => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants.manifest as any)?.debuggerHost ||
    (Constants.manifest2 as any)?.extra?.expoClient?.hostUri;

  if (!hostUri || typeof hostUri !== 'string') return null;
  const host = hostUri.split(':')[0];
  return host ? `http://${host}:3000` : null;
};

const unique = (items: string[]): string[] => Array.from(new Set(items.filter(Boolean)));

const getApiBaseUrls = (): string[] => {
  const envUrl = getEnv('EXPO_PUBLIC_API_URL');
  const expoHostUrl = getExpoHost();

  return unique([
    envUrl,
    expoHostUrl || '',
    Platform.OS === 'android' ? 'http://10.0.2.2:3000' : '',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]);
};

type FetchOptions = {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: unknown;
};

const fetchWithTimeout = async (url: string, options: FetchOptions = {}): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

const extractList = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.documents)) return payload.documents;
  if (Array.isArray(payload?.editais)) return payload.editais;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const mapBackendToEdital = (item: any, index = 0): Edital => {
  const mongoId = item?._id?.$oid || item?._id;
  const numeroControle = item?.numero_controle || item?.numeroControlePNCP || item?.numero_controle_pncp || item?.id || mongoId || `backend-edital-${index}`;
  const objeto = item?.objeto || item?.objetoCompra || item?.title || item?.descricao || 'Objeto não informado';
  const uf = item?.uf || item?.unidadeOrgao?.ufSigla || item?.estado || DEFAULT_UF;
  const municipio = item?.municipio || item?.unidadeOrgao?.municipioNome || item?.municipioNome || 'Município não informado';
  const modalidade = item?.modalidade || item?.modalidadeNome || item?.cnae_classificado || item?.cnae || 'Modalidade não informada';
  const valor = normalizeNumericValue(item?.valor ?? item?.valorTotalEstimado ?? item?.valor_estimado ?? item?.value);
  const dataAbertura = item?.data_abertura || item?.dataAberturaProposta || item?.dataPublicacaoPncp || item?.data_publicacao || item?.publishedAt || '';
  const orgao = item?.orgao || item?.orgaoEntidade?.razaoSocial || item?.orgao_nome || 'Órgão não informado';
  const fonteDado = String(item?.fonte_dado || item?.fonteDado || item?.source || '').toLowerCase();
  const source = fonteDado.includes('mock') || fonteDado.includes('fallback') ? 'mock' : 'backend';

  return {
    id: String(numeroControle),
    title: String(objeto),
    region: `${uf} - ${municipio}`,
    cnae: String(modalidade),
    valueRange: normalizeCurrency(valor),
    deadline: normalizeDate(dataAbertura),
    publishedAt: dataAbertura || new Date().toISOString(),
    description: String(objeto),
    orgao: String(orgao),
    municipio: String(municipio),
    uf: String(uf),
    modalidade: String(modalidade),
    valor,
    data_abertura: dataAbertura,
    source,
    requirements: DEFAULT_REQUIREMENTS,
    documents: DEFAULT_DOCUMENTS,
  };
};

const readCachedEditais = async (): Promise<Edital[]> => {
  if (memoryCache.length > 0) return memoryCache;

  try {
    const cached = await AsyncStorage.getItem(EDITAIS_CACHE_KEY);
    if (!cached) return [];
    const parsed = JSON.parse(cached);
    if (!Array.isArray(parsed)) return [];
    memoryCache = parsed;
    return parsed;
  } catch (error) {
    console.warn('Não foi possível ler o cache de editais:', error);
    return [];
  }
};

const writeCachedEditais = async (editais: Edital[]): Promise<void> => {
  memoryCache = editais;
  try {
    await AsyncStorage.setItem(EDITAIS_CACHE_KEY, JSON.stringify(editais));
  } catch (error) {
    console.warn('Não foi possível salvar o cache de editais:', error);
  }
};

const getTargetUf = (): string => getEnv('EXPO_PUBLIC_EDITAIS_UF') || DEFAULT_UF;
const getTargetLimit = (): number => Number(getEnv('EXPO_PUBLIC_EDITAIS_LIMIT')) || DEFAULT_LIMIT;

const getMongoCollections = (): string[] => {
  const uf = getTargetUf().toLowerCase();
  const explicitCollection = getEnv('EXPO_PUBLIC_MONGODB_COLLECTION');
  const mode = getEnv('EXPO_PUBLIC_MONGODB_COLLECTION_MODE').toLowerCase();

  if (explicitCollection) return [explicitCollection];
  if (mode === 'batch') return [`contratacoes_${uf}`];
  if (mode === 'streaming') return [`streaming_contratacoes_${uf}`];

  return [`contratacoes_${uf}`, `streaming_contratacoes_${uf}`];
};

const fetchEditaisFromMongoDataApi = async (): Promise<Edital[]> => {
  const endpoint = getEnv('EXPO_PUBLIC_MONGODB_DATA_API_URL').replace(/\/$/, '');
  const apiKey = getEnv('EXPO_PUBLIC_MONGODB_DATA_API_KEY');
  const dataSource = getEnv('EXPO_PUBLIC_MONGODB_DATA_SOURCE');
  const database = getEnv('EXPO_PUBLIC_MONGODB_DATABASE') || 'projeto_pncp';
  const limit = getTargetLimit();

  if (!endpoint || !apiKey || !dataSource) {
    throw new Error('MongoDB Data API não configurada no ambiente do Expo.');
  }

  const allRecords: any[] = [];

  for (const collection of getMongoCollections()) {
    const response = await fetchWithTimeout(`${endpoint}/action/find`, {
      method: 'POST',
      headers: { 'api-key': apiKey },
      body: {
        dataSource,
        database,
        collection,
        filter: {},
        limit,
        sort: { data_abertura: -1, dataPublicacaoPncp: -1 },
      },
    });

    if (!response.ok) {
      throw new Error(`MongoDB Data API respondeu HTTP ${response.status} para a coleção ${collection}.`);
    }

    const payload = await response.json();
    allRecords.push(...extractList(payload));
  }

  const mapped = allRecords.map(mapBackendToEdital).filter(edital => edital.id && edital.title);
  if (mapped.length === 0) {
    throw new Error('MongoDB Data API respondeu, mas não retornou editais válidos.');
  }

  await writeCachedEditais(mapped);
  return mapped;
};

const fetchEditaisFromBackendApi = async (): Promise<Edital[]> => {
  const urls = getApiBaseUrls();
  const uf = getTargetUf();
  const limit = getTargetLimit();
  let lastError: unknown = null;

  const paths = [
    `/editais?uf=${encodeURIComponent(uf)}&tamanho=${limit}`,
    `/contratacoes?uf=${encodeURIComponent(uf)}&tamanho=${limit}`,
    `/contratacoes/${encodeURIComponent(uf.toLowerCase())}?tamanho=${limit}`,
    `/api/editais?uf=${encodeURIComponent(uf)}&tamanho=${limit}`,
    `/api/contratacoes?uf=${encodeURIComponent(uf)}&tamanho=${limit}`,
  ];

  for (const baseUrl of urls) {
    for (const path of paths) {
      const url = `${baseUrl.replace(/\/$/, '')}${path}`;
      try {
        console.log(`Tentando buscar editais no backend: ${url}`);
        const response = await fetchWithTimeout(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = await response.json();
        const list = extractList(payload);

        if (!Array.isArray(list) || list.length === 0) {
          throw new Error('Resposta do backend não contém uma lista de editais.');
        }

        const mapped = list.map(mapBackendToEdital).filter(edital => edital.id && edital.title);
        if (mapped.length === 0) {
          throw new Error('Backend respondeu, mas não retornou editais válidos.');
        }

        await writeCachedEditais(mapped);
        return mapped;
      } catch (error) {
        lastError = error;
        console.warn(`Falha ao buscar editais em ${url}:`, error);
      }
    }
  }

  throw lastError || new Error('Nenhuma URL de backend disponível.');
};

const fetchEditaisFromBackendStorage = async (): Promise<Edital[]> => {
  try {
    return await fetchEditaisFromMongoDataApi();
  } catch (mongoError) {
    console.warn('Não foi possível ler diretamente o armazenamento MongoDB do backend:', mongoError);
    return fetchEditaisFromBackendApi();
  }
};

export const fetchEditais = async (): Promise<Edital[]> => {
  try {
    return await fetchEditaisFromBackendStorage();
  } catch (error) {
    console.warn('Usando fallback de editais por falha no armazenamento/backend:', error);

    const cached = await readCachedEditais();
    if (cached.length > 0) {
      return cached;
    }

    memoryCache = MOCK_EDITAIS;
    return MOCK_EDITAIS;
  }
};

export const fetchEditalById = async (id: string): Promise<Edital | null> => {
  const cached = await readCachedEditais();
  const cachedItem = cached.find(edital => edital.id === id);
  if (cachedItem) return cachedItem;

  const editais = await fetchEditais();
  return editais.find(edital => edital.id === id) || null;
};

export const loadProposalState = async (): Promise<ProposalState> => {
  try {
    const saved = await AsyncStorage.getItem(PROPOSAL_STATE_KEY);
    return saved ? JSON.parse(saved) : { checklist: {}, documents: {} };
  } catch (error) {
    console.warn('Não foi possível carregar o estado local da proposta:', error);
    return { checklist: {}, documents: {} };
  }
};

export const saveProposalState = async (state: ProposalState): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROPOSAL_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Erro ao salvar estado local da proposta:', error);
  }
};

const normalizeFavoriteIds = (ids: unknown): string[] => {
  if (!Array.isArray(ids)) return [];
  return unique(ids.map(id => String(id)));
};

export const loadFavoriteEditalIds = async (): Promise<string[]> => {
  try {
    const saved = await AsyncStorage.getItem(FAVORITE_EDITAIS_KEY);
    return saved ? normalizeFavoriteIds(JSON.parse(saved)) : [];
  } catch (error) {
    console.warn('Não foi possível carregar os editais favoritos:', error);
    return [];
  }
};

export const saveFavoriteEditalIds = async (ids: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(FAVORITE_EDITAIS_KEY, JSON.stringify(normalizeFavoriteIds(ids)));
  } catch (error) {
    console.error('Erro ao salvar editais favoritos:', error);
  }
};

export const isEditalFavorite = async (editalId: string): Promise<boolean> => {
  const favoriteIds = await loadFavoriteEditalIds();
  return favoriteIds.includes(editalId);
};

export const toggleFavoriteEdital = async (editalId: string): Promise<boolean> => {
  const favoriteIds = await loadFavoriteEditalIds();
  const isFavorite = favoriteIds.includes(editalId);
  const nextFavoriteIds = isFavorite
    ? favoriteIds.filter(id => id !== editalId)
    : [...favoriteIds, editalId];

  await saveFavoriteEditalIds(nextFavoriteIds);
  return !isFavorite;
};

export const filterFavoriteEditais = async (editais: Edital[]): Promise<Edital[]> => {
  const favoriteIds = await loadFavoriteEditalIds();
  return editais.filter(edital => favoriteIds.includes(edital.id));
};

export const fetchFavoriteEditais = async (): Promise<Edital[]> => {
  const editais = await fetchEditais();
  return filterFavoriteEditais(editais);
};

export const toggleChecklistItem = async (editalId: string, itemId: string): Promise<void> => {
  const state = await loadProposalState();
  if (!state.checklist[editalId]) state.checklist[editalId] = {};
  state.checklist[editalId][itemId] = !state.checklist[editalId][itemId];
  await saveProposalState(state);
};

export const toggleDocumentStatus = async (editalId: string, docId: string): Promise<void> => {
  const state = await loadProposalState();
  if (!state.documents[editalId]) state.documents[editalId] = {};
  state.documents[editalId][docId] = !state.documents[editalId][docId];
  await saveProposalState(state);
};

export const getProposalStateForEdital = async (editalId: string) => {
  const state = await loadProposalState();
  return {
    checklist: state.checklist[editalId] || {},
    documents: state.documents[editalId] || {},
  };
};

export const isUsingMockData = async (): Promise<boolean> => {
  const editais = await readCachedEditais();
  return editais.length > 0 ? editais.every(edital => edital.source === 'mock') : true;
};
