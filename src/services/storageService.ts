// Re-export all storage functions for centralized access
export * from '@/lib/storage';

// Last active page persistence
const LAST_PAGE_KEY = 'jarvis-last-page';

export function getLastActivePage(): string {
  return localStorage.getItem(LAST_PAGE_KEY) || '/';
}

export function saveLastActivePage(path: string): void {
  localStorage.setItem(LAST_PAGE_KEY, path);
}
