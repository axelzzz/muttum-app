import type { GetApiWords200Pagination } from './getApiWords200Pagination';
import type { UserWord } from './userWord';

export type GetApiWords200 = {
  items?: UserWord[];
  pagination?: GetApiWords200Pagination;
};
