import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import type { ModalProps } from '../types';
import { cn } from '../../../lib/utils';
import { getModalStyle } from '../style/style';

/* ── Component ─────────────────────────────────────────────── */

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  size            = 'md',
  closeOnOverlay  = true,
  closeOnEsc      = true,
  children,
  className,
  overlayClassName,
  styleConfig,
  initialFocusRef,
}) => {
  const modalRef      = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const styles        = getModalStyle(styleConfig);

  // Handle escape key
  useEffect(() => {
    if (!open || !closeOnEsc) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEsc, onClose]);

  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      previousFocus.current?.focus();
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Focus trap logic
  useEffect(() => {
    if (!open) return;
    const modalElement = modalRef.current;
    if (!modalElement) return;

    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement  = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) { e.preventDefault(); lastElement?.focus(); }
      } else {
        if (document.activeElement === lastElement) { e.preventDefault(); firstElement?.focus(); }
      }
    };

    modalElement.addEventListener('keydown', handleTabTrap);
    
    // Initial focus logic
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else if (firstElement) {
      firstElement.focus();
    } else {
      modalElement.focus();
    }

    return () => modalElement.removeEventListener('keydown', handleTabTrap);
  }, [open, initialFocusRef]);

  const modalContent = (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 sm:p-6"
          style={{ zIndex: styles.zIndex }}
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(styles.overlay, overlayClassName)}
            onClick={closeOnOverlay ? onClose : undefined}
          />

          {/* Modal Panel */}
          <m.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, duration: 0.3 }}
            tabIndex={-1}
            className={cn(styles.panel, styles.maxWidths[size], className)}
          >
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const childProps = child.props as any;
                
                // Always pass styleConfig to sub-components if they don't have one
                return React.cloneElement(child, { 
                  styleConfig: childProps.styleConfig || styleConfig,
                  onClose: (child.type as any).name === 'ModalHeader' && !childProps.onClose ? onClose : childProps.onClose
                } as any);
              }
              return child;
            })}
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
