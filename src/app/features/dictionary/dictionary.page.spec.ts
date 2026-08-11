import { CUSTOM_ELEMENTS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';
import { DictionaryPage } from './dictionary.page';
import { WordsService, WordUpdate } from '../../core/api/words/words.service';
import { SidebarService } from '../../core/services/sidebar.service';
import { GetApiWordsParams, UserWord, UserWordList } from '../../core/api/model';

const PAGE_SIZE = 20;

type GetApiWordsFn = (params?: GetApiWordsParams) => Observable<UserWordList>;

function userWord(id: string, overrides: Partial<UserWord> = {}): UserWord {
  return { id, word: `word-${id}`, favorite: false, ...overrides };
}

describe('DictionaryPage', () => {
  let component: DictionaryPage;
  let fixture: ComponentFixture<DictionaryPage>;
  let getApiWords: jest.MockedFunction<GetApiWordsFn>;
  let sidebarService: jest.Mocked<Pick<SidebarService, 'toggle'>>;
  let latestUpdate: WritableSignal<WordUpdate | null>;

  beforeEach(async () => {
    getApiWords = jest.fn();
    sidebarService = { toggle: jest.fn() };
    latestUpdate = signal<WordUpdate | null>(null);
    const wordsService = { getApiWords, latestUpdate } as unknown as Pick<
      WordsService,
      'getApiWords' | 'latestUpdate'
    >;

    await TestBed.configureTestingModule({
      imports: [DictionaryPage],
      providers: [
        provideRouter([]),
        { provide: WordsService, useValue: wordsService },
        { provide: SidebarService, useValue: sidebarService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const field = (name: string) => (component as any)[name];

  function createComponent(): void {
    fixture = TestBed.createComponent(DictionaryPage);
    component = fixture.componentInstance;
  }

  function toggleFavorites(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (component as any).toggleFavorites();
  }

  function searchInput(value: string): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (component as any).onSearchInput({ detail: { value } } as CustomEvent);
  }

  it('creates the component', () => {
    getApiWords.mockReturnValue(of({ items: [], pagination: { total: 0 } }));

    createComponent();
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  describe('word listing', () => {
    it('loads the first page of words on init', () => {
      const items = [userWord('1'), userWord('2')];
      getApiWords.mockReturnValue(of({ items, pagination: { total: 2 } }));

      createComponent();
      fixture.detectChanges();

      expect(field('words')()).toEqual(items);
      expect(field('isLoading')()).toBe(false);
    });

    it('stops loading without throwing when the request fails', () => {
      getApiWords.mockReturnValue(throwError(() => new Error('network error')));

      createComponent();
      fixture.detectChanges();

      expect(field('words')()).toEqual([]);
      expect(field('isLoading')()).toBe(false);
    });
  });

  describe('favorites filter', () => {
    it('does not send a favorite param by default', () => {
      getApiWords.mockReturnValue(of({ items: [], pagination: { total: 0 } }));

      createComponent();
      fixture.detectChanges();

      const [params]: [GetApiWordsParams?] = getApiWords.mock.calls[0];
      expect(params?.favorite).toBeUndefined();
    });

    it('requests favorite=true when toggled on', () => {
      const items = [userWord('1', { favorite: true })];
      getApiWords.mockReturnValue(of({ items, pagination: { page: 1, total: 1, pages: 1 } }));

      createComponent();
      fixture.detectChanges();
      toggleFavorites();
      fixture.detectChanges();

      expect(getApiWords).toHaveBeenLastCalledWith({ page: 1, limit: PAGE_SIZE, favorite: true });
      expect(field('words')()).toEqual(items);
    });

    it('keeps requesting favorite=true on infinite scroll', () => {
      getApiWords.mockReturnValue(
        of({ items: [userWord('1', { favorite: true })], pagination: { page: 1, total: 2, pages: 2 } }),
      );

      createComponent();
      fixture.detectChanges();
      toggleFavorites();
      fixture.detectChanges();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).loadMore({ target: { complete: jest.fn() } });

      expect(getApiWords).toHaveBeenLastCalledWith({ page: 2, limit: PAGE_SIZE, favorite: true });
    });

    it('stops loading without throwing when a favorites request fails', () => {
      getApiWords.mockReturnValue(of({ items: [], pagination: { total: 0 } }));

      createComponent();
      fixture.detectChanges();
      getApiWords.mockReturnValue(throwError(() => new Error('network error')));
      toggleFavorites();
      fixture.detectChanges();

      expect(field('isLoading')()).toBe(false);
      expect(field('words')()).toEqual([]);
    });
  });

  describe('search', () => {
    it('requests the search term from the server and resets pagination to page 1', () => {
      getApiWords.mockReturnValue(
        of({ items: [userWord('1')], pagination: { page: 1, total: 21, pages: 2 } }),
      );

      createComponent();
      fixture.detectChanges();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).loadMore({ target: { complete: jest.fn() } });
      fixture.detectChanges();

      searchInput('pomme');
      fixture.detectChanges();

      expect(getApiWords).toHaveBeenLastCalledWith({
        page: 1,
        limit: PAGE_SIZE,
        search: 'pomme',
      });
    });

    it('keeps the previous results visible while a new search request is in flight', () => {
      const initialItems = [userWord('1')];
      getApiWords.mockReturnValue(of({ items: initialItems, pagination: { total: 1 } }));

      createComponent();
      fixture.detectChanges();

      const pending = new Subject<UserWordList>();
      getApiWords.mockReturnValue(pending as unknown as Observable<UserWordList>);

      searchInput('xyz');
      fixture.detectChanges();

      expect(field('isSearching')()).toBe(true);
      expect(field('words')()).toEqual(initialItems);

      pending.next({ items: [], pagination: { total: 0 } });
      pending.complete();
      fixture.detectChanges();

      expect(field('isSearching')()).toBe(false);
      expect(field('words')()).toEqual([]);
    });

    it('ignores a stale search response that resolves after a newer one', () => {
      getApiWords.mockReturnValue(of({ items: [userWord('1')], pagination: { total: 1 } }));
      createComponent();
      fixture.detectChanges();

      const staleResponse = new Subject<UserWordList>();
      const latestResponse = new Subject<UserWordList>();
      getApiWords.mockReturnValueOnce(staleResponse as unknown as Observable<UserWordList>);
      getApiWords.mockReturnValueOnce(latestResponse as unknown as Observable<UserWordList>);

      searchInput('ab');
      fixture.detectChanges();
      searchInput('abc');
      fixture.detectChanges();

      latestResponse.next({ items: [userWord('2')], pagination: { total: 1 } });
      latestResponse.complete();
      fixture.detectChanges();

      staleResponse.next({ items: [userWord('99')], pagination: { total: 1 } });
      staleResponse.complete();
      fixture.detectChanges();

      expect(field('words')()).toEqual([userWord('2')]);
    });

    it('clears the search term and reloads on clear', () => {
      getApiWords.mockReturnValue(of({ items: [], pagination: { total: 0 } }));

      createComponent();
      fixture.detectChanges();
      searchInput('pomme');
      fixture.detectChanges();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).clearSearch();
      fixture.detectChanges();

      expect(getApiWords).toHaveBeenLastCalledWith({ page: 1, limit: PAGE_SIZE });
    });
  });

  describe('reacting to WordsService.latestUpdate', () => {
    it('patches the matching entry in place when a word is updated', () => {
      const items = [userWord('1', { favorite: false }), userWord('2', { favorite: false })];
      getApiWords.mockReturnValue(of({ items, pagination: { total: 2 } }));

      createComponent();
      fixture.detectChanges();

      latestUpdate.set({ type: 'updated', word: userWord('1', { favorite: true }) });
      TestBed.tick();

      expect(field('words')()).toEqual([
        userWord('1', { favorite: true }),
        userWord('2', { favorite: false }),
      ]);
    });

    it('removes the entry when a word is deleted', () => {
      const items = [userWord('1'), userWord('2')];
      getApiWords.mockReturnValue(of({ items, pagination: { total: 2 } }));

      createComponent();
      fixture.detectChanges();

      latestUpdate.set({ type: 'removed', id: '1' });
      TestBed.tick();

      expect(field('words')()).toEqual([userWord('2')]);
    });

    it('drops an entry from a favorites-only list once it is un-favorited', () => {
      const items = [userWord('1', { favorite: true }), userWord('2', { favorite: true })];
      getApiWords.mockReturnValue(of({ items, pagination: { total: 2 } }));

      createComponent();
      fixture.detectChanges();
      toggleFavorites();
      fixture.detectChanges();

      latestUpdate.set({ type: 'updated', word: userWord('1', { favorite: false }) });
      TestBed.tick();

      expect(field('words')()).toEqual([userWord('2', { favorite: true })]);
    });

    it('keeps a still-favorite entry when a different word is updated on a favorites-only list', () => {
      const items = [userWord('1', { favorite: true }), userWord('2', { favorite: true })];
      getApiWords.mockReturnValue(of({ items, pagination: { total: 2 } }));

      createComponent();
      fixture.detectChanges();
      toggleFavorites();
      fixture.detectChanges();

      latestUpdate.set({ type: 'updated', word: userWord('2', { favorite: true, notes: 'note' }) });
      TestBed.tick();

      expect(field('words')()).toEqual([
        userWord('1', { favorite: true }),
        userWord('2', { favorite: true, notes: 'note' }),
      ]);
    });
  });
});
