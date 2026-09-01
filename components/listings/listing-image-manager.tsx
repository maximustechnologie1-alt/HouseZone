"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, Upload } from "lucide-react";
import { uploadListingImageAction, deleteListingImageAction } from "@/lib/actions/listings";
import { publicListingImageUrl } from "@/lib/storage-urls";
import { useI18n } from "@/lib/i18n/context";
import type { ListingImage } from "@/lib/types/database";

export function ListingImageManager({ listingId, images }: { listingId: string; images: ListingImage[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { t } = useI18n();

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl bg-hz-sky">
            <Image src={publicListingImageUrl(img.storage_path)} alt="" fill className="object-cover" />
            {img.is_flagged && (
              <div className="absolute inset-x-0 top-0 flex items-center gap-1 bg-amber-500/90 px-2 py-1 text-[10px] text-white">
                <AlertTriangle className="h-3 w-3" /> {t("listing_form.flagged_by_ocr")}
              </div>
            )}
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await deleteListingImageAction(img.id, listingId);
                  router.refresh();
                })
              }
              className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600"
              aria-label={t("listing_form.delete_photo")}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <form
        ref={formRef}
        className="mt-3"
        action={(formData) =>
          startTransition(async () => {
            const result = await uploadListingImageAction(listingId, formData);
            if (result.error) setError(result.error);
            else {
              setError(undefined);
              formRef.current?.reset();
              router.refresh();
            }
          })
        }
      >
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-hz-navy/20 py-4 text-sm text-hz-ink/60 hover:bg-hz-sky/40">
          <Upload className="h-4 w-4" />
          {pending ? t("listing_form.uploading") : t("listing_form.add_photo")}
          <input
            type="file"
            name="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) formRef.current?.requestSubmit();
            }}
          />
        </label>
      </form>
      <p className="mt-2 text-xs text-hz-ink/40">{t("listing_form.ocr_notice")}</p>
    </div>
  );
}
