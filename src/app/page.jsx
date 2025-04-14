'use client'
import { useEffect , useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const backend = 'http://192.168.100.183:5000';
  const [cmd, setCmd] = useState('');
  const [logs, setLogs] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const [fileList, setFileList] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await fetch('/api/verifyToken', {
          method: 'GET',
          credentials: 'include', // Include cookies in the request
        });

        if (res.ok) {
          const data = await res.json();
          return data; // Return the decoded user data if valid
        } else {
          // Redirect to login if unauthorized or token is invalid
          router.push('/login');
          return null;
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        router.push('/login'); // Redirect to login on error
        return null;
      }
    };

    verifyToken();
  }, [router]); // Add router to the dependency array

  const startServer = async () => {
    await fetch(`${backend}/start`, { method: 'POST' });
  };

  const stopServer = async () => {
    await fetch(`${backend}/stop`, { method: 'POST' });
  };

  const sendCommand = async () => {
    await fetch(`${backend}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd })
    });
    setCmd('');
  };

  const loadLogs = async () => {
    const res = await fetch(`${backend}/logs`);
    const data = await res.json();
    setLogs(data.log);
  };

  const loadFileList = async (path = '') => {
    const res = await fetch(`${backend}/files?path=${encodeURIComponent(path)}`);
    const data = await res.json();
    setCurrentPath(data.current_path);
    setFileList(data.items);
  };

  const enterDir = (name) => {
    const newPath = currentPath === '.' ? name : `${currentPath}/${name}`;
    loadFileList(newPath);
  };

  const goUp = () => {
    const parts = currentPath.split('/').filter(p => p !== '');
    parts.pop();
    const newPath = parts.join('/') || '.';
    loadFileList(newPath);
  };

  const uploadHere = async () => {
    if (!uploadFile) return;
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('path', currentPath);
    await fetch(`${backend}/upload`, {
      method: 'POST',
      body: formData
    });
    loadFileList(currentPath);
  };

  const deleteFile = async (filename) => {
    await fetch(`${backend}/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, path: currentPath })
    });
    loadFileList(currentPath);
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 2000);
    loadFileList();
    return () => clearInterval(interval);
  }, []);

  const logout = async () => {
    try {
      const res = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        router.push('/login'); // Redirect to login after logout
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <main className="min-h-screen bg-black text-green-400 font-mono p-6">
      <h1 className="text-2xl mb-4">Minecraft Server Control</h1>
      <div className="space-x-2 mb-4">
        <button onClick={startServer} className="bg-green-800 px-4 py-1 rounded">Start</button>
        <button onClick={stopServer} className="bg-red-800 px-4 py-1 rounded">Stop</button>
        <button onClick={logout} className="bg-yellow-800 px-4 py-1 rounded">Logout</button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={cmd}
          onChange={e => setCmd(e.target.value)}
          placeholder="Enter command"
          className="bg-black border border-green-500 p-1 mr-2 text-green-300 w-64"
        />
        <button onClick={sendCommand} className="bg-green-800 px-3 py-1 rounded">Send</button>
      </div>

      <div className="mb-6">
        <h3 className="text-xl mb-2">Live Logs</h3>
        <pre className="bg-[#111] border border-green-600 p-3 max-h-72 overflow-auto">{logs}</pre>
      </div>

      <div>
        <h3 className="text-xl mb-2">File Explorer</h3>
        <div className="mb-2">Current: <span className="text-green-300">/{currentPath}</span></div>
        <ul className="mb-4">
          {currentPath !== '.' && (
            <li>
              <button onClick={goUp} className="underline text-green-400">⬅️ Up</button>
            </li>
          )}
          {fileList.map((item, idx) => (
            <li key={idx} className="mb-1">
              {item.is_dir ? (
                <span>
                  <b>[DIR]</b>{' '}
                  <button onClick={() => enterDir(item.name)} className="underline text-green-400">
                    {item.name}
                  </button>
                </span>
              ) : (
                <span>
                  {item.name}{' '}
                  <button onClick={() => deleteFile(item.name)} className="text-red-400">Delete</button>
                </span>
              )}
            </li>
          ))}
        </ul>

        <input
          type="file"
          onChange={(e) => setUploadFile(e.target.files[0])}
          className="text-green-300 mb-2"
        />
        <br />
        <button onClick={uploadHere} className="bg-green-800 px-4 py-1 rounded">Upload Here</button>
      </div>
    </main>
  );
}
