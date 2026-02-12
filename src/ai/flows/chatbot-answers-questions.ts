'use server';

/**
 * @fileOverview AI Chatbot flow that answers employee questions in Bahasa Indonesia.
 *
 * - chatbotAnswersQuestions - A function that handles the chatbot question answering process.
 * - ChatbotAnswersQuestionsInput - The input type for the chatbotAnswersQuestions function.
 * - ChatbotAnswersQuestionsOutput - The return type for the chatbotAnswersQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatbotAnswersQuestionsInputSchema = z.object({
  question: z.string().describe('The question asked by the employee in Bahasa Indonesia.'),
  knowledge: z.string().describe('A collection of knowledge base articles to reference.'),
});
export type ChatbotAnswersQuestionsInput = z.infer<typeof ChatbotAnswersQuestionsInputSchema>;

const ChatbotAnswersQuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the question in Bahasa Indonesia.'),
  category: z.enum(['SOP', 'Product', 'Tacit']).describe('The category of the question.'),
});
export type ChatbotAnswersQuestionsOutput = z.infer<typeof ChatbotAnswersQuestionsOutputSchema>;

export async function chatbotAnswersQuestions(input: ChatbotAnswersQuestionsInput): Promise<ChatbotAnswersQuestionsOutput> {
  return chatbotAnswersQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotAnswersQuestionsPrompt',
  input: {schema: ChatbotAnswersQuestionsInputSchema},
  output: {schema: ChatbotAnswersQuestionsOutputSchema},
  prompt: `Anda adalah chatbot AI yang membantu karyawan dengan menjawab pertanyaan dalam Bahasa Indonesia.
  Anda hanya boleh menjawab pertanyaan berdasarkan informasi yang diberikan dalam basis pengetahuan yang disetujui.
  Berdasarkan pertanyaan dan pengetahuan yang diberikan, klasifikasikan pertanyaan tersebut ke dalam salah satu kategori berikut: 'SOP', 'Product', atau 'Tacit'.
  Jika pertanyaan berada di luar basis pengetahuan atau tidak ada informasi yang relevan, jawab dengan "Informasi belum tersedia. Silakan hubungi admin." dan klasifikasikan kategori sebagai 'Tacit'.

  Berikut adalah basis pengetahuan yang disetujui:
  {{{knowledge}}}

  Pertanyaan: {{{question}}}
`,
});

const chatbotAnswersQuestionsFlow = ai.defineFlow(
  {
    name: 'chatbotAnswersQuestionsFlow',
    inputSchema: ChatbotAnswersQuestionsInputSchema,
    outputSchema: ChatbotAnswersQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
