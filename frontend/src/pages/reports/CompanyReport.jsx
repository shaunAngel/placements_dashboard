import React, { useEffect, useMemo, useState } from 'react';
import { useCompanyStore, useStudentStore } from '../../store';
import axios from "axios";

export default function CompanyReport() {
  const { companies } = useCompanyStore();
  const { students } = useStudentStore();

  const [selected, setSelected] = useState(null);
  const [typeFilter, setTypeFilter] = useState('All');
  const [data, setData] = useState([]);

  // 🔥 FETCH FROM BACKEND
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/stats/company-wise");
        setData(res.data);
      } catch (err) {
        console.error("Error fetching company report:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1 className="page-title">Company Report</h1>

      <table className="w-full mt-4 border">
        <thead>
          <tr>
            <th>Company</th>
            <th>Offers</th>
            <th>Selected</th>
            <th>Selection %</th>
          </tr>
        </thead>

        <tbody>
          {data.map((c) => (
            <tr key={c.companyID}>
              <td>{c.companyName}</td>
              <td>{c.totalOffers}</td>
              <td>{c.totalSelected}</td>
              <td>
                {c.totalOffers > 0
                  ? ((c.totalSelected / c.totalOffers) * 100).toFixed(1)
                  : 0}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}