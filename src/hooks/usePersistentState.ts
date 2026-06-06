import { useState, useEffect, useCallback } from "react";
import { loadState, saveState, removeState } from "../utils/localStorage";

type SetValue<T> = (value: T | ((val: T) => T)) => void;

function usePersistentState<T>(
  key: string,
  initialValue: T,
): [T, SetValue<T>, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const fromStorage = loadState<T>(key);
    return fromStorage ?? initialValue;
  });

  const setValue: SetValue<T> = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
  };

  const clearState = useCallback(() => {
    removeState(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  useEffect(() => {
    saveState(key, storedValue);
  }, [key, storedValue]);

  return [storedValue, setValue, clearState];
}

export default usePersistentState;
