import React from 'react';
import {
  LayoutGrid,
  Timer as LucideTimer,
  Bed as LucideBed,
  Sun as LucideSun,
  Moon as LucideMoon,
  Play as LucidePlay,
  Pause as LucidePause,
  Square,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check as LucideCheck,
  Plus as LucidePlus,
  Minus as LucideMinus,
  Tag as LucideTag,
  ShieldCheck as LucideShieldCheck,
  CalendarCheck as LucideCalendarCheck,
  Trash2,
  Copy as LucideCopy,
  Palette as LucidePalette,
  X as LucideX,
  Clock as LucideClock,
  TrendingUp,
  Zap,
  Sparkles as LucideSparkles,
  ExternalLink,
  SlidersHorizontal,
  Settings as LucideSettings,
  Lock as LucideLock,
  Unlock as LucideUnlock,
  AlertCircle,
  RefreshCw,
  Globe as LucideGlobe,
  Upload,
  Eye as LucideEye,
  EyeOff,
  CheckCircle2,
  MapPin as LucideMapPin,
  Calendar as LucideCalendar,
  Pill as LucidePill,
  Sunrise,
  Pencil as LucidePencil,
  Search,
  LucideProps,
} from 'lucide-react';

export type IconProps = LucideProps & {
  weight?: 'bold' | 'fill' | 'regular' | 'light' | 'thin' | 'duotone';
};

const createIcon = (Component: React.ComponentType<LucideProps>, displayName: string) => {
  const IconComponent = React.forwardRef<SVGSVGElement, IconProps>(
    ({ size = 16, weight, className = '', strokeWidth, fill, ...props }, ref) => {
      const sw = strokeWidth ?? (weight === 'bold' ? 2.5 : weight === 'light' ? 1.5 : 2);
      const fl = fill ?? (weight === 'fill' ? 'currentColor' : 'none');
      return (
        <Component
          ref={ref}
          size={size}
          strokeWidth={sw}
          fill={fl}
          className={`shrink-0 inline-block align-middle ${className}`}
          {...props}
        />
      );
    }
  );
  IconComponent.displayName = displayName;
  return React.memo(IconComponent);
};

export const SquaresFour = createIcon(LayoutGrid, 'SquaresFour');
export const Timer = createIcon(LucideTimer, 'Timer');
export const Bed = createIcon(LucideBed, 'Bed');
export const Sun = createIcon(LucideSun, 'Sun');
export const Moon = createIcon(LucideMoon, 'Moon');
export const Play = createIcon(LucidePlay, 'Play');
export const Pause = createIcon(LucidePause, 'Pause');
export const Stop = createIcon(Square, 'Stop');
export const ArrowCounterClockwise = createIcon(RotateCcw, 'ArrowCounterClockwise');
export const CaretLeft = createIcon(ChevronLeft, 'CaretLeft');
export const CaretRight = createIcon(ChevronRight, 'CaretRight');
export const CaretDown = createIcon(ChevronDown, 'CaretDown');
export const Check = createIcon(LucideCheck, 'Check');
export const Plus = createIcon(LucidePlus, 'Plus');
export const Minus = createIcon(LucideMinus, 'Minus');
export const Tag = createIcon(LucideTag, 'Tag');
export const TagIcon = createIcon(LucideTag, 'TagIcon');
export const ShieldCheck = createIcon(LucideShieldCheck, 'ShieldCheck');
export const CalendarCheck = createIcon(LucideCalendarCheck, 'CalendarCheck');
export const Trash = createIcon(Trash2, 'Trash');
export const Copy = createIcon(LucideCopy, 'Copy');
export const Palette = createIcon(LucidePalette, 'Palette');
export const X = createIcon(LucideX, 'X');
export const Clock = createIcon(LucideClock, 'Clock');
export const ChartLineUp = createIcon(TrendingUp, 'ChartLineUp');
export const Lightning = createIcon(Zap, 'Lightning');
export const Sparkles = createIcon(LucideSparkles, 'Sparkles');
export const Sparkle = createIcon(LucideSparkles, 'Sparkle');
export const ArrowSquareOut = createIcon(ExternalLink, 'ArrowSquareOut');
export const Sliders = createIcon(SlidersHorizontal, 'Sliders');
export const Gear = createIcon(LucideSettings, 'Gear');
export const Lock = createIcon(LucideLock, 'Lock');
export const LockOpen = createIcon(LucideUnlock, 'LockOpen');
export const Warning = createIcon(AlertCircle, 'Warning');
export const WarningCircle = createIcon(AlertCircle, 'WarningCircle');
export const ArrowClockwise = createIcon(RefreshCw, 'ArrowClockwise');
export const Globe = createIcon(LucideGlobe, 'Globe');
export const GlobeIcon = createIcon(LucideGlobe, 'GlobeIcon');
export const UploadSimple = createIcon(Upload, 'UploadSimple');
export const Eye = createIcon(LucideEye, 'Eye');
export const EyeSlash = createIcon(EyeOff, 'EyeSlash');
export const CheckCircle = createIcon(CheckCircle2, 'CheckCircle');
export const MapPin = createIcon(LucideMapPin, 'MapPin');
export const Calendar = createIcon(LucideCalendar, 'Calendar');
export const Pill = createIcon(LucidePill, 'Pill');
export const SunHorizon = createIcon(Sunrise, 'SunHorizon');
export const PencilSimple = createIcon(LucidePencil, 'PencilSimple');
export const MagnifyingGlass = createIcon(Search, 'MagnifyingGlass');
