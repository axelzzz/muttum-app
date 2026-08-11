import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
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
  IonProgressBar,
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

type LoadMode = 'blocking' | 'background' | 'append';

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
    IonProgressBar,
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
  protected readonly isSearching = signal(false);
  protected readonly hasMore = signal(true);
  protected readonly showFavoritesOnly = signal(false);
  protected readonly searchQuery = signal('');

  private currentPage = 1;
  private latestRequestId = 0;

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
    this.loadWords('blocking');
  }

  ionViewWillEnter(): void {
    this.resetAndLoad('blocking');
  }

  protected refresh(event?: CustomEvent): void {
    this.resetAndLoad('blocking', event);
  }

  protected onSearchInput(event: CustomEvent): void {
    this.searchQuery.set((event.detail.value as string | undefined) ?? '');
    this.resetAndLoad('background');
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
    this.resetAndLoad('background');
  }

  protected toggleFavorites(): void {
    this.showFavoritesOnly.update((v) => !v);
    this.resetAndLoad('background');
  }

  protected loadMore(event: InfiniteScrollCustomEvent): void {
    this.currentPage++;
    this.loadWords('append', undefined, event);
  }

  protected openDetail(userWord: UserWord): void {
    this.router.navigate(['/word', userWord.id]);
  }

  private resetAndLoad(mode: 'blocking' | 'background', refreshEvent?: CustomEvent): void {
    this.currentPage = 1;
    this.hasMore.set(true);
    this.loadWords(mode, refreshEvent);
  }

  private buildQuery(): GetApiWordsParams {
    const trimmedQuery = this.searchQuery().trim();
    return {
      page: this.currentPage,
      limit: PAGE_SIZE,
      ...(trimmedQuery && { search: trimmedQuery }),
      ...(this.showFavoritesOnly() && { favorite: true }),
    };
  }

  private loadWords(
    mode: LoadMode,
    refreshEvent?: CustomEvent,
    infiniteEvent?: InfiniteScrollCustomEvent,
  ): void {
    if (mode === 'blocking') this.isLoading.set(true);
    if (mode === 'background') this.isSearching.set(true);

    const requestId = ++this.latestRequestId;

    const onSettled = (): void => {
      if (mode === 'blocking') this.isLoading.set(false);
      if (mode === 'background') this.isSearching.set(false);
      refreshEvent?.detail?.complete?.();
      infiniteEvent?.target?.complete();
    };

    this.wordService.getApiWords(this.buildQuery()).subscribe({
      next: ({ items = [], pagination }) => {
        // A slower, now-superseded request must not overwrite results from a
        // request issued after it (e.g. fast typing racing the debounced search).
        if (requestId === this.latestRequestId) {
          const updated = mode === 'append' ? [...this.words(), ...items] : items;
          this.words.set(updated);
          this.hasMore.set(
            updated.length < (pagination?.total ?? 0) && items.length === PAGE_SIZE,
          );
        }
        onSettled();
      },
      error: onSettled,
    });
  }
}
