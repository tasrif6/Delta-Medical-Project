import { NextResponse } from 'next/server';
import { removeBloodStock } from '@/actions/blood-bank';

export async function POST(req) {
  try {
    const { bloodGroup, quantity } = await req.json();
    const result = await removeBloodStock({ bloodGroup, quantity: Number(quantity) });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to remove stock' }, { status: 400 });
  }
}
