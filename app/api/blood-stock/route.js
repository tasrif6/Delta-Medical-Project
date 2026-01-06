import { NextResponse } from 'next/server';
import { getBloodStock } from '@/actions/blood-bank';

export async function GET() {
  try {
    const stocks = await getBloodStock();
    return NextResponse.json(stocks);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to fetch stock' }, { status: 500 });
  }
}
