import { NextRequest, NextResponse } from 'next/server';
import { createMeeting, getMeeting, updateMeeting } from '@/lib/kv';
import { Meeting } from '@/types/meeting';

// interface RouteContext {
//   params: {
//     guid: string;
//   };
// }

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const guid = (await params).id

    const meeting = await getMeeting(guid);
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }
    return NextResponse.json(meeting);
  } catch (err) {
    console.error('Failed to get meeting:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await request.json() as Meeting;
    await createMeeting((await params).id, data);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Failed to create meeting:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await request.json() as Meeting;
    await updateMeeting((await params).id, data);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Failed to update meeting:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}