"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

/**
 * Keeps <html lang> in sync with the active next-intl locale.
 * The root layout renders a static `lang` (SSR), so we patch it on the
 * client once mounted to match the `[locale]` segment for screen readers
 * and assistive tech.
 */
export function LanguageUpdater() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}