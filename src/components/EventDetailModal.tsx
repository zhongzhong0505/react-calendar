import React from 'react';
import type { CalendarEvent } from '../types';

interface EventDetailModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, isOpen, onClose, isDarkMode }) => {
  if (!event) return null;

  const formatEventTime = (event: CalendarEvent): string => {
    const startDate = event.startDate;
    const endDate = event.endDate;
    
    const isSameDay = startDate.toDateString() === endDate.toDateString();
    
    if (event.isAllDay) {
      if (isSameDay) {
        return `${startDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} 全天`;
      } else {
        return `${startDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} - ${endDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} 全天`;
      }
    } else {
      if (isSameDay) {
        return `${startDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} ${startDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${endDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
      } else {
        return `${startDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} ${startDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${endDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} ${endDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
      }
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-200 p-4 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className={`rounded-2xl shadow-2xl w-full max-w-[400px] p-0 overflow-hidden transform transition-transform duration-200 ${
          isOpen ? 'scale-100' : 'scale-95'
        } ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 flex justify-between items-start">
          <div className="flex-1"></div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 pb-6 -mt-8">
          <div className={`rounded-xl shadow-lg p-5 border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-100'}`}>
            <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{event.summary || '无标题'}</h3>
            <div className={`flex items-center text-sm font-medium mb-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatEventTime(event)}</span>
            </div>
            
            <div className="space-y-3">
              <div className={`flex items-start text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                <svg className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <p className="whitespace-pre-wrap leading-relaxed">{event.description || '无描述'}</p>
              </div>
              {event.location && (
                <div className={`flex items-center text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  <svg className={`w-5 h-5 mr-3 flex-shrink-0 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
