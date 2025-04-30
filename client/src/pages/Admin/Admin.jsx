import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./Admin.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [officials, setOfficials] = useState([]);
  const [stats, setStats] = useState([]);
  const [formData, setFormData] = useState({ username: "", email: "", phone: "", cnic: "" });
  const [editData, setEditData] = useState(null); // For updating an official

  const getToken = () => localStorage.getItem("token");

  const fetchStats = async () => {
    const token = getToken();
    const res = await fetch("/api/admin/vote-stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setStats(data);
  };

  const fetchOfficials = async () => {
    const token = getToken();
    const res = await fetch("/api/admin/officials", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setOfficials(data);
  };

  const handleSubmit = async () => {
    const token = getToken();
    await fetch("/api/admin/add-official", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    fetchOfficials();
    setFormData({ username: "", email: "", phone: "", cnic: "" }); // Reset form after submit
  };

  const handleUpdate = async () => {
    const token = getToken();
    const updatedData = {
      id: editData.id,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      cnic: formData.cnic,
    };

    await fetch("/api/admin/update-official", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });
    fetchOfficials();
    setFormData({ username: "", email: "", phone: "", cnic: "" }); // Reset form after update
    setEditData(null); // Reset editing mode
  };

  const handleDelete = async (id) => {
    const token = getToken();

    await fetch("/api/admin/delete-official", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });
    fetchOfficials();
  };

  useEffect(() => {
    fetchStats();
    fetchOfficials();
  }, []);

  return (
    <div className="dashboard-container">
      <motion.h1 className="dashboard-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Admin Dashboard
      </motion.h1>

      <div className="dashboard-grid">
        {/* Add or Edit Official */}
        <motion.div className="dashboard-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h2 className="card-title">{editData ? "Edit Election Official" : "Add Election Official"}</h2>
          <input
            className="input"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
          <input
            className="input"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            className="input"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <input
            className="input"
            placeholder="CNIC"
            value={formData.cnic}
            onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
          />
          {editData ? (
            <button onClick={handleUpdate} className="btn-primary">
              Update Official
            </button>
          ) : (
            <button onClick={handleSubmit} className="btn-primary">
              Add Official
            </button>
          )}
        </motion.div>

        {/* Live Vote Stats */}
        <motion.div className="dashboard-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="card-title">Live Vote Stats</h2>
          <Bar
            data={{
              labels: stats.map((s) => s.candidate),
              datasets: [
                {
                  label: "Votes",
                  data: stats.map((s) => s.votes),
                  backgroundColor: "#3498db",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Votes per Candidate" },
              },
            }}
          />
        </motion.div>
      </div>

      {/* Officials Table */}
      <motion.div className="dashboard-card table-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
        <h2 className="card-title">Election Officials</h2>
        <table className="officials-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
              <th>CNIC</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {officials.map((official) => (
              <tr key={official.id}>
                <td>{official.username}</td>
                <td>{official.email}</td>
                <td>{official.phone}</td>
                <td>{official.cnic}</td>
                <td>
                  <button onClick={() => {
                    setEditData(official);
                    setFormData({
                      username: official.username,
                      email: official.email,
                      phone: official.phone,
                      cnic: official.cnic,
                    });
                  }} className="btn-primary">Edit</button>
                  <button onClick={() => handleDelete(official.id)} className="btn-primary">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
