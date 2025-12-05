import { DietPlan, Patient } from "../types";

type PersistentData = Omit<Patient, 'id' | 'createdAt' | 'avatarUrl' | 'status'> | Partial<DietPlan>;

/**
 * Saves state to localStorage.
 * @param key The key to save the state under.
 * @param state The state to save.
 */
export const saveState = <T>(key: string, state: T): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(key, serializedState);
  } catch (error) {
    console.warn("Could not save state to localStorage", error);
  }
};

/**
 * Loads state from localStorage.
 * @param key The key to load the state from.
 * @returns The loaded state or null if not found or on error.
 */
export const loadState = <T>(key: string): T | null => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return null;
    }
    return JSON.parse(serializedState) as T;
  } catch (error) {
    console.warn("Could not load state from localStorage", error);
    return null;
  }
};

/**
 * Removes a state from localStorage.
 * @param key The key to remove.
 */
export const removeState = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.warn("Could not remove state from localStorage", error);
    }
}