import type { Definition } from './definition';

/**
 * Flat projection returned by list / getOne / update endpoints
 */
export interface UserWord {
  id?: string;
  word?: string;
  definitions?: Definition[];
  firstSearchedAt?: string;
  lastSearchedAt?: string;
  searchCount?: number;
  notes?: string;
  tags?: string[];
  favorite?: boolean;
}
