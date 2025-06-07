import { useEffect } from 'react';

export function useGlobalPaste(onPaste: (text: string) => void) {
  useEffect(() => {
    async function handlePaste(e: ClipboardEvent) {
      const target = e.target as HTMLElement;

      // Only handle paste when not in an input field
      if (
        target.tagName !== 'INPUT' &&
        target.tagName !== 'TEXTAREA' &&
        !target.isContentEditable
      ) {
        try {
          const pastedText = e.clipboardData?.getData('text');
          if (pastedText && pastedText.trim()) {
            onPaste(pastedText.trim());
            e.preventDefault();
          }
        } catch (error) {
          console.error('Failed to read from clipboard:', error);
          alert(
            'Failed to read from clipboard. Please try again or paste manually.',
          );
        }
      }
    }

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [onPaste]);
}
