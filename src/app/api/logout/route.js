import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set('token', '', { maxAge: 0 }); // Clear the token cookie
  return new Response(JSON.stringify({ message: 'Logged out successfully' }), { status: 200 });
}