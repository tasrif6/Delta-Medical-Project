import { NextResponse } from 'next/server';
import { cancelBloodBooking } from '@/actions/blood-bank';

export async function POST(req) {
  try {
    const { id } = await req.json();
    const result = await cancelBloodBooking(id);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to cancel booking' }, { status: 400 });
  }
}
