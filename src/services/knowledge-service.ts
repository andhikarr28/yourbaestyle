import type { Knowledge } from '@/types';

// Mock data
let mockKnowledgeBase: Knowledge[] = [
  {
    id: '1',
    title: 'Prosedur Pengajuan Cuti',
    content: 'Untuk mengajukan cuti, karyawan harus mengisi formulir pengajuan cuti yang tersedia di portal HR dan menyerahkannya kepada manajer langsung paling lambat 2 minggu sebelum tanggal cuti.',
    category: 'SOP',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    title: 'Informasi Produk YourbAIstyle v2',
    content: 'Versi 2 dari YourbAIstyle memperkenalkan fitur analitik canggih dan integrasi dengan sistem CRM pihak ketiga. Pelatihan akan diadakan pada tanggal 15 bulan depan.',
    category: 'Product',
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2023-05-10'),
  },
  {
    id: '3',
    title: 'Cara Mengatasi Error 502',
    content: 'Jika customer melaporkan Error 502, langkah pertama adalah membersihkan cache aplikasi. Jika tidak berhasil, eskalasikan ke tim teknis dengan menyertakan log dari server.',
    category: 'Tacit',
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2023-03-01'),
  },
];

/**
 * Mocks fetching relevant knowledge from a vector database or search index.
 * For now, it returns a concatenated string of all knowledge.
 * @param question The user's question.
 * @returns A string containing relevant knowledge.
 */
export async function getRelevantKnowledge(question: string): Promise<string> {
  console.log(`Searching for knowledge relevant to: "${question}"`);
  // In a real app, you would use embeddings and a vector search here.
  // For this mock, we'll just combine all knowledge into one text block.
  return mockKnowledgeBase
    .map(item => `Judul: ${item.title}\nKonten: ${item.content}`)
    .join('\n\n---\n\n');
}

// Mock CRUD functions for the admin panel

export async function getKnowledgeItems(): Promise<Knowledge[]> {
  console.log('Fetching all knowledge items...');
  // In a real app, this would fetch from Firestore.
  return new Promise(resolve => setTimeout(() => resolve([...mockKnowledgeBase]), 500));
}

export async function createKnowledgeItem(item: Omit<Knowledge, 'id' | 'createdAt' | 'updatedAt'>): Promise<Knowledge> {
  console.log('Creating new knowledge item:', item);
  const newItem: Knowledge = {
    ...item,
    id: (mockKnowledgeBase.length + 2).toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockKnowledgeBase.push(newItem);
  return new Promise(resolve => setTimeout(() => resolve(newItem), 300));
}

export async function updateKnowledgeItem(id: string, updates: Partial<Omit<Knowledge, 'id' | 'createdAt'>>): Promise<Knowledge> {
    console.log(`Updating knowledge item ${id} with:`, updates);
    let updatedItem: Knowledge | undefined;
    mockKnowledgeBase = mockKnowledgeBase.map(item => {
        if (item.id === id) {
            updatedItem = { ...item, ...updates, updatedAt: new Date() };
            return updatedItem;
        }
        return item;
    });

    if (!updatedItem) {
        throw new Error("Item not found");
    }
    
    return new Promise(resolve => setTimeout(() => resolve(updatedItem as Knowledge), 300));
}

export async function deleteKnowledgeItem(id: string): Promise<void> {
  console.log(`Deleting knowledge item ${id}`);
  mockKnowledgeBase = mockKnowledgeBase.filter(item => item.id !== id);
  return new Promise(resolve => setTimeout(() => resolve(), 300));
}
