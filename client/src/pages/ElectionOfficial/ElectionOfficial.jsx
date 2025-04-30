import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const token = localStorage.getItem('token');

  // Matching dummy data from the other file
  const dummyData = {
    total_voters: 500,
    successful_votes: 460,
    vote_distribution: [
      { candidate: "Imran Khan", votes: 120 },
      { candidate: "Nawaz Sharif", votes: 100 },
      { candidate: "Asif Ali Zardari", votes: 60 },
      { candidate: "Shehbaz Sharif", votes: 50 },
      { candidate: "Maryam Nawaz", votes: 40 },
      { candidate: "Molana Fazul Ur Rehman", votes: 30 },
      { candidate: "Pervez Elahi", votes: 30 },
      { candidate: "Bilawal Bhutto", votes: 30 }
    ]
  };

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/dashboard', {
      headers: { Authorization: token }
    }).then(res => {
      setData(res.data);
    }).catch(err => {
      console.error("API error or unauthorized, using dummy data:", err);
      setData(dummyData); // fallback to dummy data
    });
  }, []);

  if (!data) return <p>Loading...</p>;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EFF', '#FF6699', '#66CCCC', '#FF9933'];

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>

      <div className="mb-6">
        <p><strong>Total Voters:</strong> {data.total_voters}</p>
        <p><strong>Successful Votes:</strong> {data.successful_votes}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BarChart width={500} height={350} data={data.vote_distribution}>
          <XAxis dataKey="candidate" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="votes" fill="#34D399" />
        </BarChart>

        <PieChart width={500} height={350}>
          <Pie
            data={data.vote_distribution}
            dataKey="votes"
            nameKey="candidate"
            cx="50%"
            cy="50%"
            outerRadius={120}
            fill="#8884d8"
            label
          >
            {data.vote_distribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
};

export default Dashboard;
