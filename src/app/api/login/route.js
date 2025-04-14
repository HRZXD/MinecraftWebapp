import db from '../../lib/mysql';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, password } = body;
    
        if (!username || !password) {
        return Response.json({ message: 'Missing fields' }, { status: 400 });
        }
    
        // Check if user exists
        const [user] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (user.length === 0) {
        return Response.json({ message: 'User not found' }, { status: 404 });
        }
    
        // Compare password
        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) {
        return Response.json({ message: 'Invalid credentials' }, { status: 401 });
        }
        
        // Generate JWT token
        const token = jwt.sign({ username: user[0].username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Set token in cookie
        const cookieStore = await cookies();
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 3600, // 1 hours
        });
    
        return Response.json({ message: 'Login successful' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Internal server error' }, { status: 500 });
    }
}