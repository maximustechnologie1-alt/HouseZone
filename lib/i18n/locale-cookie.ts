// Plain constant, importable from both client and server code — kept out of
// get-locale.ts (which pulls in next/headers, a server-only module) so the
// client-side I18nProvider can read it without dragging that in.
export const LOCALE_COOKIE = "hz_locale";
