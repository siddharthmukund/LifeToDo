'use client';

import { useLocalePreference } from './useLocalePreference';
import { i18nConfig } from './config';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Locale } from './config';

export function LocaleSwitcher() {
    const { currentLocale, setLocale, isPending } = useLocalePreference();

    return (
        <div className="flex flex-col gap-2 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-2 text-content-primary p-2">
                <Globe size={18} />
                <span className="font-semibold">Language / भाषा / اللغة</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {i18nConfig.locales.map((loc) => {
                    const meta = i18nConfig.localeMetadata[loc as Locale];
                    const isSelected = currentLocale === loc;

                    return (
                        <button
                            key={loc}
                            disabled={isPending}
                            onClick={() => setLocale(loc as Locale)}
                            className={cn(
                                "flex items-center justify-between p-3 rounded-lg border transition-all text-sm",
                                isSelected
                                    ? "border-primary bg-primary/10 text-primary-ink font-bold shadow-sm"
                                    : "border-border-default bg-surface-card text-content-secondary hover:border-primary/50 hover:text-content-primary",
                                isPending && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <span>{meta.nativeName}</span>
                            <span className="text-[10px] opacity-60 uppercase">{loc}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
