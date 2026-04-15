import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function CompanyDetail() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/companies`);
        const found = res.data.find(c => c.companyID === id);
        setCompany(found);
      } catch (err) {
        console.error("Error fetching company:", err);
      }
    };

    fetchCompany();
  }, [id]);

  if (!company) {
    return (
      <div className="card text-center py-12 text-gray-400">
        Loading company details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <h1 className="page-title">{company.companyName}</h1>

      {/* Basic Info */}
      <div className="card">
        <h2 className="section-title mb-2">Company Info</h2>

        <p><b>Sector:</b> {company.companySector}</p>

        <p>
          <b>Website:</b>{" "}
          <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-500">
            {company.website}
          </a>
        </p>
      </div>

      {/* About */}
      <div className="card">
        <h2 className="section-title mb-2">About Company</h2>
        <p>{company.companyDesc}</p>
      </div>

      <Link to="/companies" className="btn-primary inline-block">
        ← Back to Companies
      </Link>
    </div>
  );
}