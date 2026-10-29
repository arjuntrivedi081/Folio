import { useEffect } from 'react';
import { brand } from '../config/brand';

export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    if (title && title.trim()) {
      document.title = `${title.trim()} · ${brand.name}`;
    } else {
      document.title = `${brand.name} · ${brand.tagline}`;
    }
  }, [title]);
}
