"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const { t } = useI18n();

  if (images.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-card bg-hz-sky">
        <MapPin className="h-10 w-10 text-hz-navy/30" />
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-card bg-hz-sky">
        <Image src={images[index]} alt={`${title} — photo ${index + 1}`} fill className="object-cover" priority />
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label={t("listing.gallery_prev")}
              onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
            >
              <ChevronLeft className="h-5 w-5 text-hz-navy" />
            </button>
            <button
              type="button"
              aria-label="Photo suivante"
              onClick={() => setIndex((i) => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
            >
              <ChevronRight className="h-5 w-5 text-hz-navy" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
              {index + 1}/{images.length}
            </span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2",
                i === index ? "border-hz-blue" : "border-transparent"
              )}
            >
              <Image src={src} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
