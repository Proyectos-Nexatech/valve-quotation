import { create } from 'zustand';

export interface RequestItem {
  id: string;
  valveType: 'manual' | 'safety' | 'pressure-vacuum' | 'on-off' | 'control';
  nominalSize: string;
  rating: string;
  serviceType: string;
  technicalNotes: string;
  tag: string;
  location: string;
  quantity: number;
  brand?: string;
  serialNumber?: string;
}

interface QuotationState {
  step: number;
  clientData: {
    name: string;
    company: string;
    role: string;
    email: string;
    nit: string;
    phone: string;
    plant: string;
    priority: 'Normal' | 'Urgente';
  };
  items: RequestItem[];
  setStep: (step: number) => void;
  setClientData: (data: Partial<QuotationState['clientData']>) => void;
  addItem: (item: RequestItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, item: Partial<RequestItem>) => void;
  reset: () => void;
}

export const useQuotationStore = create<QuotationState>((set) => ({
  step: 1,
  clientData: {
    name: '',
    company: '',
    role: '',
    email: '',
    nit: '',
    phone: '',
    plant: '',
    priority: 'Normal',
  },
  items: [],
  setStep: (step) => set({ step }),
  setClientData: (data) => set((state) => ({ clientData: { ...state.clientData, ...data } })),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  updateItem: (id, item) => set((state) => ({
    items: state.items.map((i) => (i.id === id ? { ...i, ...item } : i))
  })),
  reset: () => set({
    step: 1,
    clientData: { name: '', company: '', role: '', email: '', nit: '', phone: '', plant: '', priority: 'Normal' },
    items: []
  }),
}));
