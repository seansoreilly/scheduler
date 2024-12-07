import { NextRequest, NextResponse } from 'next/server';
import { createMeeting, getMeeting, updateMeeting } from '@/lib/kv';
import { Meeting } from '@/types/meeting';

interface ErrorWithMessage {
  message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;
  
  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    return new Error(String(maybeError));
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ guid: string }> }
) {
  try {
    const guid = (await params).guid;
    console.log('GET request for meeting:', guid);

    const meeting = await getMeeting(guid);
    if (!meeting) {
      console.log('Meeting not found:', guid);
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }
    console.log('Returning meeting:', meeting);
    return NextResponse.json(meeting);
  } catch (err: unknown) {
    const error = toErrorWithMessage(err);
    console.error('Failed to get meeting:', error);
    return NextResponse.json({ 
      error: 'Server error', 
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ guid: string }> }
) {
  try {
    const guid = (await params).guid;
    const data = await request.json() as Meeting;
    console.log('POST request for meeting:', guid, data);

    await createMeeting(guid, data);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const error = toErrorWithMessage(err);
    console.error('Failed to create meeting:', error);
    return NextResponse.json({ 
      error: 'Server error', 
      details: error.message
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ guid: string }> }
) {
  try {
    const guid = (await params).guid;
    const data = await request.json() as Meeting;
    console.log('PUT request for meeting:', guid, data);

    await updateMeeting(guid, data);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const error = toErrorWithMessage(err);
    console.error('Failed to update meeting:', error);
    return NextResponse.json({ 
      error: 'Server error', 
      details: error.message
    }, { status: 500 });
  }
}