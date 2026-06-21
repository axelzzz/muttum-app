import type { Definition } from './definition';
import type { SearchResultSource } from './searchResultSource';

/**
 * Response from the search endpoint — includes word metadata and user-list context
 */
export interface SearchResult {
  /** UserWord document id, usable for the /words/:id routes */
  id?: string;
  word?: string;
  /** Word document id */
  wordId?: string;
  definitions?: Definition[];
  source?: SearchResultSource;
  fromCache?: boolean;
  alreadyInList?: boolean;
}
