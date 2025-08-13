import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';

const AdminShift = () => {
  const [users, setUsers] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [form, setForm] = useState({ employeeId: '', date: '', shiftType: 'Morning', location: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, shiftsRes] = await Promise.all([
          axiosInstance.get('/api/admin/users'),
          axiosInstance.get('/api/admin/shifts'),
        ]);
        setUsers(usersRes.data);
        setShifts(shiftsRes.data);
      } catch (e) {
        alert('Failed to load users or shifts');
      }
    };
    fetchData();
  }, []);

  const createShift = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/api/admin/shifts', form);
      setShifts(prev => [res.data, ...prev]);
      setForm({ employeeId: '', date: '', shiftType: 'Morning', location: '' });
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to create shift');
    }
  };

  const removeShift = async (id) => {
    if (!window.confirm('Delete shift?')) return;
    try {
      await axiosInstance.delete(`/api/admin/shifts/${id}`);
      setShifts(prev => prev.filter(s => s._id !== id));
    } catch (e) {
      alert('Failed to delete shift');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Shift Management</h1>
      <form className="mb-6" onSubmit={createShift}>
        <div className="grid grid-cols-4 gap-4">
          <select className="border p-2" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}>
            <option value="">Select Employee</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
            ))}
          </select>
          <input className="border p-2" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <select className="border p-2" value={form.shiftType} onChange={(e) => setForm({ ...form, shiftType: e.target.value })}>
            <option>Morning</option>
            <option>Afternoon</option>
            <option>Night</option>
          </select>
          <input className="border p-2" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 mt-4">Create Shift</button>
      </form>

      <table className="min-w-full bg-white text-center">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Date</th>
            <th className="py-2 px-4 border-b">Type</th>
            <th className="py-2 px-4 border-b">Employee</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map(s => (
            <tr key={s._id}>
              <td className="py-2 px-4 border-b">{s.date?.slice(0,10)}</td>
              <td className="py-2 px-4 border-b">{s.shiftType}</td>
              <td className="py-2 px-4 border-b">{s.employee?.name}</td>
              <td className="py-2 px-4 border-b">
                <button className="bg-red-500 text-white px-3 py-1" onClick={() => removeShift(s._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminShift;