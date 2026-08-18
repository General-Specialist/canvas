import { JarvisShell } from './components/shell/JarvisShell';
import { ThemeProvider } from './context/ThemeContext';
import { FocusProvider } from './context/FocusContext';
import { GoogleCalendarProvider } from './context/GoogleCalendarContext';
import { SleepProvider } from './context/SleepContext';

function App() {
  return (
    <ThemeProvider>
      <FocusProvider>
        <GoogleCalendarProvider>
          <SleepProvider>
            <JarvisShell />
          </SleepProvider>
        </GoogleCalendarProvider>
      </FocusProvider>
    </ThemeProvider>
  );
}

export default App;

