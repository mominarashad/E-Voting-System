import React from 'react';
import './Candidates.css';

function getRandomAge() {
    return Math.floor(Math.random() * 30) + 40;
}

const candidates = [
    { name: "Imran Khan", image: "th.jpg", party: "PTI", age: getRandomAge() },
    { name: "Nawaz Sharif", image: "nawaz.jpg", party: "PMLN", age: getRandomAge() },
    { name: "Asif Ali Zardari", image: "zardari.jpg", party: "PPP", age: getRandomAge() },
    { name: "Shehbaz Sharif", image: "shehbaz.jpg", party: "PMLN", age: getRandomAge() },
    { name: "Maryam Nawaz", image: "maryam.jpg", party: "PMLN", age: getRandomAge() },
    { name: "Molana Fazul Ur Rehman", image: "fazal.jpg", party: "Islami Party", age: getRandomAge() },
    { name: "Pervez Elahi", image: "pervez.jpg", party: "PMLQ", age: getRandomAge() },
    { name: "Bilawal Bhutto", image: "bilawal.jpg", party: "PPP", age: getRandomAge() },
];

export default function CandidatePage() {
    return (
        <div className="candidate-container">
            <h1 className="title">Vote for Your Candidate</h1>
            <div className="candidate-grid">
                {candidates.map((candidate, index) => (
                    <div className="candidate-card" key={index}>
                        <img src={candidate.image} alt={candidate.name} className="candidate-image" />
                        <div className="candidate-info">
                            <h2 className="candidate-name">{candidate.name}</h2>
                            <p className="candidate-age">Age: {candidate.age}</p>
                            <p className="candidate-party">Party: {candidate.party}</p>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}
