import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  const cookieStore = await cookies(); // Await cookies before using
  const token = cookieStore.get('token'); // Retrieve the token after awaiting
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Replace 'your-secret-key' with the actual secret key used to sign your JWT
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    
    // Proceed with your logic, e.g., send a response with decoded data
    return new Response(JSON.stringify({ message: 'Protected content', user: decoded }), {
      status: 200,
    });
  } catch (error) {
    return new Response('Invalid token', { status: 403 });
  }
}
