import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import "./ElectionOfficial.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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

const AdminDashboard = () => {
  const [votes, setVotes] = useState([]);
  const [validationMessage, setValidationMessage] = useState("");
  const [voteLogs, setVoteLogs] = useState([]);
  const token = localStorage.getItem("token");

  const useDummyData = true;

  useEffect(() => {
    if (useDummyData) {
      // Dummy vote counts for candidates
      setVotes([150, 130, 80, 60, 50, 90, 40, 70]);

      // Dummy vote logs
      setVoteLogs([
        {
          id: 1,
          voting_id: "VOT1234",
          ip_address: "192.168.1.10",
          candidate: "Imran Khan",
          timestamp: new Date().toISOString(),
          status: "success",
          reason: ""
        },
        {
          id: 2,
          voting_id: "VOT5678",
          ip_address: "192.168.1.20",
          candidate: "Nawaz Sharif",
          timestamp: new Date().toISOString(),
          status: "fraud",
          reason: "Multiple votes detected"
        },
        {
          id: 3,
          voting_id: "VOT1122",
          ip_address: "192.168.1.30",
          candidate: "Maryam Nawaz",
          timestamp: new Date().toISOString(),
          status: "success",
          reason: ""
        },
        {
          id: 4,
          voting_id: "VOT3344",
          ip_address: "192.168.1.40",
          candidate: "Asif Ali Zardari",
          timestamp: new Date().toISOString(),
          status: "fraud",
          reason: "Suspicious location activity"
        },
        {
          id: 5,
          voting_id: "VOT5566",
          ip_address: "192.168.1.50",
          candidate: "Bilawal Bhutto",
          timestamp: new Date().toISOString(),
          status: "success",
          reason: ""
        }
      ]);
    } else {
      fetchVotes();
      fetchVoteLogs();

      const interval = setInterval(() => {
        fetchVotes();
        fetchVoteLogs();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, []);

  const fetchVotes = async () => {
    try {
      const response = await fetch("http://localhost:5000/get-votes?role=official", {
        method: "GET",
        credentials: "include",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      if (data.success) {
        const updatedVotes = candidates.map(candidate => data.votes[candidate.name] || 0);
        setVotes(updatedVotes);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching votes:", error.message);
    }
  };

  const fetchVoteLogs = async () => {
    try {
      const response = await fetch("http://localhost:5000/view-logs?role=official", {
        method: "GET",
        credentials: "include",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      if (data.success) {
        setVoteLogs(data.logs);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching vote logs:", error.message);
    }
  };

  const validateVotes = () => {
    setValidationMessage("Votes successfully validated!");
  };

  const chartData = {
    labels: candidates.map(candidate => candidate.name),
    datasets: [
      {
        label: "Votes",
        data: votes,
        backgroundColor: "rgba(34, 197, 94, 0.6)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div className="admin-container">
      <div className="title">Election Results</div>

      <div className="results-container">
        <div className="candidate-table">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Votes</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate, index) => (
                <tr key={index}>
                  <td>
                    <div className="candidate-info">
                      <img
                        src={candidate.image}
                        alt={candidate.name}
                        className="candidate-img"
                      />
                      <span>{candidate.name}</span>
                    </div>
                  </td>
                  <td>{votes[index]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="chart-container">
          <Bar data={chartData} options={chartOptions} height={400} />
        </div>
      </div>

      <div className="validate-block">
        <button className="validate-button" onClick={validateVotes}>
          Validate Votes
        </button>
        {validationMessage && (
          <div className="validation-message">{validationMessage}</div>
        )}
      </div>

      <div className="fraud-table">
        <h3>Vote Integrity Logs</h3>
        <table>
          <thead>
            <tr>
              <th>Voting ID</th>
              <th>IP Address</th>
              <th>Candidate</th>
              <th>Timestamp</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {voteLogs.map((log) => (
              <tr
                key={log.id}
                className={log.status === "success" ? "fair-vote" : "fraud-vote"}
              >
                <td>{log.voting_id}</td>
                <td>{log.ip_address}</td>
                <td>{log.candidate}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.status === "success" ? "Fair Vote" : "Possible Fraud"}</td>
                <td>{log.reason || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
