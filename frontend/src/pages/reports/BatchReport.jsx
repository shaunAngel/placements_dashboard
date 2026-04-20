import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import DataTable from '../../components/ui/DataTable';

export default function BatchReport() {
  const [batchData, setBatchData] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/batch")
      .then(res => setBatchData(res.data))
      .catch(err => console.error(err));
  }, []);

  const trendData = batchData.filter(b => b.totalSelected > 0);

  const columns = [
    { key: 'batch', label: 'Batch' },

    {
      key: 'totalOffers',
      label: 'Total Offers',
      accessor: r => r.totalOffers
    },

    {
      key: 'totalSelected',
      label: 'Placed',
      accessor: r => r.totalSelected,
      render: v => <span className="text-success font-semibold">{v}</span>
    },

    {
      key: 'percent',
      label: 'Placement %',
      accessor: r => r.placementPercentage,
      render: v => <span className="font-bold text-primary">{v}%</span>
    }
  ];

  return (
    <div className="space-y-5 animate-fade-in">

      <div>
        <h1 className="page-title">Batch-wise Report</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Placement trends across academic batches
        </p>
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Placement Trend by Batch</h2>

        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="batch" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="totalSelected"
                name="Students Placed"
                stroke="#1A3A6B"
                strokeWidth={2.5}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-400 text-sm">No data available for batches</div>
        )}
      </div>

      <DataTable data={batchData} columns={columns} filename="batch-report" />
    </div>
  );
}