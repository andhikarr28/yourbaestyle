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
import { getRelevantKnowledge } from '@/services/knowledge-service';

const ChatbotAnswersQuestionsInputSchema = z.object({
  question: z.string().describe('The question asked by the employee in Bahasa Indonesia.'),
});
export type ChatbotAnswersQuestionsInput = z.infer<typeof ChatbotAnswersQuestionsInputSchema>;

const ChatbotAnswersQuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the question in Bahasa Indonesia.'),
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
  Jika pertanyaan berada di luar basis pengetahuan, jawab dengan sopan bahwa Anda tidak memiliki informasi yang relevan.

  Berikut adalah basis pengetahuan yang disetujui:
  {{knowledge}}

  Pertanyaan: {{{question}}}

  Jawaban: `,
});

const chatbotAnswersQuestionsFlow = ai.defineFlow(
  {
    name: 'chatbotAnswersQuestionsFlow',
    inputSchema: ChatbotAnswersQuestionsInputSchema,
    outputSchema: ChatbotAnswersQuestionsOutputSchema,
  },
  async input => {
    const knowledge = await getRelevantKnowledge(input.question);
    const {output} = await prompt({
      ...input,
      knowledge,
    });
    return output!;
  }
);
