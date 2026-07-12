import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { DictionaryPage } from './dictionary.page';
import { WordsService } from '../../core/api/words/words.service';
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

  beforeEach(async () => {
    getApiWords = jest.fn();
    sidebarService = { toggle: jest.fn() };
    const wordsService = { getApiWords } as unknown as Pick<WordsService, 'getApiWords'>;

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
});
