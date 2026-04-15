import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api";

// 🔹 Stats
export const getOverview = async () => {
  const res = await axios.get(`${BASE_URL}/stats/overview`);
  return res.data;
};

export const getCompanyStats = async () => {
  const res = await axios.get(`${BASE_URL}/stats/company-wise`);
  return res.data;
};

// 🔹 Companies
export const getCompanies = async () => {
  const res = await axios.get(`${BASE_URL}/companies`);
  return res.data;
};

// 🔹 Drives
export const getDrives = async () => {
  const res = await axios.get(`${BASE_URL}/drives`);
  return res.data;
};

// 🔹 Students
export const getStudents = async () => {
  const res = await axios.get(`${BASE_URL}/students`);
  return res.data;
};