import { createClient } from 'redis';
import { envVars } from './env';

class RedisService {
  private client: any;

  constructor() {
    const redisUrl = `redis://${envVars.REDIS_USERNAME}:${envVars.REDIS_PASSWORD}@${envVars.REDIS_HOST}:${envVars.REDIS_PORT}`;

    this.client = createClient({
      url: redisUrl,
    });

    this.client.on('error', (err: any) => {
      console.error('Redis Client Error', err);
    });

    this.client.connect();
  }

  async set(key: string, value: any, expiration = 3600): Promise<void> {
    await this.client.set(key, JSON.stringify(value), {
      EX: expiration,
    });
  }

  async get(key: string): Promise<any> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async clearPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }
}

export const redisService = new RedisService();
