'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[90] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-y-0 right-0 z-[95] flex w-full max-w-md flex-col border-l border-line-hairline bg-surface shadow-popover dark:border-line-hairline-dark dark:bg-surface-dark"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="flex items-start justify-between border-b border-line-hairline p-5 dark:border-line-hairline-dark">
              <div>
                <h2 className="text-base font-semibold text-ink-primary dark:text-ink-primary-dark">{title}</h2>
                {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-ink-muted hover:bg-surface-page dark:hover:bg-white/5"
                aria-label="Close"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
            {footer && <div className="border-t border-line-hairline p-4 dark:border-line-hairline-dark">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
