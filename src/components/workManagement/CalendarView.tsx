import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { Task } from '../../types/workManagement';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  addMonths,
  subMonths,
  isSameDay
} from 'date-fns';

export function CalendarView() {
  const { companies } = useCompany();
  const [currentDate, setCurrentDate] = React.useState(new Date());

  // Get all tasks from all companies
  const allTasks = React.useMemo(() => {
    return companies.reduce((tasks: (Task & { companyName: string })[], company) => {
      const companyTasks = company.workManagement?.tasks || [];
      return [...tasks, ...companyTasks.map(task => ({
        ...task,
        companyName: company.name
      }))];
    }, []);
  }, [companies]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const getTasksForDay = (date: Date) => {
    return allTasks.filter(task => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), date);
    });
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'completed') return false;
    return new Date(task.dueDate) < new Date();
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {calendarDays.map((day) => {
          const dayTasks = getTasksForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[120px] bg-white p-2 ${
                !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
              }`}
            >
              <div className={`flex items-center justify-center h-6 w-6 mb-1 ${
                isToday 
                  ? 'bg-indigo-600 text-white rounded-full' 
                  : 'text-gray-900'
              }`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`px-2 py-1 text-xs rounded-md ${
                      task.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : isOverdue(task)
                        ? 'bg-red-100 text-red-800'
                        : getPriorityColor(task.priority)
                    }`}
                  >
                    <div className="flex items-center">
                      {task.status === 'completed' && (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      )}
                      <span className="truncate">{task.title}</span>
                    </div>
                    <div className="text-xs opacity-75 truncate">
                      {task.companyName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
