import { Component, ViewChild } from '@angular/core';
import { IonSearchbar, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { WordService } from '../../core/services/word.service';
import { UserWordPopulated } from '../../core/models/word.model';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: false,
})
export class SearchPage {
  @ViewChild('searchbar') searchbar!: IonSearchbar;

  isLoading = false;
  result: UserWordPopulated | null = null;
  notFound = false;
  lastQuery = '';

  constructor(
    private wordService: WordService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  async search(event: CustomEvent): Promise<void> {
    const query = (event.detail.value as string | undefined)?.trim() ?? '';
    if (!query || query === this.lastQuery) return;

    this.lastQuery = query;
    this.isLoading = true;
    this.result = null;
    this.notFound = false;

    this.wordService.search(query).subscribe({
      next: (userWord) => {
        this.isLoading = false;
        this.result = userWord;
      },
      error: async (err) => {
        this.isLoading = false;
        if (err.status === 404) {
          this.notFound = true;
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

  clearSearch(): void {
    this.result = null;
    this.notFound = false;
    this.lastQuery = '';
  }

  openDetail(userWord: UserWordPopulated): void {
    this.router.navigate(['/word', userWord._id]);
  }
}
