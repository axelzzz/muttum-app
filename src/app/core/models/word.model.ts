export interface Definition {
  partOfSpeech: string;
  definition: string;
  examples: string[];
}

export interface Word {
  _id: string;
  word: string;
  definitions: Definition[];
  source: 'wiktionary' | 'larousse' | 'lerobert' | 'manual';
  fetchedAt: string;
}

export interface UserWord {
  _id: string;
  userId: string;
  wordId: string | Word;
  firstSearchedAt: string;
  lastSearchedAt: string;
  searchCount: number;
  notes: string;
  tags: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserWordPopulated extends Omit<UserWord, 'wordId'> {
  wordId: Word;
}

export interface WordListResponse {
  data: UserWordPopulated[];
  total: number;
  page: number;
  limit: number;
}

export interface WordListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UpdateWordPayload {
  notes?: string;
  tags?: string[];
  favorite?: boolean;
}
