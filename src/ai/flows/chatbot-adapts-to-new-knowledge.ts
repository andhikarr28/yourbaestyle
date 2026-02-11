'use server';

/**
 * @fileOverview An AI Chatbot that responds to employee questions in Bahasa Indonesia,
 * referencing only approved information stored in Firestore.
 *
 * - chatbotAdaptsToNewKnowledge - A function that handles the chatbot process.
 * - ChatbotAdaptsToNewKnowledgeInput - The input type for the chatbotAdaptsToNewKnowledge function.
 * - ChatbotAdaptsToNewKnowledgeOutput - The return type for the chatbotAdaptsToNewKnowledge function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatbotAdaptsToNewKnowledgeInputSchema = z.object({
  question: z.string().describe('The employee question in Bahasa Indonesia.'),
  knowledge:
    z.string().describe('The knowledge base content from Firestore.'),
});
export type ChatbotAdaptsToNewKnowledgeInput = z.infer<
  typeof ChatbotAdaptsToNewKnowledgeInputSchema
>;

const ChatbotAdaptsToNewKnowledgeOutputSchema = z.object({
  answer: z
    .string()
    .describe('The chatbot response in Bahasa Indonesia.'),
});
export type ChatbotAdaptsToNewKnowledgeOutput = z.infer<
  typeof ChatbotAdaptsToNewKnowledgeOutputSchema
>;

export async function chatbotAdaptsToNewKnowledge(
  input: ChatbotAdaptsToNewKnowledgeInput
): Promise<ChatbotAdaptsToNewKnowledgeOutput> {
  return chatbotAdaptsToNewKnowledgeFlow(input);
}

const chatbotAdaptsToNewKnowledgePrompt = ai.definePrompt({
  name: 'chatbotAdaptsToNewKnowledgePrompt',
  input: {schema: ChatbotAdaptsToNewKnowledgeInputSchema},
  output: {schema: ChatbotAdaptsToNewKnowledgeOutputSchema},
  prompt: `You are a helpful AI chatbot that answers employee questions in Bahasa Indonesia.
  You must use the following knowledge base to answer the question. If the knowledge base does not contain the answer, respond that you do not know.
  Knowledge Base:
  {{knowledge}}

  Question: {{question}}

  Answer: `,
});

const chatbotAdaptsToNewKnowledgeFlow = ai.defineFlow(
  {
    name: 'chatbotAdaptsToNewKnowledgeFlow',
    inputSchema: ChatbotAdaptsToNewKnowledgeInputSchema,
    outputSchema: ChatbotAdaptsToNewKnowledgeOutputSchema,
  },
  async input => {
    const {output} = await chatbotAdaptsToNewKnowledgePrompt(input);
    return output!;
  }
);
