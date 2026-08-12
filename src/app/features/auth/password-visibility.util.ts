import { Signal, signal } from '@angular/core';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';

interface PasswordVisibility {
  isVisible: Signal<boolean>;
  toggle: () => void;
}

export function createPasswordVisibility(): PasswordVisibility {
  addIcons({ eyeOutline, eyeOffOutline });
  const isVisible = signal(false);
  return {
    isVisible: isVisible.asReadonly(),
    toggle: (): void => isVisible.update((value) => !value),
  };
}
