import { NextResponse } from 'next/server';
import { addBloodStock } from '@/actions/blood-bank';

export async function POST(req) {
  try {
    const { bloodGroup, quantity } = await req.json();
    const result = await addBloodStock({ bloodGroup, quantity: Number(quantity) });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to add stock' }, { status: 400 });
  }
}
