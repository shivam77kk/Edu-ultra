import NodeCache from 'node-cache';

/**
 * Simple in-memory cache for AI responses
 * Reduces duplicate API calls for identical requests
 * TTL: 1 hour (3600 seconds)
 */
class AIResponseCache {
    constructor() {
        // Cache with 1 hour TTL and check period of 10 minutes
        this.cache = new NodeCache({
            stdTTL: 3600, // 1 hour
            checkperiod: 600, // Check for expired keys every 10 minutes
            useClones: false // Better performance
        });

        // Track cache statistics
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0
        };
    }

    /**
     * Generate cache key from request parameters
     */
    generateKey(type, params) {
        // Create a deterministic key from request type and parameters
        const sortedParams = JSON.stringify(params, Object.keys(params).sort());
        return `${type}:${sortedParams}`;
    }

    /**
     * Get cached response
     */
    get(type, params) {
        const key = this.generateKey(type, params);
        const value = this.cache.get(key);

        if (value !== undefined) {
            this.stats.hits++;
            console.log(`✅ Cache HIT for ${type} (${this.getCacheHitRate()}% hit rate)`);
            return value;
        }

        this.stats.misses++;
        console.log(`❌ Cache MISS for ${type} (${this.getCacheHitRate()}% hit rate)`);
        return null;
    }

    /**
     * Set cached response
     */
    set(type, params, response) {
        const key = this.generateKey(type, params);
        const success = this.cache.set(key, response);

        if (success) {
            this.stats.sets++;
            console.log(`💾 Cached response for ${type} (Total cached: ${this.cache.keys().length})`);
        }

        return success;
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.flushAll();
        console.log('🗑️  Cache cleared');
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            ...this.stats,
            hitRate: this.getCacheHitRate(),
            totalKeys: this.cache.keys().length,
            cacheSize: this.cache.getStats()
        };
    }

    /**
     * Calculate cache hit rate
     */
    getCacheHitRate() {
        const total = this.stats.hits + this.stats.misses;
        if (total === 0) return 0;
        return ((this.stats.hits / total) * 100).toFixed(2);
    }
}

// Export singleton instance
export default new AIResponseCache();
