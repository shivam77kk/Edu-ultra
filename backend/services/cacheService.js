import NodeCache from 'node-cache';


class AIResponseCache {
    constructor() {
        
        this.cache = new NodeCache({
            stdTTL: 3600, 
            checkperiod: 600, 
            useClones: false 
        });

        
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0
        };
    }

    
    generateKey(type, params) {
        
        const sortedParams = JSON.stringify(params, Object.keys(params).sort());
        return `${type}:${sortedParams}`;
    }

    
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

    
    set(type, params, response) {
        const key = this.generateKey(type, params);
        const success = this.cache.set(key, response);

        if (success) {
            this.stats.sets++;
            console.log(`💾 Cached response for ${type} (Total cached: ${this.cache.keys().length})`);
        }

        return success;
    }

    
    clear() {
        this.cache.flushAll();
        console.log('🗑️  Cache cleared');
    }

    
    getStats() {
        return {
            ...this.stats,
            hitRate: this.getCacheHitRate(),
            totalKeys: this.cache.keys().length,
            cacheSize: this.cache.getStats()
        };
    }

    
    getCacheHitRate() {
        const total = this.stats.hits + this.stats.misses;
        if (total === 0) return 0;
        return ((this.stats.hits / total) * 100).toFixed(2);
    }
}


export default new AIResponseCache();
