import type { CalendarEvent, EventCategory } from '../types';

declare const ICAL: any;

export class ICSParser {
  private categorizeEvent(summary: string, description: string): EventCategory {
    const text = (summary + ' ' + description).toLowerCase();
    
    const holidayKeywords = ['假期', '休假', '放假', '节日', '春节', '国庆', '中秋', '端午', '清明', '元旦', 'holiday', 'vacation'];
    if (holidayKeywords.some(keyword => text.includes(keyword))) {
      return 'holiday';
    }
    
    const workKeywords = ['会议', '项目', '评审', '汇报', '培训', '出差', '客户', '团队', 'meeting', 'project', 'work'];
    if (workKeywords.some(keyword => text.includes(keyword))) {
      return 'work';
    }
    
    return 'personal';
  }

  parse(icsContent: string): CalendarEvent[] {
    try {
      const jcalData = ICAL.parse(icsContent);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp.getAllSubcomponents('vevent');

      const events = vevents.map((vevent: any) => {
        const event = new ICAL.Event(vevent);
        
        let startDate: Date;
        if (event.startDate.isDate) {
          startDate = new Date(event.startDate.year, event.startDate.month - 1, event.startDate.day);
        } else {
          startDate = event.startDate.toJSDate();
        }

        let endDate: Date;
        if (event.endDate) {
          if (event.endDate.isDate) {
            endDate = new Date(event.endDate.year, event.endDate.month - 1, event.endDate.day);
          } else {
            endDate = event.endDate.toJSDate();
          }
        } else {
          endDate = new Date(startDate);
          if (event.startDate.isDate) {
            endDate.setDate(endDate.getDate() + 1);
          }
        }

        const category = this.categorizeEvent(event.summary || '', event.description || '');

        return {
          uid: event.uid,
          summary: event.summary,
          description: event.description,
          location: event.location,
          startDate: startDate,
          endDate: endDate,
          isRecurring: event.isRecurring(),
          isAllDay: event.startDate.isDate,
          category: category
        };
      });

      console.log(`Parsed ${events.length} events.`);
      return events;
    } catch (e) {
      console.error('Error parsing ICS:', e);
      alert('解析 ICS 文件失败，请检查文件格式。');
      return [];
    }
  }
}
