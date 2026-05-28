export interface ChecklistItem {
  id: string;
  label: string;
  reference?: string;
}

export interface DocumentItem {
  id: string;
  label: string;
  description: string;
  required: boolean;
}

// Estrutura atualizada para corresponder ao backend ProjEngDados
export interface Edital {
  id: string; // numero_controle
  title: string; // objeto
  region: string; // uf + municipio
  cnae: string; // modalidade
  valueRange: string; // valor
  deadline: string; // data_abertura
  publishedAt: string;
  description: string;
  
  // Campos extras do backend
  orgao?: string;
  municipio?: string;
  uf?: string;
  modalidade?: string;
  valor?: number;
  data_abertura?: string;
  source?: 'backend' | 'mock';
  
  // Campos mantidos para compatibilidade com a lógica de checklist/documentos do front
  requirements: ChecklistItem[];
  documents: DocumentItem[];
}

export interface ProposalState {
  checklist: Record<string, Record<string, boolean>>;
  documents: Record<string, Record<string, boolean>>;
}
