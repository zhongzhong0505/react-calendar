import React, { useRef } from 'react';
import type { CalendarEvent, ViewMode, GridCell, EventCategory } from '../types';
import { getMonthDays, getFirstDayOfMonth } from '../utils/dateUtils';

interface CalendarGridProps {
  viewMode: ViewMode;
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateDoubleClick: (date: Date) => void;
  onDateRangeSelect?: (start: Date, end: Date) => void;
  isDarkMode: boolean;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  viewMode,
  currentDate,
  events,
  onEventClick,
  onDateDoubleClick,
  onDateRangeSelect,
  isDarkMode
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [selectionStart, setSelectionStart] = React.useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = React.useState<Date | null>(null);

  const isDateInSelection = (date: Date): boolean => {
    if (!selectionStart || !selectionEnd) return false;
    const cellDate = new Date(date);
    cellDate.setHours(0, 0, 0, 0);
    const start = new Date(Math.min(selectionStart.getTime(), selectionEnd.getTime()));
    start.setHours(0, 0, 0, 0);
    const end = new Date(Math.max(selectionStart.getTime(), selectionEnd.getTime()));
    end.setHours(0, 0, 0, 0);
    return cellDate >= start && cellDate <= end;
  };

  const handleMouseDown = (date: Date) => {
    if (viewMode === 'year') return;
    setIsSelecting(true);
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    setSelectionStart(newDate);
    setSelectionEnd(newDate);
  };

  const handleMouseEnter = (date: Date) => {
    if (!isSelecting || viewMode === 'year') return;
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    setSelectionEnd(newDate);
  };

  const handleMouseUp = () => {
    if (!isSelecting || !selectionStart || !selectionEnd) {
      setIsSelecting(false);
      return;
    }
    
    const start = new Date(Math.min(selectionStart.getTime(), selectionEnd.getTime()));
    const end = new Date(Math.max(selectionStart.getTime(), selectionEnd.getTime()));
    
    // 如果选择了日期范围，调用回调函数
    if (onDateRangeSelect && (start.getTime() !== end.getTime())) {
      onDateRangeSelect(start, end);
    }
    
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting) {
        handleMouseUp();
      }
    };
    
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isSelecting, selectionStart, selectionEnd]);

  const getCategoryColors = (category: EventCategory = 'personal') => {
    const colors = {
      work: {
        allDay: { gradient: ['from-indigo-500', 'to-purple-500'], text: 'text-white' },
        timed: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-500' }
      },
      personal: {
        allDay: { gradient: ['from-emerald-500', 'to-teal-500'], text: 'text-white' },
        timed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-500' }
      },
      holiday: {
        allDay: { gradient: ['from-amber-500', 'to-orange-500'], text: 'text-white' },
        timed: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-500' }
      }
    };
    return colors[category] || colors.personal;
  };

  const generateGrid = (): GridCell[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (viewMode === 'day') {
      const date = new Date(currentDate);
      date.setHours(0, 0, 0, 0);
      return [{
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString()
      }];
    }

    if (viewMode === 'week') {
      const grid: GridCell[] = [];
      const weekStart = new Date(currentDate);
      const day = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - day);
      weekStart.setHours(0, 0, 0, 0);

      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        grid.push({
          date,
          isCurrentMonth: date.getMonth() === month,
          isToday: date.toDateString() === today.toDateString()
        });
      }
      return grid;
    }

    // 月视图
    const daysInMonth = getMonthDays(year, month);
    const firstDayIndex = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getMonthDays(year, month - 1);
    const grid: GridCell[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      grid.push({ date, isCurrentMonth: false, isToday: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      grid.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString()
      });
    }

    const remainingCells = 42 - grid.length;
    for (let i = 1; i <= remainingCells; i++) {
      grid.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        isToday: false
      });
    }

    return grid;
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const cellDate = new Date(date);
    cellDate.setHours(0, 0, 0, 0);
    const cellNextDay = new Date(cellDate);
    cellNextDay.setDate(cellDate.getDate() + 1);

    return events.filter(event => {
      if (event.isAllDay) {
        return cellDate >= event.startDate && cellDate < event.endDate;
      } else {
        return event.startDate < cellNextDay && event.endDate > cellDate;
      }
    }).sort((a, b) => {
      if (a.isAllDay && !b.isAllDay) return -1;
      if (!a.isAllDay && b.isAllDay) return 1;
      return a.startDate.getTime() - b.startDate.getTime();
    });
  };

  const renderCell = (cellData: GridCell) => {
    const dayEvents = getEventsForDate(cellData.date);
    const isMobile = window.innerWidth < 768;
    const isWeekView = viewMode === 'week';
    const isDayView = viewMode === 'day';
    const isInSelection = isDateInSelection(cellData.date);
    
    let maxEvents = isMobile ? 2 : 4;
    if (isDayView) {
      maxEvents = isMobile ? 15 : 30;
    } else if (isWeekView) {
      maxEvents = isMobile ? 5 : 10;
    }

    const displayEvents = dayEvents.slice(0, maxEvents);

    return (
      <div
        key={cellData.date.toISOString()}
        className={`calendar-cell p-1 md:p-2 ${
          isWeekView ? 'min-h-[200px] md:min-h-[400px]' : 'min-h-[80px] md:min-h-[120px]'
        } flex flex-col relative transition-colors ${
          isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
        } ${
          cellData.isCurrentMonth 
            ? isDarkMode ? 'bg-slate-800' : 'bg-white'
            : isDarkMode ? 'bg-slate-900/50 text-slate-600' : 'bg-slate-50/50 text-slate-400'
        } ${isInSelection ? isDarkMode ? '!bg-indigo-900/50 !border-2 !border-indigo-500' : '!bg-indigo-100 !border-2 !border-indigo-400' : ''}`}
        onDoubleClick={() => onDateDoubleClick(cellData.date)}
        onMouseDown={() => handleMouseDown(cellData.date)}
        onMouseEnter={() => handleMouseEnter(cellData.date)}
        style={{ userSelect: 'none' }}
      >
        <span
          className={`text-xs md:text-sm font-medium flex items-center justify-center mb-1 transition-all ${
            cellData.isToday 
              ? `bg-indigo-600 text-white rounded-full w-6 h-6 md:w-8 md:h-8 ${
                  isDarkMode ? 'shadow-lg shadow-indigo-500/30' : 'shadow-md shadow-indigo-200'
                }` 
              : cellData.date.getDate() === 1
                ? `w-auto px-1 md:px-2 h-6 md:h-8 rounded-lg text-[9px] md:text-xs whitespace-nowrap ${
                    isDarkMode ? 'text-slate-300 bg-slate-700' : 'text-slate-700 bg-slate-100'
                  }`
                : `w-6 h-6 md:w-8 md:h-8 rounded-full ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`
          }`}
        >
          {cellData.date.getDate() === 1
            ? `${cellData.date.getMonth() + 1}月1日`
            : cellData.date.getDate()}
        </span>

        {displayEvents.map(event => {
          const colors = getCategoryColors(event.category);
          return (
            <div
              key={event.uid}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(event);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
              }}
              className={`text-[10px] md:text-xs mb-1 md:mb-1.5 px-1 md:px-2 py-0.5 md:py-1 rounded-md cursor-pointer truncate transition-all hover:opacity-80 shadow-sm ${
                event.isAllDay
                  ? `bg-gradient-to-r ${colors.allDay.gradient.join(' ')} ${colors.allDay.text} font-medium`
                  : `${colors.timed.bg} ${colors.timed.text} border-l-2 ${colors.timed.border}`
              }`}
            >
              {!event.isAllDay && !isMobile && event.startDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' '}
              {event.summary}
            </div>
          );
        })}

        {dayEvents.length > maxEvents && (
          <div className={`text-[10px] md:text-xs px-1 font-medium hover:text-indigo-500 cursor-pointer ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            + {dayEvents.length - maxEvents}
          </div>
        )}
      </div>
    );
  };

  if (viewMode === 'year') {
    return (
      <div className="calendar-grid year-view flex-1 overflow-y-auto">
        <YearView currentDate={currentDate} events={events} isDarkMode={isDarkMode} />
      </div>
    );
  }

  const grid = generateGrid();
  const gridClass = viewMode === 'day' ? 'day-view' : viewMode === 'week' ? 'week-view' : '';

  return (
    <div ref={gridRef} className={`calendar-grid flex-1 overflow-y-auto ${gridClass}`}>
      {grid.map(cellData => renderCell(cellData))}
    </div>
  );
};

// 年视图组件
const YearView: React.FC<{
  currentDate: Date;
  events: CalendarEvent[];
  isDarkMode: boolean;
}> = ({ currentDate, events, isDarkMode }) => {
  const year = currentDate.getFullYear();
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  const generateMonthGrid = (monthIndex: number): GridCell[] => {
    const daysInMonth = getMonthDays(year, monthIndex);
    const firstDayIndex = getFirstDayOfMonth(year, monthIndex);
    const daysInPrevMonth = getMonthDays(year, monthIndex - 1);
    const grid: GridCell[] = [];
    const today = new Date();

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      grid.push({
        date: new Date(year, monthIndex - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
        isToday: false
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, monthIndex, i);
      grid.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString()
      });
    }

    const remainingCells = 42 - grid.length;
    for (let i = 1; i <= remainingCells; i++) {
      grid.push({
        date: new Date(year, monthIndex + 1, i),
        isCurrentMonth: false,
        isToday: false
      });
    }

    return grid;
  };

  const hasEventsOnDate = (date: Date): boolean => {
    const cellDate = new Date(date);
    cellDate.setHours(0, 0, 0, 0);
    const cellNextDay = new Date(cellDate);
    cellNextDay.setDate(cellDate.getDate() + 1);

    return events.some(event => {
      if (event.isAllDay) {
        return cellDate >= event.startDate && cellDate < event.endDate;
      } else {
        return event.startDate < cellNextDay && event.endDate > cellDate;
      }
    });
  };

  return (
    <>
      {Array.from({ length: 12 }, (_, monthIndex) => {
        const monthGrid = generateMonthGrid(monthIndex);
        
        return (
          <div key={monthIndex} className={`year-month-container rounded-lg p-3 border hover:shadow-md transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className={`text-sm font-semibold mb-2 text-center ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              {monthNames[monthIndex]}
            </div>
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <div key={day} className={`text-[10px] text-center ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {monthGrid.map(cellData => {
                const hasEvents = hasEventsOnDate(cellData.date);
                
                return (
                  <div
                    key={cellData.date.toISOString()}
                    className={`aspect-square flex items-center justify-center text-[10px] rounded transition-colors relative ${
                      !cellData.isCurrentMonth
                        ? isDarkMode ? 'text-slate-700' : 'text-slate-300'
                        : isDarkMode 
                          ? 'text-slate-300 hover:bg-slate-700 cursor-pointer'
                          : 'text-slate-600 hover:bg-slate-100 cursor-pointer'
                    } ${
                      cellData.isToday
                        ? 'bg-indigo-600 text-white font-semibold hover:bg-indigo-700'
                        : ''
                    }`}
                  >
                    {cellData.date.getDate()}
                    {hasEvents && cellData.isCurrentMonth && (
                      <div className="w-1 h-1 bg-indigo-500 rounded-full absolute bottom-0.5"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
};