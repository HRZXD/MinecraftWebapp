'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import deleteIcon from '../../public/delete.png';
import Image from 'next/image';

export default function Home() {
  const backend = "http://hrcompany.3bbddns.com:39854";
  const [cmd, setCmd] = useState('');
  const [logs, setLogs] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const [fileList, setFileList] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [isServerRunning, setIsServerRunning] = useState(false);
  const router = useRouter();
  const goToEditor = (namefile) => {
    const path = currentPath; // represents root
    const filename = namefile;
    router.push(`/edit/${encodeURIComponent(path)}/${filename}`);
  };
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await fetch('/api/verifyToken', {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          return data;
        } else {
          router.push('/login');
          return null;
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        router.push('/login');
        return null;
      }
    };

    verifyToken();
  }, [router]);

  const checkServerStatus = async () => {
    const res = await fetch(`${backend}/status`);
    const data = await res.json();
    if (data.running) {
      setIsServerRunning(true);
    } else {
      setIsServerRunning(false);
    }
  };

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
    if (!uploadFile) {
      Swal.fire({
        title: "กรุณาเลือกไฟล์",
        text: "คุณต้องเลือกไฟล์เพื่ออัปโหลด",
        icon: "warning",
        background: "#1e1e2f",
        color: "#a5f3fc",
        customClass: {
          popup: 'rounded-xl shadow-lg font-mono',
          title: 'text-green-400 text-lg',
          confirmButton: 'px-6 py-2 text-sm font-bold',
          cancelButton: 'px-6 py-2 text-sm'
        },
      });
      return;
    }
  
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('path', currentPath);
  
    const response = await fetch(`${backend}/upload`, {
      method: 'POST',
      body: formData
    });
    if (response.ok) {
      Swal.fire({
        title: "อัปโหลดไฟล์เรียบร้อย",
        text: "ไฟล์ของคุณถูกอัปโหลดเรียบร้อยแล้ว",
        icon: "success",
        background: "#1e1e2f",
        color: "#a5f3fc",
        customClass: {
          popup: 'rounded-xl shadow-lg font-mono',
          title: 'text-green-400 text-lg',
          confirmButton: 'px-6 py-2 text-sm font-bold',
          cancelButton: 'px-6 py-2 text-sm'
        },
      });
    }
    setUploadFile(null);
    loadFileList(currentPath);
  };

  const deleteFile = async (filename) => {
    Swal.fire({
      title: `คุณต้องการลบ ${filename}`,
      text: "ตรวจสอบให้แน่ใจว่าคุณต้องการลบไฟล์นี้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "🗑️ ลบถาวร",
      cancelButtonText: "❌ ยกเลิก",
      background: "#1e1e2f",
      color: "#a5f3fc",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#374151",
      customClass: {
        popup: 'rounded-xl shadow-lg font-mono',
        title: 'text-green-400 text-lg',
        confirmButton: 'px-6 py-2 text-sm font-bold',
        cancelButton: 'px-6 py-2 text-sm'
      },
      buttonsStyling: true
    }).then( async (result) => {
      if (result.isConfirmed) {
        await fetch(`${backend}/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename, path: currentPath })
        });
        loadFileList(currentPath);
        Swal.fire({
          title: "ลบไฟล์เรียบร้อย",
          text: "ไฟล์ของคุณถูกลบเรียบร้อยแล้ว",
          icon: "success",
          background: "#1e1e2f",
          color: "#a5f3fc",
          customClass: {
            popup: 'rounded-xl shadow-lg font-mono',
            title: 'text-green-400 text-lg',
            confirmButton: 'px-6 py-2 text-sm font-bold',
            cancelButton: 'px-6 py-2 text-sm'
          },
        });
      }
    });
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 2000);
    loadFileList();
    checkServerStatus(); // Check server status on page load
    const statusInterval = setInterval(checkServerStatus, 5000); // Check server status every 5 seconds
    return () => {
      clearInterval(interval);
      clearInterval(statusInterval); // Clean up the interval on component unmount
    };
  }, []);

  const logout = async () => {
    try {
      const res = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        router.push('/login');
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <main className="min-h-screen bg-black text-green-400 font-mono p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl mb-4">Minecraft Server Control</h1>
        <button 
          onClick={logout} 
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-2 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          Logout
        </button>
      </div>
      <div className="space-x-2 mb-4 flex">
        <div
          className={`px-4 py-2 rounded-2xl shadow-md text-white font-semibold flex items-center gap-2 w-fit ${
            isServerRunning ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          <span className="text-lg">
            {isServerRunning ? '🟢' : '🔴'}
          </span>
          <span>
            {isServerRunning ? 'Server is Running' : 'Server is Not Running'}
          </span>
        </div>
        <button 
          onClick={startServer} 
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Start
        </button>

        <button 
          onClick={stopServer} 
          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Stop
        </button>
      </div>
      <div className="mb-6">
        <h3 className="text-xl mb-2">Live Logs</h3>
        <pre className="bg-[#111] border border-green-600 p-3 max-h-96 overflow-auto">{logs}</pre>
      </div>
      <div className="mb-6">
        <input
          type="text"
          value={cmd}
          onChange={e => setCmd(e.target.value)}
          placeholder="Enter command"
          className="bg-black border border-green-500 p-1 mr-2 text-green-300 w-1/2"
        />
        <button
          onClick={sendCommand}
          className="bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-2 rounded-lg shadow-lg hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-300 ease-in-out"
        >
          Send
        </button>
      </div>
      <div className='border border-green-600 p-4'>
        <h3 className="text-xl mb-2 font-bold">File Explorer</h3>
        <div className="mb-2">
          Current: <span className="text-green-300">/{currentPath}</span>
        </div>
        <ul className="mb-4">
          {currentPath !== '.' && (
            <li>
              <button onClick={goUp} className="underline text-green-400 cursor-pointer">⬅️ Up</button>
            </li>
          )}
          {fileList.map((item, idx) => (
            <li key={idx} className="mb-1 border-b border-gray-700 pb-2">
              {item.is_dir ? (
                <div className="flex justify-between items-center">
                  <span>
                    <b>[DIR]</b>{' '}
                    <button onClick={() => enterDir(item.name)} className="underline text-green-400 cursor-pointer">
                      {item.name}
                    </button>
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div className='flex'>
                    <div className="bg-white rounded-full p-1 mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v12a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <button onClick={() => goToEditor(item.name)} className="underline text-green-400 cursor-pointer">
                      {item.name}
                    </button>
                  </div>
                  <button className="rounded-xl shadow-md transition-all duration-200 ease-in-out hover:bg-red-700 hover:scale-105 active:scale-95 active:bg-red-800" onClick={() => deleteFile(item.name)}>
                    <Image
                      src={deleteIcon} 
                      alt="Delete" 
                      className="w-8 h-8"
                    />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
        <input
          type="file"
          onChange={(e) => setUploadFile(e.target.files[0])}
          className="w-full sm:w-auto text-green-300 mb-2 sm:mb-0 sm:mr-2 cursor-pointer border border-green-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button 
          onClick={uploadHere} 
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Upload Here
        </button>
      </div>
    </main>
  );
}
