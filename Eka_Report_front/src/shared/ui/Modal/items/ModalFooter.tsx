import React from 'react';
import type { ModalFooterProps } from '../types';
import { cn } from '../../../lib/utils';
import { getModalStyle, modalFooterAlignStyles } from '../style/style';

/* ── Component ─────────────────────────────────────────────── */

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className,
  align = 'right',
  styleConfig,
}) => {
  const { footer: s } = getModalStyle(styleConfig);

  return (
    <div
      className={cn(
        s.root,
        modalFooterAlignStyles[align],
        className,
      )}
    >
      {children}
    </div>
  );
};
