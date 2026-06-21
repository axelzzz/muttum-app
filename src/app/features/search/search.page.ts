import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, catchError, tap } from 'rxjs';
import {
  IonBadge,
  IonButton,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonSearchbar,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline, helpCircleOutline, openOutline, searchOutline, star, starOutline } from 'ionicons/icons';
import { WordsService } from '../../core/api/words/words.service';
import { SearchResult } from '../../core/api/model';
import { UiService } from '../../ui/ui.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  imports: [
    IonHeader, IonToolbar, IonTitle, IonSearchbar, IonContent,
    IonSkeletonText, IonBadge, IonButton, IonIcon, IonChip, IonLabel,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPage {
  private readonly wordService = inject(WordsService);
  private readonly ui = inject(UiService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal(false);
  protected readonly result = signal<SearchResult | null>(null);
  protected readonly notFound = signal(false);
  protected readonly lastQuery = signal('');

  constructor() {
    addIcons({ searchOutline, helpCircleOutline, openOutline, star, starOutline, createOutline });
  }

  protected search(event: CustomEvent): void {
    const query = (event.detail.value as string | undefined)?.trim() ?? '';
    if (!query || query === this.lastQuery()) return;

    this.lastQuery.set(query);
    this.isLoading.set(true);
    this.result.set(null);
    this.notFound.set(false);

    this.wordService.getApiWordsSearch({ word: query }).pipe(
      tap(userWord => {
        this.isLoading.set(false);
        this.result.set(userWord);
      }),
      catchError((err: { status?: number }) => {
        this.isLoading.set(false);
        if (err.status === 404) {
          this.notFound.set(true);
          return EMPTY;
        }
        return this.ui.showToast('Impossible de contacter le dictionnaire.');
      })
    ).subscribe();
  }

  protected clearSearch(): void {
    this.result.set(null);
    this.notFound.set(false);
    this.lastQuery.set('');
  }

  protected openDetail(result: SearchResult): void {
    this.router.navigate(['/word', result.id]);
  }
}
