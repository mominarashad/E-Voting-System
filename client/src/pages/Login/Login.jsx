import React, { useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const videoRef = useRef(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const captureAndLogin = async () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');

    try {
      const res = await axios.post('http://localhost:5000/login', { image: dataUrl });
      if (res.data.success) {
        const { voting_id, role, username, token } = res.data;

        localStorage.setItem('voting_id', voting_id);
        localStorage.setItem('user_role', role);
        localStorage.setItem('username', username);
        localStorage.setItem('token', token);

        if (role === 'voter') {
          navigate('/vote');
        } else if (role === 'official') {
          navigate('/official');
        }
        else if (role === 'admin') {
          navigate('/admin');
        } else {
          setError('Unknown role');
        }
      } else {
        setError(res.data.msg || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server error during login');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4 transition-all duration-700">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md animate-fade-in">
        <h2 className="text-3xl font-bold mb-6 text-center animate-slide-down">Face Login</h2>

        <div className="flex justify-center mb-6">
          <video
            ref={videoRef}
            autoPlay
            className="w-64 h-48 rounded-lg border-2 border-gray-700 shadow-inner transition-transform duration-300 hover:scale-105"
          />
        </div>

        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={startCamera}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 transition-colors duration-300 rounded-full shadow-md hover:scale-105"
          >
            Start Camera
          </button>
          <button
            onClick={captureAndLogin}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 transition-colors duration-300 rounded-full shadow-md hover:scale-105"
          >
            Login
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-center mt-2 animate-pulse">{error}</p>
        )}
      </div>
    </div>
  );
};

export default Login;
