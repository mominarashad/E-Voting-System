import React, { useState, useRef } from 'react';
import axios from 'axios';
import './Signup.css';

function SignupForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [cnic, setCnic] = useState('');
    const [role, setRole] = useState('voter');
    const [secretCode, setSecretCode] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        } catch (err) {
            alert("Error accessing camera");
            console.error(err);
        }
    };

    const captureFace = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, 300, 200);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/send-otp', { email });
            alert(response.data.message);
            setOtpSent(true);
            startCamera();
        } catch (error) {
            console.error('Error sending OTP:', error);
            alert("Failed to send OTP.");
        }
    };

    const handleOtpVerify = async () => {
        if (!capturedImage) {
            alert("Please capture your face before verifying OTP.");
            return;
        }

        try {
            const payload = {
                email,
                otp,
                user_info: {
                    username,
                    phone,
                    cnic,
                    role,
                    face_image: capturedImage,
                    ...((role === 'official' || role === 'admin') && { secret_code: secretCode })
                }
            };

            const response = await axios.post('http://localhost:5000/verify-otp', payload);

            if (response.data.message.includes("verified")) {
                const roleLabel = role === 'official' ? "Official" : role === 'admin' ? "Admin" : "Voter";
                alert(`${roleLabel} registered with face!`);
            }
            
        } catch (error) {
            alert(error?.response?.data?.message || "Verification failed.");
        }
    };

    return (
        <>
        <h1 className="form-title">Signup Form</h1>

        <form onSubmit={handleSubmit}>
            <div className="form-grid">
                {/* Column 1 */}
                <div className="form-column">
                    <div className="input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="Enter Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Enter Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Phone</label>
                        <input
                            type="text"
                            placeholder="Enter Phone Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Column 2 */}
                <div className="form-column">
                    <div className="input-group">
                        <label>CNIC</label>
                        <input
                            type="text"
                            placeholder="Enter CNIC"
                            value={cnic}
                            onChange={(e) => setCnic(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="voter">Voter</option>
                            <option value="official">Official</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    {(role === 'official' || role === 'admin') && (
                        <div className="input-group">
                            <label>Secret Code</label>
                            <input
                                type="password"
                                placeholder={`Enter ${role.charAt(0).toUpperCase() + role.slice(1)} Secret Code`}
                                value={secretCode}
                                onChange={(e) => setSecretCode(e.target.value)}
                                required
                            />
                        </div>
                    )}

                </div>

                {/* Column 3 */}
                <div className="form-column">
                    {otpSent && (
                        <>
                            <div className="input-group">
                                <label>Enter OTP</label>
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="camera-section">
                                <video ref={videoRef} width="280" height="200" />
                                <canvas ref={canvasRef} width="300" height="200" style={{ display: 'none' }} />
                                {!capturedImage && (
                                    <button type="button" onClick={captureFace} style={{ marginTop: '10px' }}>
                                        Capture Face
                                    </button>
                                )}
                                {capturedImage && <img src={capturedImage} alt="Captured Face" style={{ width: '100%', marginTop: '10px' }} />}
                            </div>
                            <button type="button" onClick={handleOtpVerify} style={{ marginTop: '10px' }}>
                                Verify OTP
                            </button>
                        </>
                    )}
                </div>
            </div>

            {!otpSent && (
                <button type="submit" style={{ marginTop: '20px' }}>
                    Send OTP
                </button>
            )}
        </form>
        </>
    );
}

export default SignupForm;
