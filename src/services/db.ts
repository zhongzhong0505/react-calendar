import type { CalendarEvent, CalendarEventData, SaveResult } from '../types';

class CalendarDB {
  private dbName = 'CalendarDB';
  private version = 1;
  private storeName = 'events';
  private db: IDBDatabase | null = null;

  async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB 打开失败:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB 初始化成功');
        resolve(this.db);
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'uid' });
          objectStore.createIndex('startDate', 'startDate', { unique: false });
          objectStore.createIndex('endDate', 'endDate', { unique: false });
          console.log('对象存储空间创建成功');
        }
      };
    });
  }

  async saveEvents(events: CalendarEvent[]): Promise<SaveResult> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      
      let successCount = 0;
      let errorCount = 0;

      events.forEach(event => {
        const eventData: CalendarEventData = {
          uid: event.uid,
          summary: event.summary,
          description: event.description,
          location: event.location,
          startDate: event.startDate.toISOString(),
          endDate: event.endDate.toISOString(),
          isRecurring: event.isRecurring,
          isAllDay: event.isAllDay,
          category: event.category
        };

        const request = objectStore.put(eventData);
        
        request.onsuccess = () => {
          successCount++;
        };
        
        request.onerror = () => {
          errorCount++;
          console.error('保存事件失败:', event.uid, request.error);
        };
      });

      transaction.oncomplete = () => {
        console.log(`成功保存 ${successCount} 个事件，失败 ${errorCount} 个`);
        resolve({ success: successCount, error: errorCount });
      };

      transaction.onerror = () => {
        console.error('事务失败:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  async saveEvent(event: CalendarEvent): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      
      const eventData: CalendarEventData = {
        uid: event.uid,
        summary: event.summary,
        description: event.description,
        location: event.location,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        isRecurring: event.isRecurring,
        isAllDay: event.isAllDay,
        category: event.category
      };

      const request = objectStore.put(eventData);
      
      request.onsuccess = () => {
        console.log('事件保存成功:', event.uid);
        resolve();
      };
      
      request.onerror = () => {
        console.error('保存事件失败:', request.error);
        reject(request.error);
      };
    });
  }

  async getAllEvents(): Promise<CalendarEvent[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const events = (request.result as CalendarEventData[]).map(event => ({
          ...event,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          category: event.category || 'personal'
        }));
        console.log(`从数据库读取 ${events.length} 个事件`);
        resolve(events);
      };

      request.onerror = () => {
        console.error('读取事件失败:', request.error);
        reject(request.error);
      };
    });
  }

  async deleteEvent(uid: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.delete(uid);

      request.onsuccess = () => {
        console.log('事件删除成功:', uid);
        resolve();
      };

      request.onerror = () => {
        console.error('删除事件失败:', request.error);
        reject(request.error);
      };
    });
  }

  async clearAllEvents(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.clear();

      request.onsuccess = () => {
        console.log('所有事件已清空');
        resolve();
      };

      request.onerror = () => {
        console.error('清空事件失败:', request.error);
        reject(request.error);
      };
    });
  }
}

export const db = new CalendarDB();
