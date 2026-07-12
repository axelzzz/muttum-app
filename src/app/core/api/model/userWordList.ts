import type { Pagination } from './pagination';
import type { UserWord } from './userWord';

export interface UserWordList {
  items?: UserWord[];
  pagination?: Pagination;
}
