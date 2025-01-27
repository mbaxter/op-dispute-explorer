import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Clock } from './claim';

describe('Clock', () => {
    let now: number;
    
    beforeEach(() => {
        // Fix the current time for testing
        now = 1700000000000; // Some fixed timestamp in ms
        vi.useFakeTimers();
        vi.setSystemTime(now);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // Helper function to create a clock with given duration
    const createClock = (durationSeconds: number | bigint): Clock => {
        const timestampSeconds = BigInt(now / 1000);
        const duration = BigInt(durationSeconds);
        return new Clock((timestampSeconds << BigInt(64)) | duration);
    };

    it('correctly decodes timestamp and duration from bigint', () => {
        const clock = createClock(3600); // 1 hour duration
        
        expect(clock.duration).toBe(3600);
        expect(clock.timestamp.getTime()).toBe(now);
        expect(clock.value).toBe((BigInt(now / 1000) << BigInt(64)) | BigInt(3600));
    });

    it('correctly determines when clock is not expired', () => {
        const clock = createClock(3600); // 1 hour duration
        
        // Check 30 minutes in
        vi.advanceTimersByTime(30 * 60 * 1000); // Advance 30 minutes
        
        expect(clock.isExpired()).toBe(false);
        expect(clock.getRemainingSeconds()).toBe(1800); // 30 minutes remaining
    });

    it('correctly determines when clock is expired', () => {
        const clock = createClock(3600); // 1 hour duration
        
        // Check after 2 hours
        vi.advanceTimersByTime(2 * 60 * 60 * 1000); // Advance 2 hours
        
        expect(clock.isExpired()).toBe(true);
        expect(clock.getRemainingSeconds()).toBe(0);
    });

    it('handles zero duration', () => {
        const clock = createClock(0);
        
        expect(clock.isExpired()).toBe(true);
        expect(clock.getRemainingSeconds()).toBe(0);
    });

    it('handles maximum duration', () => {
        const maxUint64 = BigInt("0xFFFFFFFFFFFFFFFF");
        const clock = createClock(maxUint64);
        
        expect(clock.duration).toBe(Number(maxUint64));
        expect(clock.isExpired()).toBe(false);
    });
}); 