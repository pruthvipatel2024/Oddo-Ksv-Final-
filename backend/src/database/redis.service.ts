import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private readonly logger = new Logger('RedisService');
  private readonly useMemory: boolean;
  private readonly memoryStore = new Map<string, { value: string; expiresAt?: number }>();

  constructor(private readonly configService: ConfigService) {
    const enabled = this.configService.get<string>('REDIS_ENABLED', 'true') === 'true';

    if (!enabled) {
      this.logger.warn('Redis is disabled. Using in-memory fallback store.');
      this.useMemory = true;
      return;
    }

    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');

    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      maxRetriesPerRequest: null, // Required by BullMQ
    });
    this.useMemory = false;
  }

  onModuleInit() {
    if (this.client) {
      this.client.on('connect', () => {
        this.logger.log('Connected to Redis successfully');
      });

      this.client.on('error', (err) => {
        this.logger.error('Redis connection error:', err);
      });
    }
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }

  /**
   * Get raw ioredis client.
   */
  getClient(): Redis {
    if (this.useMemory || !this.client) {
      throw new Error('Redis client is not available (in-memory mode is active)');
    }
    return this.client;
  }

  /**
   * Set a key in Redis with optional TTL (seconds).
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.useMemory) {
      this.memoryStore.set(key, {
        value,
        expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
      });
      return;
    }
    if (ttlSeconds) {
      await this.client!.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client!.set(key, value);
    }
  }

  /**
   * Get a key from Redis.
   */
  async get(key: string): Promise<string | null> {
    if (this.useMemory) {
      const item = this.memoryStore.get(key);
      if (!item) return null;
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.memoryStore.delete(key);
        return null;
      }
      return item.value;
    }
    return this.client!.get(key);
  }

  /**
   * Delete a key from Redis.
   */
  async del(key: string): Promise<void> {
    if (this.useMemory) {
      this.memoryStore.delete(key);
      return;
    }
    await this.client!.del(key);
  }

  /**
   * Check if a key exists in Redis.
   */
  async exists(key: string): Promise<boolean> {
    if (this.useMemory) {
      return (await this.get(key)) !== null;
    }
    const result = await this.client!.exists(key);
    return result === 1;
  }
}
