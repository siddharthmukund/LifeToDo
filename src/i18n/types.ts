/**
 * Will be populated securely if utilizing next-intl global type definition workflows.
 * Used for IDE intellisense.
 */
import { i18nConfig } from './config';

export type SupportedLocale = typeof i18nConfig.locales[number];
