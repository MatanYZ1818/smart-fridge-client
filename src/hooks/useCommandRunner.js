import { useCallback, useEffect, useRef, useState } from 'react';
import { commandButtonKey, getCommandRunDuration } from '../lib/fridgeHelpers';

const MIN_SPINNER_MS = 600;

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function runCountdown(setCountdown, seconds, signal) {
  return new Promise((resolve, reject) => {
    let remaining = seconds;
    setCountdown(remaining);

    const interval = setInterval(() => {
      if (signal.aborted) {
        clearInterval(interval);
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }

      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(interval);
        setCountdown(null);
        resolve();
        return;
      }

      setCountdown(remaining);
    }, 1000);
  });
}

export function useCommandRunner() {
  const [activeKey, setActiveKey] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => () => {
    abortRef.current?.abort();
  }, []);

  const runCommand = useCallback(async (device, command, invokeFn) => {
    const key = commandButtonKey(device, command);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setActiveKey(key);
    setCountdown(null);

    const startedAt = Date.now();

    try {
      await invokeFn();

      const duration = getCommandRunDuration(device, command);
      if (duration) {
        await runCountdown(setCountdown, duration, controller.signal);
      } else {
        const elapsed = Date.now() - startedAt;
        if (elapsed < MIN_SPINNER_MS) {
          await wait(MIN_SPINNER_MS - elapsed);
        }
      }
    } finally {
      if (!controller.signal.aborted) {
        setActiveKey(null);
        setCountdown(null);
      }
    }
  }, []);

  return { activeKey, countdown, runCommand };
}
