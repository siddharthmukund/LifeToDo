/**
 * deeplinkRouter.ts
 * Listens for Capacitor App URL-open events and dispatches in-app navigation.
 * Thin wrapper around the navigation/deepLinkHandler implementation.
 */

export { addDeepLinkListener, removeDeepLinkListeners } from '../navigation/deepLinkHandler';
export { resolveDeepLink, DEEP_LINK_ROUTES, DEEP_LINK_SCHEME, DEEP_LINK_DOMAIN } from './deeplinkConfig';
