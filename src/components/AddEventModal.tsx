import React, { useState, useEffect } from 'react';
import type { EventCategory } from '../types';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: {
    summary: string;
    category: EventCategory;
    startDate: Date;
    endDate: Date;
    isAllDay: boolean;
    location: string;
    description: string;
  }) => void;
  selectedDateRange?: { start: Date; end: Date } | null;
  isDarkMode: boolean;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onSave, selectedDateRange, isDarkMode }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('personal');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (selectedDateRange) {
      const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      
      setStartDate(formatDate(selectedDateRange.start));
      setEndDate(formatDate(selectedDateRange.end));
      
      // 如果选择的是同一天，默认为全天事件
      const isSameDay = selectedDateRange.start.toDateString() === selectedDateRange.end.toDateString();
      setIsAllDay(isSameDay);
    }
  }, [selectedDateRange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let start: Date;
    let end: Date;
    
    if (isAllDay) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setDate(end.getDate() + 1);
    } else {
      start = new Date(`${startDate}T${startTime}`);
      end = new Date(`${endDate}T${endTime}`);
    }
    
    onSave({
      summary: title,
      category,
      startDate: start,
      endDate: end,
      isAllDay,
      location,
      description
    });
    
    // 重置表单
    setTitle('');
    setCategory('personal');
    setStartDate('');
    setEndDate('');
    setIsAllDay(true);
    setStartTime('09:00');
    setEndTime('10:00');
    setLocation('');
    setDescription('');
  };

  const handleCancel = () => {
    setTitle('');
    setCategory('personal');
    setStartDate('');
    setEndDate('');
    setIsAllDay(true);
    setStartTime('09:00');
    setEndTime('10:00');
    setLocation('');
    setDescription('');
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-200 p-4 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleCancel}
    >
      <div
        className={`rounded-2xl shadow-2xl w-full max-w-[500px] overflow-y-auto max-h-[90vh] transform transition-transform duration-200 ${
          isOpen ? 'scale-100' : 'scale-95'
        } ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white">新增事件</h2>
          <button
            onClick={handleCancel}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 pb-6 pt-6">
          <form onSubmit={handleSubmit} className={`rounded-xl shadow-lg p-6 border space-y-4 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-100'}`}>
            {/* 事件标题 */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>事件标题 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${isDarkMode ? 'bg-slate-600 border-slate-500 text-slate-100 placeholder-slate-400' : 'bg-white border-slate-200 text-slate-700'}`}
                placeholder="输入事件标题"
              />
            </div>

            {/* 事件分类 */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>事件分类 *</label>
              <div className="grid grid-cols-3 gap-3">
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value="work"
                    checked={category === 'work'}
                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                    className="peer sr-only"
                  />
                  <div className={`px-4 py-3 border-2 rounded-lg text-center transition-all peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 ${isDarkMode ? 'border-slate-600 hover:border-slate-500 peer-checked:bg-indigo-900/30 peer-checked:text-indigo-400' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="w-3 h-3 bg-indigo-500 rounded-sm mx-auto mb-1"></div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : ''}`}>工作</span>
                  </div>
                </label>
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value="personal"
                    checked={category === 'personal'}
                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                    className="peer sr-only"
                  />
                  <div className={`px-4 py-3 border-2 rounded-lg text-center transition-all peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 ${isDarkMode ? 'border-slate-600 hover:border-slate-500 peer-checked:bg-emerald-900/30 peer-checked:text-emerald-400' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="w-3 h-3 bg-emerald-500 rounded-sm mx-auto mb-1"></div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : ''}`}>个人</span>
                  </div>
                </label>
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value="holiday"
                    checked={category === 'holiday'}
                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                    className="peer sr-only"
                  />
                  <div className={`px-4 py-3 border-2 rounded-lg text-center transition-all peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:text-amber-700 ${isDarkMode ? 'border-slate-600 hover:border-slate-500 peer-checked:bg-amber-900/30 peer-checked:text-amber-400' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="w-3 h-3 bg-amber-500 rounded-sm mx-auto mb-1"></div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : ''}`}>假期</span>
                  </div>
                </label>
              </div>
            </div>

            {/* 日期范围 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>开始日期 *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${isDarkMode ? 'bg-slate-600 border-slate-500 text-slate-100' : 'bg-white border-slate-200 text-slate-700'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>结束日期 *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${isDarkMode ? 'bg-slate-600 border-slate-500 text-slate-100' : 'bg-white border-slate-200 text-slate-700'}`}
                />
              </div>
            </div>

            {/* 全天事件 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="event-all-day"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="event-all-day" className={`ml-2 text-sm cursor-pointer ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                全天事件
              </label>
            </div>

            {/* 时间选择 */}
            {!isAllDay && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>开始时间</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${isDarkMode ? 'bg-slate-600 border-slate-500 text-slate-100' : 'bg-white border-slate-200 text-slate-700'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>结束时间</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${isDarkMode ? 'bg-slate-600 border-slate-500 text-slate-100' : 'bg-white border-slate-200 text-slate-700'}`}
                  />
                </div>
              </div>
            )}

            {/* 地点 */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>地点</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${isDarkMode ? 'bg-slate-600 border-slate-500 text-slate-100 placeholder-slate-400' : 'bg-white border-slate-200 text-slate-700'}`}
                placeholder="输入地点（可选）"
              />
            </div>

            {/* 描述 */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>描述</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none ${isDarkMode ? 'bg-slate-600 border-slate-500 text-slate-100 placeholder-slate-400' : 'bg-white border-slate-200 text-slate-700'}`}
                placeholder="输入事件描述（可选）"
              />
            </div>

            {/* 按钮 */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className={`flex-1 px-4 py-2.5 border rounded-lg transition-colors font-medium ${isDarkMode ? 'border-slate-500 text-slate-200 hover:bg-slate-600' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-md shadow-emerald-200"
              >
                保存事件
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
