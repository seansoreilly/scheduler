import { NextResponse } from 'next/server';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || '', {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

export async function GET() {
  try {
    // Basic connection info
    const connectionInfo = {
      status: redis.status,
      redisUrl: process.env.REDIS_URL ? 'Configured' : 'Not configured',
      connected: redis.status === 'ready'
    };

    // Only try to get data if connected
    let data = {};
    if (redis.status === 'ready') {
      // Get all keys matching meeting:*
      const keys = await redis.keys('meeting:*');
      
      // Get all meetings data
      const meetings = await Promise.all(
        keys.map(async (key) => {
          const value = await redis.get(key);
          return {
            key,
            value: value ? JSON.parse(value) : null
          };
        })
      );

      data = { keys, meetings };
    }

    return NextResponse.json({ 
      ...connectionInfo,
      data
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to get Redis data',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  } finally {
    // Close the connection
    await redis.quit();
  }
} 