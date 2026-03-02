import { vi } from 'vitest';

export class mockDexie {
    constructor(databaseName: string) {
        // console.log(`Mock DB initialized: ${databaseName}`);
    }

    version = vi.fn().mockReturnThis();
    stores = vi.fn().mockReturnThis();
    open = vi.fn().mockResolvedValue(true);

    tasks = {
        add: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        clear: vi.fn(),
        toArray: vi.fn().mockResolvedValue([]),
        where: vi.fn().mockReturnValue({
            equals: vi.fn().mockReturnValue({
                toArray: vi.fn().mockResolvedValue([])
            }),
            equalsIgnoreCase: vi.fn().mockReturnValue({
                toArray: vi.fn().mockResolvedValue([])
            })
        }),
    };

    lifetimeStats = {
        get: vi.fn().mockResolvedValue({
            id: 'global_stats',
            tasksCompleted: 42,
            inboxZeroCount: 5,
            weeklyReviewsCompleted: 2,
            streakDays: 4,
            lastActiveDate: new Date().toISOString()
        }),
        put: vi.fn(),
        update: vi.fn(),
    };

    transaction = vi.fn().mockImplementation(async (_mode, _tables, callback) => {
        return callback();
    });
}
