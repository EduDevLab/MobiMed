import type { Either } from '../../../../core/errors/Either';
import type { Failure } from '../../../../core/errors/Failure';
import type { Reminder } from '../entities/Reminder';

/**
 * Contrato del servicio de notificaciones/alarmas del sistema operativo.
 * El dominio depende solo de esta interfaz, no de librerías nativas.
 */
export interface NotificationScheduler {
  /** Solicita permisos de notificaciones y de alarmas exactas (Android 12+). */
  requestPermissions(): Promise<Either<Failure, void>>;

  /**
   * Programa las alarmas exactas del recordatorio.
   * @param reminder Recordatorio persistido.
   * @param medicineName Nombre del medicamento para mostrar en la alerta.
   */
  schedule(
    reminder: Reminder,
    medicineName: string,
  ): Promise<Either<Failure, void>>;

  /** Cancela todas las alarmas programadas de un recordatorio. */
  cancelReminder(reminderId: string): Promise<Either<Failure, void>>;
}