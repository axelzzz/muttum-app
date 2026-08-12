import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { filter, switchMap, tap } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chatbubbleOutline,
  star,
  starOutline,
  trashOutline,
} from 'ionicons/icons';
import { WordsService } from '../../core/api/words/words.service';
import { UiService } from '../../ui/ui.service';
import { UserWord } from '../../core/api/model';
import { NotesEditorComponent } from '../../ui/notes-editor/notes-editor.component';
import { TagsEditorComponent } from '../../ui/tags-editor/tags-editor.component';

type LoadedWord = UserWord & { id: string };

@Component({
  selector: 'app-word-detail',
  templateUrl: './word-detail.page.html',
  styleUrl: './word-detail.page.scss',
  imports: [
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonContent,
    IonSkeletonText,
    NotesEditorComponent,
    TagsEditorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WordDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly wordService = inject(WordsService);
  private readonly ui = inject(UiService);
  private readonly title = inject(Title);

  protected readonly userWord = signal<LoadedWord | null>(null);
  protected readonly isLoading = signal(true);

  constructor() {
    addIcons({ star, starOutline, trashOutline, chatbubbleOutline });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.wordService.getApiWordsId(id).subscribe({
      next: (data) => {
        this.userWord.set(data as LoadedWord);
        this.isLoading.set(false);
        this.title.setTitle(`Muttum — Votre dictionnaire personnel — ${(data as LoadedWord).word}`);
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
    this.wordService
      .patchApiWordsId(word.id, { favorite: !word.favorite })
      .subscribe({
        next: (updated) => this.applyUpdate(updated),
      });
  }

  protected onSaveNotes(notes: string): void {
    const word = this.userWord();
    if (!word) return;
    this.wordService.patchApiWordsId(word.id, { notes }).subscribe({
      next: (updated) => this.applyUpdate(updated),
    });
  }

  protected onAddTag(tag: string): void {
    const word = this.userWord();
    if (!word) return;
    this.wordService
      .patchApiWordsId(word.id, { tags: [...(word.tags ?? []), tag] })
      .subscribe({
        next: (updated) => this.applyUpdate(updated),
      });
  }

  protected onRemoveTag(tag: string): void {
    const word = this.userWord();
    if (!word) return;
    this.wordService
      .patchApiWordsId(word.id, {
        tags: (word.tags ?? []).filter((t) => t !== tag),
      })
      .subscribe({
        next: (updated) => this.applyUpdate(updated),
      });
  }

  private applyUpdate(updated: UserWord): void {
    this.userWord.set(updated as LoadedWord);
    this.wordService.notifyWordUpdated(updated);
  }

  protected confirmDelete(): void {
    const word = this.userWord();
    if (!word) return;

    this.ui
      .confirmAction(
        'Supprimer ce mot ?',
        'Cette action retirera le mot de votre dictionnaire personnel.',
        'Supprimer',
      )
      .pipe(
        filter((confirmed) => confirmed),
        switchMap(() => this.wordService.deleteApiWordsId(word.id)),
        tap(() => {
          this.wordService.notifyWordRemoved(word.id);
          this.ui.showToast('Mot supprimé.', 'success').subscribe();
          this.router.navigate(['/tabs/dictionary']);
        }),
      )
      .subscribe();
  }
}
