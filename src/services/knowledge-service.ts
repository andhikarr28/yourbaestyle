import type { Knowledge } from '@/types';

// This service is partially used on the server (Genkit flow).
// We cannot use client-side Firebase SDK here directly for server-side operations.
// A proper implementation would require the Admin SDK or a separate API layer.
// For now, we are keeping the mock implementation for getRelevantKnowledge
// and removing client-side functions which are now handled in components.

// Mock data for server-side flow until proper backend is implemented.
const mockKnowledgeBase: Knowledge[] = [
  {
    id: '1',
    title: 'Prosedur Pengajuan Cuti',
    content: 'Untuk mengajukan cuti, karyawan harus mengisi formulir pengajuan cuti yang tersedia di portal HR dan menyerahkannya kepada manajer langsung paling lambat 2 minggu sebelum tanggal cuti.',
    category: 'SOP',
    authorId: 'mock-user-1',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    title: 'Informasi Produk YourbAIstyle v2',
    content: 'Versi 2 dari YourbAIstyle memperkenalkan fitur analitik canggih dan integrasi dengan sistem CRM pihak ketiga. Pelatihan akan diadakan pada tanggal 15 bulan depan.',
    category: 'Product',
    authorId: 'mock-user-2',
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2023-05-10'),
  },
  {
    id: '3',
    title: 'Cara Mengatasi Error 502',
    content: 'Jika customer melaporkan Error 502, langkah pertama adalah membersihkan cache aplikasi. Jika tidak berhasil, eskalasikan ke tim teknis dengan menyertakan log dari server.',
    category: 'Tacit',
    authorId: 'mock-user-1',
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
  // This requires a server-side implementation with Firebase Admin SDK.
  return mockKnowledgeBase
    .map(item => `Judul: ${item.title}\nKonten: ${item.content}`)
    .join('\n\n---\n\n');
}
