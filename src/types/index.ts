export type ViewMode = 'day' | 'week' | 'month' | 'year';

export type EventCategory = 'work' | 'personal' | 'holiday';

export interface CalendarEvent {
  uid: string;
  summary: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  isRecurring: boolean;
  isAllDay: boolean;
  category?: EventCategory;
}

export interface CalendarEventData {
  uid: string;
  summary: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  isRecurring: boolean;
  isAllDay: boolean;
  category?: EventCategory;
}

export interface GridCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export interface UserInfo {
  Timestamp: string;
  EngName: string;
  ChnName: string;
  DeptNameString: string;
  WorkPlaceID: number;
  PositionName: string;
}

export interface SaveResult {
  success: number;
  error: number;
}
