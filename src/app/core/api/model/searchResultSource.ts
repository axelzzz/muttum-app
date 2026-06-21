
export type SearchResultSource = typeof SearchResultSource[keyof typeof SearchResultSource];


export const SearchResultSource = {
  wiktionary: 'wiktionary',
  larousse: 'larousse',
  lerobert: 'lerobert',
  manual: 'manual',
} as const;
