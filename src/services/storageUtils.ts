export type Tab = {
  id: string;
  title: string;
  url: string;
};

export type TabGroup = {
  id: string;
  name: string;
  color?: string;
  tabIds?: string[];
};

export function isTabArray(value: unknown): value is Tab[] {
  return (
    Array.isArray(value) &&
    value.every(
      item =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Tab).id === "string" &&
        typeof (item as Tab).title === "string" &&
        typeof (item as Tab).url === "string"
    )
  );
}

export function isTabGroupArray(
  value: unknown
): value is TabGroup[] {
  return (
    Array.isArray(value) &&
    value.every(
      item =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as TabGroup).id === "string" &&
        typeof (item as TabGroup).name === "string" &&
        ((item as TabGroup).tabIds === undefined || Array.isArray((item as TabGroup).tabIds))
    )
  );
}

export function safeParse<T>(
  key: string,
  fallback: T,
  validator?: (value: unknown) => value is T
): T {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    const parsed: unknown = JSON.parse(raw);

    if (validator && !validator(parsed)) {
      console.warn(`Invalid localStorage data: ${key}`);
      return fallback;
    }

    return parsed as T;
  } catch (error) {
    console.warn(
      `Unable to parse localStorage key: ${key}`,
      error
    );

    return fallback;
  }
}
