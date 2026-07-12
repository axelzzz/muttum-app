import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { WordDetailPage } from './word-detail.page';
import { WordsService } from '../../core/api/words/words.service';
import { UiService } from '../../ui/ui.service';
import { DeleteResult, PatchApiWordsIdBody, UserWord } from '../../core/api/model';

type GetApiWordsIdFn = (id: string) => Observable<UserWord>;
type PatchApiWordsIdFn = (id: string, body?: PatchApiWordsIdBody) => Observable<UserWord>;
type DeleteApiWordsIdFn = (id: string) => Observable<DeleteResult>;

function userWord(overrides: Partial<UserWord> = {}): UserWord {
  return {
    id: 'word-1',
    word: 'chat',
    favorite: false,
    notes: '',
    tags: [],
    ...overrides,
  };
}

describe('WordDetailPage', () => {
  let component: WordDetailPage;
  let fixture: ComponentFixture<WordDetailPage>;
  let getApiWordsId: jest.MockedFunction<GetApiWordsIdFn>;
  let patchApiWordsId: jest.MockedFunction<PatchApiWordsIdFn>;
  let deleteApiWordsId: jest.MockedFunction<DeleteApiWordsIdFn>;
  let notifyWordUpdated: jest.MockedFunction<(word: UserWord) => void>;
  let notifyWordRemoved: jest.MockedFunction<(id: string) => void>;
  let uiService: jest.Mocked<Pick<UiService, 'confirmAction' | 'showToast'>>;
  let router: Router;

  beforeEach(async () => {
    getApiWordsId = jest.fn().mockReturnValue(of(userWord()));
    patchApiWordsId = jest.fn();
    deleteApiWordsId = jest.fn();
    notifyWordUpdated = jest.fn();
    notifyWordRemoved = jest.fn();
    const wordsService = {
      getApiWordsId,
      patchApiWordsId,
      deleteApiWordsId,
      notifyWordUpdated,
      notifyWordRemoved,
    } as unknown as Pick<
      WordsService,
      'getApiWordsId' | 'patchApiWordsId' | 'deleteApiWordsId' | 'notifyWordUpdated' | 'notifyWordRemoved'
    >;

    uiService = {
      confirmAction: jest.fn(),
      showToast: jest.fn().mockReturnValue(of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [WordDetailPage],
      providers: [
        provideRouter([]),
        { provide: WordsService, useValue: wordsService },
        { provide: UiService, useValue: uiService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: 'word-1' }) } },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(WordDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const field = (name: string) => (component as any)[name];

  it('creates the component and loads the word', () => {
    expect(component).toBeTruthy();
    expect(getApiWordsId).toHaveBeenCalledWith('word-1');
    expect(field('userWord')()).toEqual(userWord());
  });

  describe('toggleFavorite', () => {
    it('patches favorite to true and notifies WordsService with the updated word', () => {
      const updated = userWord({ favorite: true });
      patchApiWordsId.mockReturnValue(of(updated));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).toggleFavorite();

      expect(patchApiWordsId).toHaveBeenCalledWith('word-1', { favorite: true });
      expect(field('userWord')()).toEqual(updated);
      expect(notifyWordUpdated).toHaveBeenCalledWith(updated);
    });

    it('patches favorite to false when the word is already a favorite', () => {
      getApiWordsId.mockReturnValue(of(userWord({ favorite: true })));
      fixture = TestBed.createComponent(WordDetailPage);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const updated = userWord({ favorite: false });
      patchApiWordsId.mockReturnValue(of(updated));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).toggleFavorite();

      expect(patchApiWordsId).toHaveBeenCalledWith('word-1', { favorite: false });
      expect(notifyWordUpdated).toHaveBeenCalledWith(updated);
    });
  });

  describe('notes and tags edits', () => {
    it('notifies WordsService with the updated word after saving notes', () => {
      const updated = userWord({ notes: 'a fluffy cat' });
      patchApiWordsId.mockReturnValue(of(updated));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).onSaveNotes('a fluffy cat');

      expect(patchApiWordsId).toHaveBeenCalledWith('word-1', { notes: 'a fluffy cat' });
      expect(notifyWordUpdated).toHaveBeenCalledWith(updated);
    });

    it('notifies WordsService with the updated word after adding a tag', () => {
      const updated = userWord({ tags: ['animal'] });
      patchApiWordsId.mockReturnValue(of(updated));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).onAddTag('animal');

      expect(patchApiWordsId).toHaveBeenCalledWith('word-1', { tags: ['animal'] });
      expect(notifyWordUpdated).toHaveBeenCalledWith(updated);
    });

    it('notifies WordsService with the updated word after removing a tag', () => {
      getApiWordsId.mockReturnValue(of(userWord({ tags: ['animal', 'pet'] })));
      fixture = TestBed.createComponent(WordDetailPage);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const updated = userWord({ tags: ['pet'] });
      patchApiWordsId.mockReturnValue(of(updated));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).onRemoveTag('animal');

      expect(patchApiWordsId).toHaveBeenCalledWith('word-1', { tags: ['pet'] });
      expect(notifyWordUpdated).toHaveBeenCalledWith(updated);
    });
  });

  describe('confirmDelete', () => {
    it('deletes the word, notifies removal, and navigates back when confirmed', () => {
      uiService.confirmAction.mockReturnValue(of(true));
      deleteApiWordsId.mockReturnValue(of({ id: 'word-1' }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).confirmDelete();

      expect(deleteApiWordsId).toHaveBeenCalledWith('word-1');
      expect(notifyWordRemoved).toHaveBeenCalledWith('word-1');
      expect(router.navigate).toHaveBeenCalledWith(['/tabs/dictionary']);
    });

    it('does not delete or notify when the confirmation is cancelled', () => {
      uiService.confirmAction.mockReturnValue(of(false));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).confirmDelete();

      expect(deleteApiWordsId).not.toHaveBeenCalled();
      expect(notifyWordRemoved).not.toHaveBeenCalled();
    });
  });
});
