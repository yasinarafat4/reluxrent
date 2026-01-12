import { useCallback } from 'react';

export function useLogger() {
  const log = useCallback(async (level, message, meta = {}) => {
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, message, meta }),
      });
    } catch (err) {
      console.warn('Failed to send log to server:', err);
    }
  }, []);

  const info = useCallback((msg, meta) => log('info', msg, meta), [log]);
  const warn = useCallback((msg, meta) => log('warn', msg, meta), [log]);
  const error = useCallback((msg, meta) => log('error', msg, meta), [log]);
  const debug = useCallback((msg, meta) => log('debug', msg, meta), [log]);

  return { info, warn, error, debug };
}
