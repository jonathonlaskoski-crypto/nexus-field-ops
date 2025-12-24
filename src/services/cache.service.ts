/**
 * Cache Service
 * Provides in-memory and localStorage caching with TTL support
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheService {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly STORAGE_PREFIX = 'nexus_cache_';
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_MEMORY_ENTRIES = 50;

  /**
   * Set a value in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    // Store in memory cache
    this.memoryCache.set(key, entry);

    // Limit memory cache size
    if (this.memoryCache.size > this.MAX_MEMORY_ENTRIES) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem(
        this.STORAGE_PREFIX + key,
        JSON.stringify(entry)
      );
    } catch (error) {
      console.warn('Failed to cache to localStorage:', error);
    }
  }

  /**
   * Get a value from cache
   * Returns null if not found or expired
   */
  get<T>(key: string): T | null {
    // Try memory cache first
    let entry = this.memoryCache.get(key);

    // If not in memory, try localStorage
    if (!entry) {
      try {
        const stored = localStorage.getItem(this.STORAGE_PREFIX + key);
        if (stored) {
          entry = JSON.parse(stored);
          // Restore to memory cache
          if (entry) {
            this.memoryCache.set(key, entry);
          }
        }
      } catch (error) {
        console.warn('Failed to read from cache:', error);
        return null;
      }
    }

    if (!entry) {
      return null;
    }

    // Check if expired
    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific cache entry
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(this.STORAGE_PREFIX + key);
    } catch (error) {
      console.warn('Failed to delete from cache:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.memoryCache.clear();
    
    try {
      // Clear all cache entries from localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();

    // Clear from memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        this.memoryCache.delete(key);
      }
    }

    // Clear from localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const entry = JSON.parse(stored);
              const age = now - entry.timestamp;
              if (age > entry.ttl) {
                localStorage.removeItem(key);
              }
            } catch {
              // Invalid entry, remove it
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.warn('Failed to clear expired cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memoryEntries: number;
    storageEntries: number;
    totalSize: number;
  } {
    let storageEntries = 0;
    let totalSize = 0;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          storageEntries++;
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += value.length;
          }
        }
      });
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
    }

    return {
      memoryEntries: this.memoryCache.size,
      storageEntries,
      totalSize,
    };
  }

  /**
   * Generate a cache key from parameters
   */
  generateKey(prefix: string, ...params: any[]): string {
    return `${prefix}_${params.map(p => JSON.stringify(p)).join('_')}`;
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Auto-clear expired entries every 5 minutes
setInterval(() => {
  cacheService.clearExpired();
}, 5 * 60 * 1000);
