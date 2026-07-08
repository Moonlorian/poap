export const pollUntilChanged = async ({
  fetchFn,
  hasChanged,
  previousValue,
  intervalMs = 2000,
  timeoutMs = 30000
}) => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, intervalMs));
    try {
      const newValue = await fetchFn();
      if (hasChanged(newValue, previousValue)) return newValue;
    } catch {

    }
  }
  return fetchFn();
};