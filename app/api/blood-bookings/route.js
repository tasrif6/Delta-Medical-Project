import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/actions/onboarding';
import { getBloodBookings } from '@/actions/blood-bank';

export async function GET() {
  try {
    const user = await getCurrentUser();
    const bookings = await getBloodBookings({ user });
    return NextResponse.json(bookings);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to fetch bookings' }, { status: 500 });
  }
}
