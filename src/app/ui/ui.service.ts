import { Injectable, inject } from '@angular/core';
import { Observable, from, map, switchMap } from 'rxjs';
import { AlertController, LoadingController, ToastController } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class UiService {
  private readonly loadingCtrl = inject(LoadingController);
  private readonly toastCtrl = inject(ToastController);
  private readonly alertCtrl = inject(AlertController);

  showLoading(message: string): Observable<HTMLIonLoadingElement> {
    return from(this.loadingCtrl.create({ message })).pipe(
      switchMap(loading => from(loading.present()).pipe(map(() => loading)))
    );
  }

  showToast(message: string, color: 'danger' | 'success' | 'warning' = 'danger'): Observable<void> {
    return from(this.toastCtrl.create({ message, duration: 3000, color, position: 'bottom' })).pipe(
      switchMap(toast => from(toast.present()))
    );
  }

  confirmAction(header: string, message: string, confirmLabel: string): Observable<boolean> {
    return from(
      this.alertCtrl.create({
        header,
        message,
        buttons: [
          { text: 'Annuler', role: 'cancel' },
          { text: confirmLabel, role: 'destructive' },
        ],
      })
    ).pipe(
      switchMap(alert =>
        from(alert.present()).pipe(
          switchMap(() => from(alert.onDidDismiss())),
          map(({ role }) => role === 'destructive')
        )
      )
    );
  }
}
