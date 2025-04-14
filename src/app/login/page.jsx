'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      withCredentials: true,
    });

    if (res.ok) {
      router.push('/'); // Redirect to home page on success
    } else {
      const errorData = await res.json();
      alert(errorData.message); // Show error message
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-green-500 font-mono">
      <div className="w-full max-w-md p-8 border border-green-500 rounded">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form>
          <div className="mb-4">
            <label htmlFor="username" className="block mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full p-2 bg-black border border-green-500 rounded text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-2 bg-black border border-green-500 rounded text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 mt-4 bg-green-500 text-black font-bold rounded hover:bg-green-600"
            onClick={handleSubmit}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;