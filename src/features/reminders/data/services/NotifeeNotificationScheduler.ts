import { Platform } from 'react-native';
import notifee, {
  AndroidImportance,
  AndroidNotificationSetting,
  AuthorizationStatus,
  TriggerType,
} from '@notifee/react-native';
import {
  left,
  right,
  type Either,
} from '../../../../core/errors/Either';
import {
  NotificationFailure,
  PermissionFailure,
  type Failure,
} from '../../../../core/errors/Failure';
import {
  firstFutureOccurrence,
  formatTime,
  intervalOccurrences,
  parseLocalIso,
  toLocalIso,
} from '../../../../core/utils/dates';
import type { Reminder } from '../../domain/entities/Reminder';
import type { NotificationScheduler } from '../../domain/services/NotificationScheduler';

const CHANNEL_ID = 'medicaciones';
const NOTIFICATION_SMALL_ICON = 'ic_notification';
/** Límite de alarmas programadas simultáneas en Android (~500). */
const MAX_TRIGGERS = 500;
/** Prefijo de los ids de notificación: `recordatorioId::...`. */
const ID_PREFIX_SEPARATOR = '::';

export const reminderTriggerPrefix = (reminderId: string): string =>
  `${reminderId}${ID_PREFIX_SEPARATOR}`;

/**
 * Implementación de notificaciones/alarmas con Notifee basada en intervalos.
 *
 * - Usa AlarmManager (alarmas exactas) mediante `alarmManager: true`.
 * - Alarma exacta requiere SCHEDULE_EXACT_ALARM/USE_EXACT_ALARM en el Manifest.
 * - Algoritmo: cada ocurrencia es t₀ = startDatetime; tₙ₊₁ = tₙ + intervalMinutes,
 *   filtrando los días permitidos por `frequency_days`.
 */
export class NotifeeNotificationScheduler implements NotificationScheduler {
  private channelEnsured = false;

  private async ensureChannel(): Promise<void> {
    if (this.channelEnsured) {
      return;
    }
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Recordatorios de medicación',
      importance: AndroidImportance.HIGH,
    });
    this.channelEnsured = true;
  }

  async requestPermissions(): Promise<Either<Failure, void>> {
    try {
      await this.ensureChannel();

      // Permiso de notificaciones (Android 13+ / iOS).
      const settings = await notifee.requestPermission();
      if (settings.authorizationStatus !== AuthorizationStatus.AUTHORIZED) {
        return left(
          new PermissionFailure(
            'Permiso de notificaciones denegado. Habilítalo en los ajustes del sistema para recibir recordatorios.',
          ),
        );
      }

      // Alarmas exactas (Android 12+ / API 31+).
      if (Platform.OS === 'android' && Number(Platform.Version) >= 31) {
        const androidSettings = await notifee.getNotificationSettings();
        if (
          androidSettings.android.alarm === AndroidNotificationSetting.DISABLED
        ) {
          await notifee.openAlarmPermissionSettings();
          return left(
            new PermissionFailure(
              'Para que los recordatorios suenen a la hora exacta, activa "Alarmas y recordatorios" para MobiMed en los ajustes del sistema.',
            ),
          );
        }
      }

      return right(undefined);
    } catch (error) {
      return left(
        new PermissionFailure(
          'No se pudieron solicitar los permisos de notificación.',
          error,
        ),
      );
    }
  }

  async schedule(
    reminder: Reminder,
    medicineName: string,
  ): Promise<Either<Failure, void>> {
    try {
      await this.ensureChannel();

      const triggerIdPrefix = reminderTriggerPrefix(reminder.id);

      // Si la primera toma ya pasó, se alinea al siguiente instante futuro del
      // calendario (mismo grid) para que intervalos cortos sigan programándose.
      const anchorMs = firstFutureOccurrence(
        parseLocalIso(reminder.startDatetime).getTime(),
        reminder.intervalMinutes,
      );

      const occurrences = intervalOccurrences(
        {
          startDatetime: toLocalIso(new Date(anchorMs)),
          intervalMinutes: reminder.intervalMinutes,
          frequencyDays: reminder.frequencyDays,
          endDate: reminder.endDate,
        },
        MAX_TRIGGERS,
      );

      // Cada ocurrencia es una alarma exacta individual.
      for (const timestamp of occurrences) {
        if (timestamp <= Date.now()) {
          continue;
        }
        await notifee.createTriggerNotification(
          this.buildNotification(
            medicineName,
            timestamp,
            triggerIdPrefix + timestamp,
          ),
          {
            type: TriggerType.TIMESTAMP,
            timestamp,
            alarmManager: true,
          },
        );
      }

      return right(undefined);
    } catch (error) {
      return left(
        new NotificationFailure(
          'No se pudieron programar las alarmas del recordatorio.',
          error,
        ),
      );
    }
  }

  async cancelReminder(reminderId: string): Promise<Either<Failure, void>> {
    try {
      const scheduled = await notifee.getTriggerNotificationIds();
      const prefix = reminderTriggerPrefix(reminderId);
      const toCancel = scheduled.filter(id => id.startsWith(prefix));
      await Promise.all(
        toCancel.map(id => notifee.cancelTriggerNotification(id)),
      );
      return right(undefined);
    } catch (error) {
      return left(
        new NotificationFailure(
          'No se pudieron cancelar las alarmas del recordatorio.',
          error,
        ),
      );
    }
  }

  private buildNotification(
    medicineName: string,
    timestamp: number,
    id: string,
  ) {
    return {
      id,
      title: '💊 Hora de tu medicación',
      body: `${medicineName} · ${formatTime(new Date(timestamp))}`,
      android: {
        channelId: CHANNEL_ID,
        smallIcon: NOTIFICATION_SMALL_ICON,
        pressAction: {
          id: 'default',
        },
      },
    };
  }
}