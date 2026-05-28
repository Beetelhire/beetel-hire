'use client';

import { createContext, useCallback, useContext, useState, useRef, useEffect } from 'react';

type ToastFn = (message: string, type?: 'success' | 'error') => void;
const ToastCtx = createContext<ToastFn>(() => {});
export const useToast = () => useContext(ToastCtx);

let externalShow: ToastFn = () => {};
export const showToast: ToastFn = (m, t) => externalShow(m, t);

export function Toast() {
  const [state, setState] = useState<{ msg: string; type?: 'success' | 'error'; open: boolean }>({
    msg: '', open: false,
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const show = useCallback<ToastFn>((msg, type = 'success') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState({ msg, type, open: true });
    timerRef.current = setTimeout(() => setState(s => ({ ...s, open: false })), 3200);
  }, []);

  useEffect(() => { externalShow = show; }, [show]);

  return (
    <ToastCtx.Provider value={show}>
      <div
        className={`toast${state.open ? ' show' : ''}${state.type === 'error' ? ' error' : ''}`}
        role="status"
        aria-live="polite"
      >
        <span className="dot"></span>
        <span>{state.msg}</span>
      </div>
    </ToastCtx.Provider>
  );
}
