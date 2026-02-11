export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'member';
};

export type Knowledge = {
  id: string;
  title: string;
  content: string;
  category: 'SOP' | 'Product' | 'Tacit';
  createdAt: Date;
  updatedAt: Date;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};
