'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useDirection } from './useDirection';
import type { Direction } from './config';

const DirectionContext = createContext<Direction>('ltr');

export function DirectionProvider({ children }: { children: ReactNode }) {
    const dir = useDirection();

    return (
        <DirectionContext.Provider value={dir}>
            <div dir={dir} className="contents">
                {children}
            </div>
        </DirectionContext.Provider>
    );
}

export function useDirectionContext() {
    return useContext(DirectionContext);
}
