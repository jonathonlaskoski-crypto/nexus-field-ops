// Haptic Feedback Service - Provides tactile feedback for mobile interactions
// Created by NVIDIA AI Squad

import { Haptics, ImpactStyle, NotificationStyle, NotificationType } from '@capacitor/haptics';

export class HapticService {
  private static isAvailable = true;

  /**
   * Light impact feedback (for button presses, selections)
   */
  static async impact(light = true): Promise<void> {
    if (!this.isAvailable) return;

    try {
      await Haptics.impact({
        style: light ? ImpactStyle.Light : ImpactStyle.Medium
      });
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
      this.isAvailable = false;
    }
  }

  /**
   * Heavy impact feedback (for important actions)
   */
  static async heavyImpact(): Promise<void> {
    if (!this.isAvailable) return;

    try {
      await Haptics.impact({
        style: ImpactStyle.Heavy
      });
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
      this.isAvailable = false;
    }
  }

  /**
   * Notification feedback (for success, warning, error states)
   */
  static async notification(type: 'success' | 'warning' | 'error'): Promise<void> {
    if (!this.isAvailable) return;

    try {
      const notificationType: NotificationType = 
        type === 'success' ? NotificationType.Success :
        type === 'warning' ? NotificationType.Warning :
        NotificationType.Error;

      await Haptics.notification({
        type: notificationType
      });
    } catch (error) {
      console.warn('Haptic notification not available:', error);
      this.isAvailable = false;
    }
  }

  /**
   * Selection feedback (for picking items from a list)
   */
  static async selectionStart(): Promise<void> {
    if (!this.isAvailable) return;

    try {
      await Haptics.selectionStart();
    } catch (error) {
      console.warn('Haptic selection not available:', error);
      this.isAvailable = false;
    }
  }

  /**
   * Selection changed feedback
   */
  static async selectionChanged(): Promise<void> {
    if (!this.isAvailable) return;

    try {
      await Haptics.selectionChanged();
    } catch (error) {
      console.warn('Haptic selection not available:', error);
      this.isAvailable = false;
    }
  }

  /**
   * Selection end feedback
   */
  static async selectionEnd(): Promise<void> {
    if (!this.isAvailable) return;

    try {
      await Haptics.selectionEnd();
    } catch (error) {
      console.warn('Haptic selection not available:', error);
      this.isAvailable = false;
    }
  }
}
