import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { IonButton, IonIcon, IonInput, IonItem } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tags-editor',
  templateUrl: './tags-editor.component.html',
  styleUrl: './tags-editor.component.scss',
  imports: [IonButton, IonIcon, IonInput, IonItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsEditorComponent {
  readonly tags = input<string[]>([]);
  readonly addTag = output<string>();
  readonly removeTag = output<string>();

  protected readonly newTag = signal('');

  constructor() {
    addIcons({ addOutline, closeOutline });
  }

  protected onInput(event: CustomEvent<{ value: string }>): void {
    this.newTag.set(event.detail.value ?? '');
  }

  protected onAddTag(): void {
    const tag = this.newTag().trim();
    if (!tag || this.tags().includes(tag)) {
      this.newTag.set('');
      return;
    }
    this.addTag.emit(tag);
    this.newTag.set('');
  }
}
