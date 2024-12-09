import { Redis } from 'ioredis';
import { Meeting } from '@/types/meeting';
import { MeetingCleanup } from './cleanup';

// Add debug logging for Redis URL
console.log('Redis URL configured:', !!process.env.REDIS_URL);

export const redis = new Redis(process.env.REDIS_URL || '', {
  retryStrategy: (times) => {
    console.log('Redis retry attempt:', times);
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

redis.on('ready', () => {
  console.log('Redis is ready to accept commands');
});

const isRedisConfigured = process.env.REDIS_URL;

export async function getMeeting(guid: string): Promise<Meeting | null> {
  try {
    if (!isRedisConfigured) {
      console.warn('Redis is not configured. Using mock data.');
      return null;
    }
    console.log('Attempting to get meeting:', guid);
    const data = await redis.get(`meeting:${guid}`);
    
    if (data) {
      // Track access time whenever meeting is retrieved
      await MeetingCleanup.trackMeetingAccess(guid);
    }
    
    console.log(`Retrieved meeting ${guid}:`, data);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting meeting:', error);
    return null;
  }
}

export async function createMeeting(guid: string, data: Meeting): Promise<void> {
  try {
    if (!isRedisConfigured) {
      console.warn('Redis is not configured. Data will not persist.');
      return;
    }
    const jsonData = JSON.stringify(data);
    console.log(`Attempting to create meeting ${guid}:`, jsonData);
    const pipeline = redis.pipeline();
    pipeline.set(`meeting:${guid}`, jsonData);
    pipeline.set(`access:${guid}`, new Date().toISOString());
    await pipeline.exec();
    console.log(`Meeting ${guid} created and access time recorded`);
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
}

export async function updateMeeting(guid: string, data: Meeting): Promise<void> {
  try {
    if (!isRedisConfigured) {
      console.warn('Redis is not configured. Data will not persist.');
      return;
    }
    const jsonData = JSON.stringify(data);
    console.log(`Attempting to update meeting ${guid}:`, jsonData);
    const pipeline = redis.pipeline();
    pipeline.set(`meeting:${guid}`, jsonData);
    pipeline.set(`access:${guid}`, new Date().toISOString());
    await pipeline.exec();
    console.log(`Meeting ${guid} updated and access time recorded`);
  } catch (error) {
    console.error('Error updating meeting:', error);
    throw error;
  }
}

export async function debugRedis(): Promise<void> {
  try {
    console.log('Redis status:', redis.status);
    const keys = await redis.keys('meeting:*');
    console.log('All meeting keys:', keys);
    
    for (const key of keys) {
      const data = await redis.get(key);
      console.log(`Data for ${key}:`, data);
    }
  } catch (error) {
    console.error('Debug Redis error:', error);
  }
}