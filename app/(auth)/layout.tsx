import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/ui/logo-mark";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col bg-hz-sky">
      <div className="hz-container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark size={32} />
          <Wordmark />
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md rounded-card border border-hz-navy/10 bg-white p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
