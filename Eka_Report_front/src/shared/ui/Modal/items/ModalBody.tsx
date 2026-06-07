import React from 'react';
import type { ModalBodyProps } from '../types';
import { cn } from '../../../lib/utils';
import { getModalStyle } from '../style/style';

/* ── Component ─────────────────────────────────────────────── */

export const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className,
  scrollable = true,
  styleConfig,
}) => {
  const { body: s } = getModalStyle(styleConfig);

  return (
    <div
      className={cn(
        s.root,
        scrollable && s.scrollable,
        className,
      )}
    >
      {children}
    </div>
  );
};
