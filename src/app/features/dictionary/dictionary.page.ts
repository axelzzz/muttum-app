import { Component, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { Router } from '@angular/router';
import { WordService } from '../../core/services/word.service';
import { UserWordPopulated } from '../../core/models/word.model';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-dictionary',
  templateUrl: './dictionary.page.html',
  styleUrls: ['./dictionary.page.scss'],
  standalone: false,
})
export class DictionaryPage implements OnInit {
  words: UserWordPopulated[] = [];
  isLoading = true;
  hasMore = true;
  currentPage = 1;
  searchQuery = '';
  showFavoritesOnly = false;

  constructor(private wordService: WordService, private router: Router) {}

  ngOnInit(): void {
    this.loadWords(true);
  }

  ionViewWillEnter(): void {
    this.refresh();
  }

  refresh(event?: CustomEvent): void {
    this.currentPage = 1;
    this.words = [];
    this.hasMore = true;
    this.loadWords(true, event);
  }

  onSearch(event: CustomEvent): void {
    this.searchQuery = (event.detail.value as string | undefined)?.trim() ?? '';
    this.currentPage = 1;
    this.words = [];
    this.hasMore = true;
    this.loadWords(true);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.refresh();
  }

  toggleFavorites(): void {
    this.showFavoritesOnly = !this.showFavoritesOnly;
    this.currentPage = 1;
    this.words = [];
    this.hasMore = true;
    this.loadWords(true);
  }

  loadMore(event: InfiniteScrollCustomEvent): void {
    this.currentPage++;
    this.loadWords(false, undefined, event);
  }

  openDetail(userWord: UserWordPopulated): void {
    this.router.navigate(['/word', userWord._id]);
  }

  private loadWords(
    showSpinner: boolean,
    refreshEvent?: CustomEvent,
    infiniteEvent?: InfiniteScrollCustomEvent
  ): void {
    if (showSpinner) this.isLoading = true;

    const query: { page: number; limit: number; search?: string } = {
      page: this.currentPage,
      limit: PAGE_SIZE,
    };
    if (this.searchQuery) query.search = this.searchQuery;

    this.wordService.list(query).subscribe({
      next: ({ data, total }) => {
        const filtered = this.showFavoritesOnly ? data.filter((w) => w.favorite) : data;
        this.words = showSpinner ? filtered : [...this.words, ...filtered];
        this.hasMore = this.words.length < total && data.length === PAGE_SIZE;
        this.isLoading = false;
        refreshEvent?.detail?.complete?.();
        infiniteEvent?.target?.complete();
      },
      error: () => {
        this.isLoading = false;
        refreshEvent?.detail?.complete?.();
        infiniteEvent?.target?.complete();
      },
    });
  }
}
