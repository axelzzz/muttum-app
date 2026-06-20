import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import {
  IonButton,
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
  IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookOutline, chevronForwardOutline, star, starOutline } from 'ionicons/icons';
import { WordService } from '../../core/services/word.service';
import { UserWordPopulated } from '../../core/models/word.model';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-dictionary',
  templateUrl: './dictionary.page.html',
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonSearchbar, IonContent, IonRefresher, IonRefresherContent,
    IonSkeletonText, IonInfiniteScroll, IonInfiniteScrollContent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DictionaryPage implements OnInit {
  private readonly wordService = inject(WordService);
  private readonly router = inject(Router);

  protected readonly words = signal<UserWordPopulated[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly hasMore = signal(true);
  protected readonly showFavoritesOnly = signal(false);

  private currentPage = 1;
  private searchQuery = '';

  constructor() {
    addIcons({ star, starOutline, bookOutline, chevronForwardOutline });
  }

  ngOnInit(): void {
    this.loadWords(true);
  }

  ionViewWillEnter(): void {
    this.refresh();
  }

  protected refresh(event?: CustomEvent): void {
    this.currentPage = 1;
    this.words.set([]);
    this.hasMore.set(true);
    this.loadWords(true, event);
  }

  protected onSearch(event: CustomEvent): void {
    this.searchQuery = (event.detail.value as string | undefined)?.trim() ?? '';
    this.currentPage = 1;
    this.words.set([]);
    this.hasMore.set(true);
    this.loadWords(true);
  }

  protected clearSearch(): void {
    this.searchQuery = '';
    this.refresh();
  }

  protected toggleFavorites(): void {
    this.showFavoritesOnly.update(v => !v);
    this.currentPage = 1;
    this.words.set([]);
    this.hasMore.set(true);
    this.loadWords(true);
  }

  protected loadMore(event: InfiniteScrollCustomEvent): void {
    this.currentPage++;
    this.loadWords(false, undefined, event);
  }

  protected openDetail(userWord: UserWordPopulated): void {
    this.router.navigate(['/word', userWord._id]);
  }

  private loadWords(
    showSpinner: boolean,
    refreshEvent?: CustomEvent,
    infiniteEvent?: InfiniteScrollCustomEvent
  ): void {
    if (showSpinner) this.isLoading.set(true);

    const query: { page: number; limit: number; search?: string } = {
      page: this.currentPage,
      limit: PAGE_SIZE,
    };
    if (this.searchQuery) query.search = this.searchQuery;

    this.wordService.list(query).subscribe({
      next: ({ data = [], total }) => {
        const filtered = this.showFavoritesOnly() ? data.filter((w) => w.favorite) : data;
        this.words.set(showSpinner ? filtered : [...this.words(), ...filtered]);
        this.hasMore.set(this.words().length < total && data.length === PAGE_SIZE);
        this.isLoading.set(false);
        refreshEvent?.detail?.complete?.();
        infiniteEvent?.target?.complete();
      },
      error: () => {
        this.isLoading.set(false);
        refreshEvent?.detail?.complete?.();
        infiniteEvent?.target?.complete();
      },
    });
  }
}
