import React from 'react';
import { FocusTimerCard } from './FocusTimerCard';
import { FocusCalendarView } from './FocusCalendarView';

export const FocusApp: React.FC = () => {
  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-start items-center">
      <div className="w-full max-w-6xl space-y-4 sm:space-y-5">
        {/* Top Toggl Tracker Bar */}
        <FocusTimerCard />

        {/* Primary Interface: Calendar View */}
        <FocusCalendarView />
      </div>
    </div>
  );
};
