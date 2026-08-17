import { JarvisShell } from './components/shell/JarvisShell';
import { ThemeProvider } from './context/ThemeContext';
import { FocusProvider } from './context/FocusContext';

function App() {
  return (
    <ThemeProvider>
      <FocusProvider>
        <JarvisShell />
      </FocusProvider>
    </ThemeProvider>
  );
}

export default App;
