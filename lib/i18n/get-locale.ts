import "server-only";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { DEFAULT_LOCALE, isLocaleCode, type LocaleCode } from "./locales";
import { LOCALE_COOKIE } from "./locale-cookie";

export { LOCALE_COOKIE };

// Resolution order: a signed-in user's saved preference (profiles.language,
// so it follows them across devices) wins; otherwise fall back to the
// cookie a guest's last pick left behind; otherwise French. getCurrentUser
// is wrapped in React's cache() (see lib/auth.ts), so calling it here on
// top of every page's own call doesn't add an extra request per render.
export async function getServerLocale(): Promise<LocaleCode> {
  const user = await getCurrentUser();
  if (user?.language && isLocaleCode(user.language)) return user.language;

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isLocaleCode(cookieLocale)) return cookieLocale;

  return DEFAULT_LOCALE;
}
