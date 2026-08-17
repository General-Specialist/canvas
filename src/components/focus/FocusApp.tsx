import React from 'react';
import { FocusCalendarView } from './FocusCalendarView';

export const FocusApp: React.FC = () => {
  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-start items-center">
      <div className="w-full max-w-6xl">
        <FocusCalendarView />
      </div>
    </div>
  );
};
