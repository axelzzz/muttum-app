import { Injectable, inject } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class UiService {
  private readonly loadingCtrl = inject(LoadingController);
  private readonly toastCtrl = inject(ToastController);
  private readonly alertCtrl = inject(AlertController);

  async showLoading(message: string): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingCtrl.create({ message });
    await loading.present();
    return loading;
  }

  async showToast(message: string, color: 'danger' | 'success' | 'warning' = 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color, position: 'bottom' });
    await toast.present();
  }

  async confirmAction(header: string, message: string, confirmLabel: string): Promise<boolean> {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: confirmLabel, role: 'destructive' },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'destructive';
  }
}
