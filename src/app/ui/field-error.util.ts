export function firstErrorMessage<TKey extends string>(
  errors: Partial<Record<TKey, boolean>> | null,
  messages: Partial<Record<TKey, string>>,
): string | undefined {
  if (!errors) return undefined;
  const key = (Object.keys(messages) as TKey[]).find((candidate) => errors[candidate]);
  return key ? messages[key] : undefined;
}

export function fieldErrorMessage<TKey extends string>(
  shouldShow: boolean,
  errors: Partial<Record<TKey, boolean>> | null,
  messages: Partial<Record<TKey, string>>,
): string | undefined {
  if (!shouldShow) return undefined;
  return firstErrorMessage(errors, messages);
}
