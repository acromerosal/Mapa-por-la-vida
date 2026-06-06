/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ActivityType = 'marcha' | 'cultural' | 'comunitaria' | 'recogida' | 'recorrido' | 'grafica_visual' | 'reunion' | 'cultural_evento' | 'olla_comunitaria';

export interface CitizenEvent {
  id: string;
  name: string;
  activityType: ActivityType;
  scheduledAt: string; // ISO String or date-time
  description: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'approved' | 'reported';
  reportsCount: number;
  createdAt: string;
  likesCount?: number;
  externalUrl?: string;
}

export interface CreateEventRequest {
  name: string;
  activityType: ActivityType;
  scheduledAt: string;
  description: string;
  latitude: number;
  longitude: number;
  externalUrl?: string;
}

export interface SecurityStatus {
  success: boolean;
  message?: string;
  limitReached?: boolean;
}
