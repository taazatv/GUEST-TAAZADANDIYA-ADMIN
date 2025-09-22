import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./Admin.css";

function Admin() {
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [userFilter, setUserFilter] = useState("");
  const [userSortAsc, setUserSortAsc] = useState(true);

  // Fetch users & coupons
  const fetchData = async () => {
    const [usersRes, couponsRes] = await Promise.all([
      axios.get("http://localhost:8000/api/users"),
      axios.get("http://localhost:8000/api/coupons")
    ]);
    setUsers(usersRes.data);
    setCoupons(couponsRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Map automatic reference from coupon DB
  const usersWithReferences = users.map(u => {
    const coupon = coupons.find(c => c.Coupons === u.coupon);
    return {
      ...u,
      couponReference: coupon?.Reference || "-"
    };
  });

  // SORT + FILTER USERS
  const sortedUsers = [...usersWithReferences]
    .filter(u => u.name.toLowerCase().includes(userFilter.toLowerCase()))
    .sort((a, b) =>
      userSortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );

  // DOWNLOAD EXCEL FUNCTION
  const downloadExcel = (data, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, fileName);
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${fileName}.xlsx`);
  };

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>

      {/* USERS */}
      <h2>Users</h2>
      <div className="top-controls">
        <input
          type="text"
          placeholder="Filter by name..."
          value={userFilter}
          onChange={e => setUserFilter(e.target.value)}
          className="filter-input"
        />
        <button onClick={() => setUserSortAsc(!userSortAsc)}>
          Sort {userSortAsc ? "↓" : "↑"}
        </button>
        <button onClick={() => downloadExcel(sortedUsers, "Users")}>
          Download Excel
        </button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Aadhaar</th>
              <th>Booking Date</th>
              <th>Coupon</th>
              <th>Token</th>
              <th>Coupon Reference</th> {/* Automatic */}
              <th>User Reference</th>   {/* User filled */}
              <th>Event Date</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map(u => (
              <tr key={u._id}>
                <td>{u.createdAt?.substring(0, 10)}</td>
                <td>{u.name}</td>
                <td>{u.phone}</td>
                <td>{u.email}</td>
                <td>{u.aadhaar}</td>
                <td>{u.bookingDate}</td>
                <td>{u.coupon}</td>
                <td>{u.token}</td>
                <td>{u.couponReference}</td>
                <td>{u.reference}</td>
                <td>{u.eventDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;
