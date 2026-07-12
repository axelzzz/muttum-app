import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bookOutline,
  chevronForwardOutline,
  star,
  starOutline,
} from 'ionicons/icons';
import { WordsService } from '../../core/api/words/words.service';
import { GetApiWordsParams, UserWord } from '../../core/api/model';
import { SidebarService } from '../../core/services/sidebar.service';

const PAGE_SIZE = 20;
const UNICODE_CANONICAL_DECOMPOSITION = 'NFD';

function stripDiacritics(value: string): string {
  return value
    .normalize(UNICODE_CANONICAL_DECOMPOSITION)
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function matchesFilter(entry: UserWord, filterText: string): boolean {
  return stripDiacritics(entry.word ?? '').includes(stripDiacritics(filterText));
}

@Component({
  selector: 'app-dictionary',
  templateUrl: './dictionary.page.html',
  styleUrl: './dictionary.page.scss',
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DictionaryPage implements OnInit {
  protected readonly sidebarService = inject(SidebarService);
  private readonly wordService = inject(WordsService);
  private readonly router = inject(Router);

  protected readonly words = signal<UserWord[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly hasMore = signal(true);
  protected readonly showFavoritesOnly = signal(false);
  protected readonly filterText = signal('');

  protected readonly displayedWords = computed<UserWord[]>(() => {
    const filterText = this.filterText().trim();
    return filterText
      ? this.words().filter((entry) => matchesFilter(entry, filterText))
      : this.words();
  });

  private currentPage = 1;
  private searchQuery = '';

  constructor() {
    addIcons({ star, starOutline, bookOutline, chevronForwardOutline });

    effect(() => {
      const update = this.wordService.latestUpdate();
      if (!update) return;

      this.words.update((list) => {
        if (update.type === 'removed') {
          return list.filter((entry) => entry.id !== update.id);
        }

        const merged = list.map((entry) =>
          entry.id === update.word.id ? { ...entry, ...update.word } : entry,
        );

        // A favorites-only list was fetched with `favorite: true`, so an entry that
        // just got un-favorited must drop out instead of lingering until a reload.
        return this.showFavoritesOnly()
          ? merged.filter((entry) => entry.favorite)
          : merged;
      });
    });
  }

  ngOnInit(): void {
    this.loadWords(true);
  }

  ionViewWillEnter(): void {
    this.resetAndLoad();
  }

  protected refresh(event?: CustomEvent): void {
    this.resetAndLoad(event);
  }

  protected onFilterInput(event: CustomEvent): void {
    this.filterText.set((event.detail.value as string | undefined) ?? '');
  }

  protected onSearch(event: CustomEvent): void {
    this.searchQuery = (event.detail.value as string | undefined)?.trim() ?? '';
    this.resetAndLoad();
  }

  protected clearSearch(): void {
    this.searchQuery = '';
    this.filterText.set('');
    this.resetAndLoad();
  }

  protected toggleFavorites(): void {
    this.showFavoritesOnly.update((v) => !v);
    this.resetAndLoad();
  }

  protected loadMore(event: InfiniteScrollCustomEvent): void {
    this.currentPage++;
    this.loadWords(false, undefined, event);
  }

  protected openDetail(userWord: UserWord): void {
    this.router.navigate(['/word', userWord.id]);
  }

  private resetAndLoad(refreshEvent?: CustomEvent): void {
    this.currentPage = 1;
    this.words.set([]);
    this.hasMore.set(true);
    this.loadWords(true, refreshEvent);
  }

  private buildQuery(): GetApiWordsParams {
    return {
      page: this.currentPage,
      limit: PAGE_SIZE,
      ...(this.searchQuery && { search: this.searchQuery }),
      ...(this.showFavoritesOnly() && { favorite: true }),
    };
  }

  private loadWords(
    showSpinner: boolean,
    refreshEvent?: CustomEvent,
    infiniteEvent?: InfiniteScrollCustomEvent,
  ): void {
    if (showSpinner) this.isLoading.set(true);

    const onSettled = (): void => {
      this.isLoading.set(false);
      refreshEvent?.detail?.complete?.();
      infiniteEvent?.target?.complete();
    };

    this.wordService.getApiWords(this.buildQuery()).subscribe({
      next: ({ items = [], pagination }) => {
        const updated = showSpinner ? items : [...this.words(), ...items];
        this.words.set(updated);
        this.hasMore.set(
          updated.length < (pagination?.total ?? 0) && items.length === PAGE_SIZE,
        );
        onSettled();
      },
      error: onSettled,
    });
  }
}
