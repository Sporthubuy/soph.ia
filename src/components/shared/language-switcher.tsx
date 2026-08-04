"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { locales, type Locale } from "@/i18n/config";

const labels: Record<Locale, string> = {
  es: "ES",
  en: "EN",
  pt: "PT",
  fr: "FR",
};

export const LanguageSwitcher = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Language">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchLocale(l)}
          aria-pressed={l === locale}
          className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
            l === locale
              ? "bg-[var(--azure-deep)] text-[#3b82f6]"
              : "text-[var(--star-4)] hover:text-[var(--star-1)]"
          }`}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
};
