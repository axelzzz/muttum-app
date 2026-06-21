import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonSkeletonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, chatbubbleOutline, closeOutline, createOutline, star, starOutline, trashOutline } from 'ionicons/icons';
import { WordsService } from '../../core/api/words/words.service';
import { UserWord } from '../../core/api/model';

@Component({
  selector: 'app-word-detail',
  templateUrl: './word-detail.page.html',
  imports: [
    DatePipe,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonIcon,
    IonContent, IonSkeletonText, IonItem, IonInput, IonTextarea,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WordDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly wordService = inject(WordsService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  protected readonly userWord = signal<UserWord | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly editingNotes = signal(false);
  protected readonly notesBuffer = signal('');
  protected readonly newTag = signal('');

  constructor() {
    addIcons({ star, starOutline, chatbubbleOutline, closeOutline, addOutline, createOutline, trashOutline });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.wordService.getApiWordsId(id).subscribe({
      next: (data) => {
        this.userWord.set(data);
        this.notesBuffer.set(data.notes ?? '');
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/tabs/dictionary']);
      },
    });
  }

  protected toggleFavorite(): void {
    const word = this.userWord();
    if (!word) return;
    this.wordService.patchApiWordsId(word.id!, { favorite: !word.favorite }).subscribe({
      next: (updated) => this.userWord.set(updated),
    });
  }

  protected startEditingNotes(): void {
    this.notesBuffer.set(this.userWord()?.notes ?? '');
    this.editingNotes.set(true);
  }

  protected saveNotes(): void {
    const word = this.userWord();
    if (!word) return;
    this.wordService.patchApiWordsId(word.id!, { notes: this.notesBuffer() }).subscribe({
      next: (updated) => {
        this.userWord.set(updated);
        this.editingNotes.set(false);
      },
    });
  }

  protected cancelEditingNotes(): void {
    this.editingNotes.set(false);
    this.notesBuffer.set(this.userWord()?.notes ?? '');
  }

  protected addTag(): void {
    const tag = this.newTag().trim();
    const word = this.userWord();
    if (!tag || !word || word.tags?.includes(tag)) {
      this.newTag.set('');
      return;
    }
    this.wordService.patchApiWordsId(word.id!, { tags: [...(word.tags ?? []), tag] }).subscribe({
      next: (updated) => {
        this.userWord.set(updated);
        this.newTag.set('');
      },
    });
  }

  protected removeTag(tag: string): void {
    const word = this.userWord();
    if (!word) return;
    this.wordService.patchApiWordsId(word.id!, { tags: (word.tags ?? []).filter((t) => t !== tag) }).subscribe({
      next: (updated) => this.userWord.set(updated),
    });
  }

  protected async confirmDelete(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Supprimer ce mot ?',
      message: 'Cette action retirera le mot de votre dictionnaire personnel.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Supprimer', role: 'destructive', handler: () => this.deleteWord() },
      ],
    });
    await alert.present();
  }

  private deleteWord(): void {
    const word = this.userWord();
    if (!word) return;
    this.wordService.deleteApiWordsId(word.id!).subscribe({
      next: async () => {
        const toast = await this.toastCtrl.create({ message: 'Mot supprimé.', duration: 2000, color: 'success' });
        await toast.present();
        this.router.navigate(['/tabs/dictionary']);
      },
    });
  }

  protected onNewTagInput(event: CustomEvent<{ value: string }>): void {
    this.newTag.set(event.detail.value ?? '');
  }

  protected onNotesInput(event: CustomEvent<{ value: string }>): void {
    this.notesBuffer.set(event.detail.value ?? '');
  }
}
