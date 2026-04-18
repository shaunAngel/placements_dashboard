import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ActiveOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/offer/approved");
      setOffers(res.data || []);
    } catch (err) {
      console.error("Error fetching offers:", err);
      setOffers([]); // prevents crash
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading offers...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Active Offers</h1>

      {offers.length === 0 ? (
        <p className="text-gray-500">No offers available</p>
      ) : (
        <div className="grid gap-4">
          {offers.map((o, i) => (
            <div key={i} className="border p-4 rounded-lg shadow">
              <div className="font-semibold">{o.company}</div>
              <div className="text-sm text-gray-500">{o.name}</div>
              <div className="text-blue-600 font-bold">{o.package} LPA</div>
              <div className="text-xs text-gray-400">{o.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}