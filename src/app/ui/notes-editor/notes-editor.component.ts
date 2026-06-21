import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { IonButton, IonIcon, IonTextarea } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline } from 'ionicons/icons';

@Component({
  selector: 'app-notes-editor',
  templateUrl: './notes-editor.component.html',
  styleUrl: './notes-editor.component.scss',
  imports: [IonButton, IonIcon, IonTextarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesEditorComponent {
  readonly notes = input<string>('');
  readonly save = output<string>();

  protected readonly isEditing = signal(false);
  protected readonly buffer = signal('');

  constructor() {
    addIcons({ createOutline });
  }

  protected startEditing(): void {
    this.buffer.set(this.notes());
    this.isEditing.set(true);
  }

  protected cancelEditing(): void {
    this.isEditing.set(false);
  }

  protected onInput(event: CustomEvent<{ value: string }>): void {
    this.buffer.set(event.detail.value ?? '');
  }

  protected confirmSave(): void {
    this.save.emit(this.buffer());
    this.isEditing.set(false);
  }
}
