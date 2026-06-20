import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
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
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline, helpCircleOutline, openOutline, searchOutline, star, starOutline } from 'ionicons/icons';
import { WordService } from '../../core/services/word.service';
import { UserWordPopulated } from '../../core/models/word.model';

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
  private readonly wordService = inject(WordService);
  private readonly toastCtrl = inject(ToastController);
  private readonly router = inject(Router);

  protected readonly isLoading = signal(false);
  protected readonly result = signal<UserWordPopulated | null>(null);
  protected readonly notFound = signal(false);
  protected readonly lastQuery = signal('');

  constructor() {
    addIcons({ searchOutline, helpCircleOutline, openOutline, star, starOutline, createOutline });
  }

  protected async search(event: CustomEvent): Promise<void> {
    const query = (event.detail.value as string | undefined)?.trim() ?? '';
    if (!query || query === this.lastQuery()) return;

    this.lastQuery.set(query);
    this.isLoading.set(true);
    this.result.set(null);
    this.notFound.set(false);

    this.wordService.search(query).subscribe({
      next: (userWord) => {
        this.isLoading.set(false);
        this.result.set(userWord);
      },
      error: async (err) => {
        this.isLoading.set(false);
        if (err.status === 404) {
          this.notFound.set(true);
          return;
        }
        const toast = await this.toastCtrl.create({
          message: 'Impossible de contacter le dictionnaire.',
          duration: 3000,
          color: 'danger',
        });
        await toast.present();
      },
    });
  }

  protected clearSearch(): void {
    this.result.set(null);
    this.notFound.set(false);
    this.lastQuery.set('');
  }

  protected openDetail(userWord: UserWordPopulated): void {
    this.router.navigate(['/word', userWord._id]);
  }
}
