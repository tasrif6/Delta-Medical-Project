import { NextResponse } from 'next/server';
import { updateBloodBank } from '@/actions/admin';

export async function POST(req) {
  try {
    const { bloodBankId, name, address, city, phone, email } = await req.json();
    const formData = new FormData();
    formData.append('bloodBankId', bloodBankId);
    if (name) formData.append('name', name);
    if (address) formData.append('address', address);
    if (city) formData.append('city', city);
    if (phone) formData.append('phone', phone);
    if (email) formData.append('email', email);

    const result = await updateBloodBank(formData);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to update bank' }, { status: 400 });
  }
}
