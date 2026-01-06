import { NextResponse } from 'next/server';
import { addBloodInventory } from '@/actions/admin';

export async function POST(req) {
  try {
    const { bloodBankId, bloodGroup, units } = await req.json();
    const formData = new FormData();
    formData.append('bloodBankId', bloodBankId);
    formData.append('bloodGroup', bloodGroup);
    formData.append('units', units);
    const result = await addBloodInventory(formData);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to add inventory' }, { status: 400 });
  }
}
