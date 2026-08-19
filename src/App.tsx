import { JarvisShell } from './components/shell/JarvisShell';
import { FocusProvider } from './context/FocusContext';
import { GoogleCalendarProvider } from './context/GoogleCalendarContext';
import { SleepProvider } from './context/SleepContext';

function App() {
  return (
    <FocusProvider>
      <GoogleCalendarProvider>
        <SleepProvider>
          <JarvisShell />
        </SleepProvider>
      </GoogleCalendarProvider>
    </FocusProvider>
  );
}

export default App;

