import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeatureHeaderProps {
  title: string;
  href: string;
}

export function FeatureHeader({ title, href }: FeatureHeaderProps) {
  return (
    <header className="sticky top-4 z-50 mx-4 mb-6 flex items-center justify-between px-3 py-2 rounded-[100px] border border-black/15 bg-white/60 shadow-[0_0_5px_1px_rgba(0,0,0,0.1)] backdrop-blur-[7.5px]">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full bg-black/5 hover:bg-black/10">
          <Link href={href}>
            <ArrowLeft className="h-4 w-4 text-gray-700" />
          </Link>
        </Button>
        <h1 className="text-sm font-semibold text-gray-900 leading-none">
          {title}
        </h1>
      </div>

      {/* Right side placeholder (to balance if needed, or actions) */}
      <div className="w-8" />
    </header>
  );
}
