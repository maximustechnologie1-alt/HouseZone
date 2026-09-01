import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const HOST_ROUTE_PREFIX = "/espace-hote";
const ADMIN_ROUTE_PREFIX = "/admin";
const PUBLIC_ADMIN_ROUTES = ["/admin/connexion"];
// A suspended/banned account loses the features tied to its sanction (RG18)
// — not just the host/admin dashboards — so this check runs for every
// authenticated route below, with only the suspension notice itself exempt.
const SUSPENDED_ACCOUNT_ROUTE = "/compte-suspendu";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isHostRoute = pathname.startsWith(HOST_ROUTE_PREFIX);
  const isAdminRoute =
    pathname.startsWith(ADMIN_ROUTE_PREFIX) &&
    !PUBLIC_ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  if ((isHostRoute || isAdminRoute) && !user) {
    const redirectPath = isAdminRoute ? "/admin/connexion" : "/connexion";
    const url = request.nextUrl.clone();
    url.pathname = redirectPath;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname !== SUSPENDED_ACCOUNT_ROUTE) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role,status")
      .eq("id", user.id)
      .single();

    if (profile?.status !== "active") {
      const url = request.nextUrl.clone();
      url.pathname = SUSPENDED_ACCOUNT_ROUTE;
      return NextResponse.redirect(url);
    }

    if (isAdminRoute && profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/connexion";
      return NextResponse.redirect(url);
    }

    if (isHostRoute && profile?.role === "client") {
      const url = request.nextUrl.clone();
      url.pathname = "/devenir-hote";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
