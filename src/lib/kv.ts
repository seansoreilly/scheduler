import { kv } from '@vercel/kv';
import { Meeting } from '@/types/meeting';

export async function getMeeting(guid: string): Promise<Meeting | null> {
  return await kv.get(`meeting:${guid}`);
}

export async function createMeeting(guid: string, data: Meeting): Promise<void> {
  await kv.set(`meeting:${guid}`, data);
}

export async function updateMeeting(guid: string, data: Meeting): Promise<void> {
  await kv.set(`meeting:${guid}`, data);
}