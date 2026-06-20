import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { WordService } from '../../core/services/word.service';
import { UserWordPopulated } from '../../core/models/word.model';

@Component({
  selector: 'app-word-detail',
  templateUrl: './word-detail.page.html',
  styleUrls: ['./word-detail.page.scss'],
  standalone: false,
})
export class WordDetailPage implements OnInit {
  userWord: UserWordPopulated | null = null;
  isLoading = true;
  editingNotes = false;
  notesBuffer = '';
  newTag = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private wordService: WordService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.wordService.getOne(id).subscribe({
      next: (data) => {
        this.userWord = data;
        this.notesBuffer = data.notes;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/tabs/dictionary']);
      },
    });
  }

  toggleFavorite(): void {
    if (!this.userWord) return;
    const favorite = !this.userWord.favorite;
    this.wordService.update(this.userWord._id, { favorite }).subscribe({
      next: (updated) => {
        this.userWord = updated;
      },
    });
  }

  startEditingNotes(): void {
    this.notesBuffer = this.userWord?.notes ?? '';
    this.editingNotes = true;
  }

  saveNotes(): void {
    if (!this.userWord) return;
    this.wordService.update(this.userWord._id, { notes: this.notesBuffer }).subscribe({
      next: (updated) => {
        this.userWord = updated;
        this.editingNotes = false;
      },
    });
  }

  cancelEditingNotes(): void {
    this.editingNotes = false;
    this.notesBuffer = this.userWord?.notes ?? '';
  }

  addTag(): void {
    const tag = this.newTag.trim();
    if (!tag || !this.userWord || this.userWord.tags.includes(tag)) {
      this.newTag = '';
      return;
    }
    const tags = [...this.userWord.tags, tag];
    this.wordService.update(this.userWord._id, { tags }).subscribe({
      next: (updated) => {
        this.userWord = updated;
        this.newTag = '';
      },
    });
  }

  removeTag(tag: string): void {
    if (!this.userWord) return;
    const tags = this.userWord.tags.filter((t) => t !== tag);
    this.wordService.update(this.userWord._id, { tags }).subscribe({
      next: (updated) => {
        this.userWord = updated;
      },
    });
  }

  async confirmDelete(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Supprimer ce mot ?',
      message: 'Cette action retirera le mot de votre dictionnaire personnel.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => this.deleteWord(),
        },
      ],
    });
    await alert.present();
  }

  private deleteWord(): void {
    if (!this.userWord) return;
    this.wordService.remove(this.userWord._id).subscribe({
      next: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Mot supprimé.',
          duration: 2000,
          color: 'success',
        });
        await toast.present();
        this.router.navigate(['/tabs/dictionary']);
      },
    });
  }
}
