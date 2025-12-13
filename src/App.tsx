import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { CalendarGrid } from './components/CalendarGrid';
import { EventDetailModal } from './components/EventDetailModal';
import { AddEventModal } from './components/AddEventModal';
import { Toast, ToastType } from './components/Toast';
import { ICSParser } from './services/parser';
import { db } from './services/db';
import type { CalendarEvent, ViewMode } from './types';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('success');
  const [isToastVisible, setIsToastVisible] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await db.init();
      console.log('数据库初始化完成');
      
      const savedEvents = await db.getAllEvents();
      if (savedEvents.length > 0) {
        setEvents(savedEvents);
        console.log(`从数据库加载了 ${savedEvents.length} 个事件`);
      }
    } catch (error) {
      console.error('数据库初始化失败:', error);
      alert('数据库初始化失败，数据可能无法保存');
    }
  };

  const showToast = (message: string, type: ToastType = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setIsToastVisible(true);
  };

  const handleImport = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const parser = new ICSParser();
      const parsedEvents = parser.parse(content);
      
      if (parsedEvents.length > 0) {
        try {
          const result = await db.saveEvents(parsedEvents);
          showToast(`成功导入并保存 ${result.success} 个事件`, 'success');
          setEvents([...events, ...parsedEvents]);
          setIsSidebarOpen(false);
        } catch (error) {
          console.error('保存事件失败:', error);
          showToast(`成功导入 ${parsedEvents.length} 个事件，但保存到数据库失败`, 'error');
          setEvents([...events, ...parsedEvents]);
        }
      }
    };
    reader.readAsText(file);
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  const handleDateDoubleClick = (date: Date) => {
    setSelectedDateRange({ start: date, end: date });
    setIsAddModalOpen(true);
  };

  const handleDateRangeSelect = (start: Date, end: Date) => {
    setSelectedDateRange({ start, end });
    setIsAddModalOpen(true);
  };

  const handleSaveEvent = async (eventData: {
    summary: string;
    category: 'work' | 'personal' | 'holiday';
    startDate: Date;
    endDate: Date;
    isAllDay: boolean;
    location: string;
    description: string;
  }) => {
    const newEvent: CalendarEvent = {
      uid: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      summary: eventData.summary,
      description: eventData.description,
      location: eventData.location,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      isRecurring: false,
      isAllDay: eventData.isAllDay,
      category: eventData.category
    };

    try {
      await db.saveEvent(newEvent);
      setEvents([...events, newEvent]);
      setIsAddModalOpen(false);
      setSelectedDateRange(null);
      showToast('事件添加成功！', 'success');
    } catch (error) {
      console.error('保存事件失败:', error);
      showToast('保存事件失败，请重试', 'error');
    }
  };

  const getHeaderText = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    switch (viewMode) {
      case 'day':
        return `${year}年 ${month}月 ${currentDate.getDate()}日`;
      case 'week': {
        const weekStart = new Date(currentDate);
        const day = weekStart.getDay();
        weekStart.setDate(weekStart.getDate() - day);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${year}年 ${month}月 ${weekStart.getDate()}-${weekEnd.getDate()}日`;
        } else {
          return `${year}年 ${weekStart.getMonth() + 1}月${weekStart.getDate()}日 - ${weekEnd.getMonth() + 1}月${weekEnd.getDate()}日`;
        }
      }
      case 'year':
        return `${year}年`;
      default:
        return `${year}年 ${month}月`;
    }
  };

  return (
    <div className={`h-screen w-screen overflow-hidden flex ${isDarkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={() => setIsSidebarOpen(false)}
        onImport={handleImport}
        currentYear={currentDate.getFullYear()}
        currentMonth={currentDate.getMonth()}
        isDarkMode={isDarkMode}
      />

      <main className={`flex-1 flex flex-col relative overflow-hidden w-full lg:w-auto ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        {/* 顶部导航 */}
        <header className={`h-16 backdrop-blur-md border-b flex items-center justify-between px-4 md:px-6 z-10 ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
          <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
            <button
              onClick={() => {
                if (window.innerWidth >= 1024) {
                  setIsSidebarCollapsed(!isSidebarCollapsed);
                } else {
                  setIsSidebarOpen(true);
                }
              }}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
            <h2 className={`text-lg md:text-2xl font-bold truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{getHeaderText()}</h2>
            <div className={`flex items-center rounded-lg p-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <button
                onClick={handlePrevious}
                className={`p-1.5 rounded-md transition-all ${isDarkMode ? 'hover:bg-slate-600 text-slate-400' : 'hover:bg-white hover:shadow-sm text-slate-500'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleToday}
                className={`px-2 md:px-3 py-1 text-xs md:text-sm font-medium hover:text-indigo-600 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
              >
                今天
              </button>
              <button
                onClick={handleNext}
                className={`p-1.5 rounded-md transition-all ${isDarkMode ? 'hover:bg-slate-600 text-slate-400' : 'hover:bg-white hover:shadow-sm text-slate-500'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* 暗色模式切换按钮 */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
              title={isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            <div className={`flex rounded-lg p-1 text-xs md:text-sm font-medium ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <button
                onClick={() => setViewMode('day')}
                className={`px-2 md:px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'day' 
                    ? isDarkMode 
                      ? 'bg-slate-600 text-indigo-400 shadow-sm' 
                      : 'bg-white text-indigo-600 shadow-sm'
                    : isDarkMode
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                日
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-2 md:px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'week' 
                    ? isDarkMode 
                      ? 'bg-slate-600 text-indigo-400 shadow-sm' 
                      : 'bg-white text-indigo-600 shadow-sm'
                    : isDarkMode
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                周
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-2 md:px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'month' 
                    ? isDarkMode 
                      ? 'bg-slate-600 text-indigo-400 shadow-sm' 
                      : 'bg-white text-indigo-600 shadow-sm'
                    : isDarkMode
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                月
              </button>
              <button
                onClick={() => setViewMode('year')}
                className={`px-2 md:px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'year' 
                    ? isDarkMode 
                      ? 'bg-slate-600 text-indigo-400 shadow-sm' 
                      : 'bg-white text-indigo-600 shadow-sm'
                    : isDarkMode
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                年
              </button>
            </div>
          </div>
        </header>

        {/* 日历主体 */}
        <div className="flex-1 flex flex-col overflow-hidden p-2 md:p-6 md:pt-2">
          {/* 星期头 */}
          {viewMode !== 'year' && (
            <div className="grid grid-cols-7 mb-2">
              {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map(day => (
                <div key={day} className={`text-center text-xs md:text-sm font-medium py-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {day}
                </div>
              ))}
            </div>
          )}
          
          {/* 网格 */}
          <div className={`flex-1 rounded-xl md:rounded-2xl shadow-sm border overflow-hidden flex flex-col ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <CalendarGrid
              viewMode={viewMode}
              currentDate={currentDate}
              events={events}
              onEventClick={handleEventClick}
              onDateDoubleClick={handleDateDoubleClick}
              onDateRangeSelect={handleDateRangeSelect}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </main>

      <EventDetailModal
        event={selectedEvent}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedEvent(null);
        }}
        isDarkMode={isDarkMode}
      />

      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedDateRange(null);
        }}
        onSave={handleSaveEvent}
        selectedDateRange={selectedDateRange}
        isDarkMode={isDarkMode}
      />

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

export default App;