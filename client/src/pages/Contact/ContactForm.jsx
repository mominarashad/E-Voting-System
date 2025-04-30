import React, { useState } from 'react';
import axios from 'axios';
import './ContactForm.css'; // Import dark theme CSS

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const [responseMessage, setResponseMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const token = localStorage.getItem('token');
        const votingId = localStorage.getItem('voting_id');
    
        if (!token || !votingId) {
            setResponseMessage('Unauthorized: Missing session data. Please log in.');
            setIsSuccess(false);
            return;
        }
    
        try {
            const response = await axios.post(
                'http://localhost:5000/contact',
                { ...formData, voting_id: votingId },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token,
                    },
                }
            );
            setResponseMessage(response.data.message);
            setIsSuccess(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            setResponseMessage('Failed to send message. Please try again.');
            setIsSuccess(false);
        }
    };
    
    

    return (
        <div className="contact-page">
            <div className="contact-form-container">
                <h2 className="form-title">Contact Us</h2>
                <form onSubmit={handleSubmit} className="contact-form">
                    <div className="input-group">
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Subject:</label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Message:</label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="submit-btn">Submit</button>
                </form>
                {responseMessage && (
                    <p className={`response-message ${isSuccess ? 'success' : 'failure'}`}>
                        {responseMessage}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ContactForm;
