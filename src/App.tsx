import { Canvas } from './components/Canvas';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <main className="w-screen h-screen overflow-hidden bg-[var(--canvas-bg)] text-[var(--text-normal)] transition-colors duration-200">
        <Canvas />
      </main>
    </ThemeProvider>
  );
}

export default App;
