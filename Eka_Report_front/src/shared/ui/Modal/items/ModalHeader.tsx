import React from 'react';
import { X } from 'lucide-react';
import type { ModalHeaderProps } from '../types';
import { cn } from '../../../lib/utils';
import { getModalStyle } from '../style/style';

/* ── Component ─────────────────────────────────────────────── */

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  description,
  icon,
  onClose,
  className,
  styleConfig,
}) => {
  const { header: s } = getModalStyle(styleConfig);

  return (
    <div className={cn(s.root, className)}>
      <div className={s.innerRow}>
        {icon && <div className={s.iconWrapper}>{icon}</div>}
        <div className={s.contentCol}>
          {title       && <h3 className={s.title}>{title}</h3>}
          {description && <p  className={s.description}>{description}</p>}
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className={s.closeButton}
          aria-label="Close modal"
        >
          <X className={s.closeIcon} />
        </button>
      )}
    </div>
  );
};
