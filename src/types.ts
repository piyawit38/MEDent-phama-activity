/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'word' | 'powerpoint' | 'image';
  dataUrl: string; // Base64 data or external URL
}

export interface Activity {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (Optional for multi-day activities)
  time: string; // e.g., "09:00 - 16:30 น."
  location: string;
  status: 'open' | 'closed';
  coverImage: string; // Base64 or URL
  gallery: string[]; // List of Base64 or URLs
  description: string;
  googleMaps?: string;
  thingsToPrepare?: string;
  coordinator?: string;
  phone?: string;
  createdAt: string;
  attachments: Attachment[];
}

export interface Registration {
  id: string;
  activityId: string;
  activityTitle: string;
  studentName: string;
  parentName: string;
  phone: string;
  school?: string;
  grade?: string;
  intent: 'join' | 'cannot_join';
  remarks?: string;
  registeredAt: string; // ISO date string
}

export interface ActivityQA {
  id: string;
  activityId: string;
  authorName: string;
  authorRole: 'parent' | 'admin';
  question: string;
  answer?: string;
  answeredAt?: string;
  createdAt: string; // ISO string
}

