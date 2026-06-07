import type { ReactNode } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';

export interface ModalStyleConfig {
  overlay?: {
    bg?: string;
    blur?: string;
    zIndex?: number;
  };
  panel?: {
    bg?: string;
    rounded?: string;
    shadow?: string;
    border?: string;
    maxWidths?: Record<ModalSize, string>;
  };
  header?: {
    bg?: string;
    border?: string;
    padding?: string;
    titleSize?: string;
    titleColor?: string;
    descSize?: string;
    descColor?: string;
    closeBtnColor?: string;
    closeBtnHoverBg?: string;
  };
  body?: {
    bg?: string;
    padding?: string;
    textColor?: string;
    maxHeight?: string;
  };
  footer?: {
    bg?: string;
    border?: string;
    padding?: string;
  };
}

export interface ModalProps {
  /** Controlled open state */
  open: boolean;
  /** Callback fired when the modal should close */
  onClose: () => void;
  /** Size variant */
  size?: ModalSize;
  /** Whether clicking the overlay closes the modal */
  closeOnOverlay?: boolean;
  /** Whether the escape key closes the modal */
  closeOnEsc?: boolean;
  /** Show close (X) button */
  showCloseButton?: boolean;
  /** Content of the modal */
  children: ReactNode;
  /** Custom class for the modal container */
  className?: string;
  /** Custom class for the overlay */
  overlayClassName?: string;
  /** Style configuration overrides */
  styleConfig?: ModalStyleConfig;
  /** Initial focus ref */
  initialFocusRef?: React.RefObject<any>;
}

export interface ModalHeaderProps {
  /** Title of the modal */
  title?: ReactNode;
  /** Description or subtitle */
  description?: ReactNode;
  /** Custom icon or element to display next to title */
  icon?: ReactNode;
  /** Whether to show the close button (inherited from Modal if possible) */
  onClose?: () => void;
  /** Custom classes */
  className?: string;
  /** Style configuration overrides */
  styleConfig?: ModalStyleConfig;
}

export interface ModalBodyProps {
  children: ReactNode;
  className?: string;
  /** Whether to enable inner scrolling (default: true) */
  scrollable?: boolean;
  /** Style configuration overrides */
  styleConfig?: ModalStyleConfig;
}

export interface ModalFooterProps {
  children: ReactNode;
  className?: string;
  /** Alignment of footer actions */
  align?: 'left' | 'center' | 'right';
  /** Style configuration overrides */
  styleConfig?: ModalStyleConfig;
}
