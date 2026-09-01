import Link from "next/link";
import { SignInForm } from "./sign-in-form";
import { getServerLocale } from "@/lib/i18n/get-locale";
import { DICTIONARIES } from "@/lib/i18n/registry";

export default async function SignInPage({
  searchParams,
}: PageProps<"/connexion">) {
  const [params, locale] = await Promise.all([searchParams, getServerLocale()]);
  const t = DICTIONARIES[locale];
  const next = typeof params.next === "string" ? params.next : undefined;
  const notice = params.inscrit
    ? t.auth.account_created_notice
    : params.reinitialise
    ? t.auth.password_updated_notice
    : undefined;

  return (
    <div>
      <h1 className="text-xl font-semibold text-hz-navy">{t.auth.signin_title}</h1>
      <p className="mt-1 text-sm text-hz-ink/60">{t.auth.signin_subtitle}</p>

      <SignInForm next={next} notice={notice} />

      <p className="mt-6 text-center text-sm text-hz-ink/60">
        {t.auth.no_account_yet}{" "}
        <Link href="/inscription" className="font-medium text-hz-blue">
          {t.auth.sign_up_link}
        </Link>
      </p>
    </div>
  );
}
