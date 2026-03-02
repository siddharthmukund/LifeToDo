import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider } from '@/auth/AuthProvider';

// Import messages
import messages from '@/../messages/en/common.json';

interface AllTheProvidersProps {
    children: ReactNode;
}

// Custom wrapper to provide necessary context for all components under test.
// Simulates the LocaleLayout context locally.
function AllTheProviders({ children }: AllTheProvidersProps) {
    return (
        <NextIntlClientProvider locale="en" messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
