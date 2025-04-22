// app/edit/[...slug]/page.jsx
'use client';
import { notFound , useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function EditPage({ params }) {
  const backend = 'http://192.168.100.183:5000';
  const [editingFile, setEditingFile] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const router = useRouter();
  const slug = params.slug;

  if (!slug || slug.length < 1) return notFound();

  const filename = slug[slug.length - 1];
  const currentPath = slug.length === 1 ? '.' : slug.slice(0, -1).join('/');

  const editFile = async (filename) => {
    const path = currentPath === '.' ? filename : `${currentPath}/${filename}`;
    const res = await fetch(`${backend}/edit?path=${encodeURIComponent(path)}`);
    const data = await res.json();
    if (data.content !== undefined) {
      setEditingFile(path);
      setEditingContent(data.content);
    }
  };
  useEffect(() => {
    editFile(filename);
  },[editingFile]);

  const saveFile = async () => {
    await fetch(`${backend}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: editingFile, content: editingContent })
    });
    Swal.fire({
      title: "บันทึกไฟล์เรียบร้อย",
      text: "ไฟล์ของคุณถูกบันทึกเรียบร้อยแล้ว",
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
    handleBack();
  };
  const handleBack = () => {
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-6">
      <h1 className="text-xl font-bold">Editing File : {filename}</h1>
      <p><strong>Path:</strong> {currentPath}</p>
      <p><strong>Filename:</strong> {filename}</p>
      <div className="mt-8">
          <textarea
            value={editingContent}
            onChange={(e) => setEditingContent(e.target.value)}
            rows={20}
            className="w-full bg-black border border-green-500 text-green-300 p-2 font-mono"
          ></textarea>
          <div className="flex space-x-2">
            <button
              onClick={saveFile}
              className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-5 py-2 rounded-2xl shadow-md transition duration-200"
            >
              💾 <span>Save</span>
            </button>

            <button
              onClick={handleBack}
              className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white px-5 py-2 rounded-2xl shadow-md transition duration-200"
            >
              🔙 <span>Back</span>
            </button>
          </div>
      </div>
    </div>
  );
}
