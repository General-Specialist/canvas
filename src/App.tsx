import { JarvisShell } from './components/shell/JarvisShell';
import { ThemeProvider } from './context/ThemeContext';
import { FocusProvider } from './context/FocusContext';
import { GoogleCalendarProvider } from './context/GoogleCalendarContext';

function App() {
  return (
    <ThemeProvider>
      <FocusProvider>
        <GoogleCalendarProvider>
          <JarvisShell />
        </GoogleCalendarProvider>
      </FocusProvider>
    </ThemeProvider>
  );
}

export default App;
