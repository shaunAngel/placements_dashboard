import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store";

const OfferList = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "Admin";

  const [offers, setOffers] = useState([]);
  const [viewedPdfs, setViewedPdfs] = useState(new Set());

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/offer"); // ✅ FIXED
      const data = await res.json();
      setOffers(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setOffers([]); // ✅ prevents crash
    }
  };

  const approveOffer = async (id) => {
    await fetch(`http://127.0.0.1:8000/api/offer/approve/${id}`, {
      method: "PUT",
    });
    fetchOffers();
  };

  const rejectOffer = async (id) => {
    await fetch(`http://127.0.0.1:8000/api/offer/reject/${id}`, {
      method: "PUT",
    });
    fetchOffers();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Active Offers</h2>

      {offers.length === 0 ? (
        <p>No offers available</p>
      ) : (
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Company</th>
                <th className="p-4 text-left">Package</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Document</th>
                {isAdmin && <th className="p-4 text-left">Actions</th>}
              </tr>
            </thead>

            <tbody>
              {offers.map((o) => (
                <tr key={o._id} className="border-t hover:bg-gray-50">

                  <td className="p-4 font-medium">{o.name}</td>
                  <td className="p-4">{o.company}</td>

                  <td className="p-4 text-green-600 font-semibold">
                    {o.package} LPA
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        o.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : o.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>

                  <td className="p-4">
                    {o.file ? (
                      <a
                        href={`http://127.0.0.1:8000/${o.file}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                          const newSet = new Set(viewedPdfs);
                          newSet.add(o.rollNo);
                          setViewedPdfs(newSet);
                        }}
                        className="text-blue-600 hover:underline font-medium text-xs bg-blue-50 px-2 py-1 rounded"
                      >
                        View PDF
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">No File</span>
                    )}
                  </td>

                  {isAdmin && (
                    <td className="p-4 flex gap-2">
                      {o.status === "pending" && (
                        <>
                          {viewedPdfs.has(o.rollNo) ? (
                            <>
                              <button
                                onClick={() => approveOffer(o.rollNo)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                              >
                                Approve
                              </button>

                              <button
                              onClick={() => rejectOffer(o.rollNo)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-orange-500 italic">View PDF to act</span>
                          )}
                        </>
                      )}
                    </td>
                  )}

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OfferList;