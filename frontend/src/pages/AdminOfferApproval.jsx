import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminOfferApproval() {
  const [offers, setOffers] = useState([]);

  const fetchOffers = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/offer");
      setOffers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/offer/${id}?status=${status}`);
      fetchOffers(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Offer Approvals</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Company</th>
              <th className="p-3">Package</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {offers.map((o) => (
              <tr key={o._id} className="border-t">
                <td className="p-3">{o.name}</td>
                <td className="p-3">{o.company}</td>
                <td className="p-3">{o.package} LPA</td>
                <td className="p-3">
                  <span className={
                    o.status === "Approved"
                      ? "text-green-600 font-bold"
                      : o.status === "Rejected"
                      ? "text-red-600 font-bold"
                      : "text-yellow-600 font-bold"
                  }>
                    {o.status}
                  </span>
                </td>

                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => updateStatus(o._id, "Approved")}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => updateStatus(o._id, "Rejected")}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}