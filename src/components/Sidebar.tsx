import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
  currentYear: number;
  currentMonth: number;
  isDarkMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, isCollapsed, onClose, onImport, currentYear, currentMonth, isDarkMode }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  const renderMiniCalendar = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const today = new Date();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`}></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = currentYear === today.getFullYear() && 
                      currentMonth === today.getMonth() && 
                      i === today.getDate();
      
      days.push(
        <div
          key={i}
          className={`${
            isToday
              ? `bg-indigo-600 text-white rounded-full w-6 h-6 mx-auto flex items-center justify-center ${isDarkMode ? 'shadow-lg shadow-indigo-500/30' : 'shadow-md shadow-indigo-200'}`
              : isDarkMode
                ? 'text-slate-300 hover:bg-slate-700 rounded-full w-6 h-6 mx-auto flex items-center justify-center cursor-pointer transition-colors'
                : 'text-slate-600 hover:bg-slate-100 rounded-full w-6 h-6 mx-auto flex items-center justify-center cursor-pointer transition-colors'
          }`}
        >
          {i}
        </div>
      );
    }

    return days;
  };

  return (
    <>
      {/* 遮罩层 */}
      <div
        className={`lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* 侧边栏 */}
      <aside
        className={`border-r flex flex-col transition-all duration-300 z-40 shadow-sm fixed lg:relative h-full ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isCollapsed ? 'lg:w-16' : 'lg:w-72'
        } w-72 ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center border-b justify-between px-4 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className={`flex items-center overflow-hidden transition-all ${isCollapsed ? 'lg:w-8' : 'w-auto'}`}>
            <div className={`w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 ${isDarkMode ? 'shadow-lg shadow-indigo-500/30' : 'shadow-lg shadow-indigo-200'}`}>
              C
            </div>
            <span className={`text-xl font-bold tracking-tight ml-3 whitespace-nowrap transition-opacity ${isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'} ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Calendar</span>
          </div>
          <button
            onClick={onClose}
            className={`lg:hidden p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 导入按钮 */}
        <div className={`px-4 py-4 transition-all ${isCollapsed ? 'lg:px-2' : ''}`}>
          <label className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all flex items-center font-medium text-sm group cursor-pointer ${
            isCollapsed ? 'lg:justify-center lg:p-2.5' : 'justify-center py-2.5 px-4'
          } ${
            isDarkMode ? 'shadow-lg shadow-indigo-500/20' : 'shadow-md shadow-indigo-200'
          }`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 group-hover:scale-110 transition-transform ${isCollapsed ? 'lg:mr-0' : 'mr-2'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className={`transition-all overflow-hidden whitespace-nowrap ${isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'}`}>导入 ICS 文件</span>
            <input type="file" accept=".ics" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        {/* 小日历 */}
        <div className={`px-4 mb-4 overflow-hidden transition-all ${isCollapsed ? 'lg:opacity-0 lg:h-0 lg:mb-0' : 'opacity-100'}`}>
          <div className="p-2">
            <div className={`text-center font-bold mb-4 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
              {currentYear}年 {currentMonth + 1}月
            </div>
            <div className={`grid grid-cols-7 gap-1 text-center text-xs mb-2 font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-xs">
              {renderMiniCalendar()}
            </div>
          </div>
        </div>

        {/* 分类列表 */}
        <div className={`flex-1 overflow-y-auto px-4 py-2 transition-all ${isCollapsed ? 'lg:px-2' : ''}`}>
          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 overflow-hidden transition-all ${isCollapsed ? 'lg:opacity-0 lg:h-0 lg:mb-0' : 'opacity-100'} ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>我的日历</h3>
          <ul className="space-y-2">
            <li className={`flex items-center group cursor-pointer transition-all ${isCollapsed ? 'lg:justify-center' : ''}`} title="工作">
              <div className="w-4 h-4 rounded border-2 border-indigo-500 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 bg-indigo-500 rounded-sm"></div>
              </div>
              <span className={`text-sm group-hover:text-indigo-600 transition-all overflow-hidden whitespace-nowrap ${isCollapsed ? 'lg:opacity-0 lg:w-0 lg:ml-0' : 'opacity-100 ml-3'} ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>工作</span>
            </li>
            <li className={`flex items-center group cursor-pointer transition-all ${isCollapsed ? 'lg:justify-center' : ''}`} title="个人">
              <div className="w-4 h-4 rounded border-2 border-emerald-500 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 bg-emerald-500 rounded-sm"></div>
              </div>
              <span className={`text-sm group-hover:text-emerald-600 transition-all overflow-hidden whitespace-nowrap ${isCollapsed ? 'lg:opacity-0 lg:w-0 lg:ml-0' : 'opacity-100 ml-3'} ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>个人</span>
            </li>
            <li className={`flex items-center group cursor-pointer transition-all ${isCollapsed ? 'lg:justify-center' : ''}`} title="假期">
              <div className="w-4 h-4 rounded border-2 border-amber-500 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 bg-amber-500 rounded-sm"></div>
              </div>
              <span className={`text-sm group-hover:text-amber-600 transition-all overflow-hidden whitespace-nowrap ${isCollapsed ? 'lg:opacity-0 lg:w-0 lg:ml-0' : 'opacity-100 ml-3'} ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>假期</span>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};