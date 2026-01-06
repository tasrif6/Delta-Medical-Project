import { NextResponse } from 'next/server';
import { bookBlood } from '@/actions/blood-bank';

export async function POST(req) {
  try {
    const body = await req.json();
    const { bloodGroup, quantity, emergency } = body;
    const result = await bookBlood({ bloodGroup, quantity: Number(quantity), emergency: Boolean(emergency) });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to book blood' }, { status: 400 });
  }
}
