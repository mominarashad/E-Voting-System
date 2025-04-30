import React, { useState } from "react";
import axios from "axios";
import "./Vote.css"; // Keep using your CSS

const candidates = [
  { name: "Imran Khan", image: "th.jpg" },
  { name: "Nawaz Sharif", image: "nawaz.jpg" },
  { name: "Asif Ali Zardari", image: "zardari.jpg" },
  { name: "Shehbaz Sharif", image: "shehbaz.jpg" },
  { name: "Maryam Nawaz", image: "maryam.jpg" },
  { name: "Molana Fazul Ur Rehman", image: "fazal.jpg" },
  { name: "Pervez Elahi", image: "pervez.jpg" },
  { name: "Bilawal Bhutto", image: "bilawal.jpg" }
];

const Vote = () => {
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [message, setMessage] = useState("");

  const voting_id = localStorage.getItem("voting_id");
  const role = localStorage.getItem("user_role");
  const token = localStorage.getItem("token"); // <-- Get token from localStorage

  const handleSelectCandidate = (name) => {
    setSelectedCandidate(name);
    setMessage(""); // Clear previous messages
  };

  const handleConfirmVote = async () => {
    if (role !== "voter") {
      setMessage("Only voters are allowed to cast votes.");
      return;
    }

    if (!selectedCandidate) {
      setMessage("Please select a candidate first.");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/cast-vote",
        {
          voting_id: voting_id,
          candidate: selectedCandidate
        },
        {
          headers: {
            Authorization: token // <-- Send token in Authorization header
          }
        }
      );

      if (response.data.success) {
        setMessage("✅ Vote cast successfully!");
      } else {
        setMessage(response.data.message || "❌ Failed to cast vote.");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ An error occurred while casting vote.");
    }
  };

  return (
    <div className="vote-container">
      <h2>🗳️ Cast Your Vote</h2>

      <div className="candidate-grid">
        {candidates.map((cand, index) => (
          <div
            key={index}
            className={`candidate-card ${selectedCandidate === cand.name ? "selected" : ""}`}
          >
            <img src={cand.image} alt={cand.name} />
            <h4>{cand.name}</h4>
            <button
              className="select-button"
              onClick={() => handleSelectCandidate(cand.name)}
            >
              Cast Vote
            </button>
          </div>
        ))}
      </div>

      {selectedCandidate && (
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <h3>Selected Candidate: {selectedCandidate}</h3>
          <button className="confirm-button" onClick={handleConfirmVote}>
            Confirm Vote
          </button>
        </div>
      )}

      {message && (
        <div className="vote-message">
          {message}
        </div>
      )}
    </div>
  );
};

export default Vote;
