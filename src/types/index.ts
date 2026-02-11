export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

export type Knowledge = {
  id: string;
  title: string;
  content: string;
  category: 'SOP' | 'Product' | 'Tacit';
  authorId: string;
  createdAt: any; // Allow for Firestore Timestamps
  updatedAt: any; // Allow for Firestore Timestamps
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};
