import { NextResponse } from 'next/server';
import { addBloodBankUser } from '@/actions/admin';

export async function POST(req) {
  try {
    const { bloodBankId, userId, role } = await req.json();
    const formData = new FormData();
    formData.append('bloodBankId', bloodBankId);
    formData.append('userId', userId);
    if (role) formData.append('role', role);

    const result = await addBloodBankUser(formData);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to add user to blood bank' }, { status: 400 });
  }
}