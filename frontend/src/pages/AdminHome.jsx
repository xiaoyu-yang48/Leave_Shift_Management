import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';

const AdminHome = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axiosInstance.get('/api/requests/all');
        setRequests(res.data);
      } catch (e) {
        alert('Failed to load admin requests');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const act = async (id, action) => {
    try {
      await axiosInstance.post(`/api/requests/${id}/${action}`);
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: action === 'approve' ? 'Approved' : 'Rejected' } : r));
    } catch (e) {
      alert('Failed to update request');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Request Center</h1>
      <table className="min-w-full bg-white text-center">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Requester</th>
            <th className="py-2 px-4 border-b">Target</th>
            <th className="py-2 px-4 border-b">Requester Shift</th>
            <th className="py-2 px-4 border-b">Target Shift</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(r => (
            <tr key={r._id}>
              <td className="py-2 px-4 border-b">{r.requester?.name}</td>
              <td className="py-2 px-4 border-b">{r.target?.name}</td>
              <td className="py-2 px-4 border-b">{r.requesterShift?.date?.slice(0,10)} - {r.requesterShift?.shiftType}</td>
              <td className="py-2 px-4 border-b">{r.targetShift?.date?.slice(0,10)} - {r.targetShift?.shiftType}</td>
              <td className="py-2 px-4 border-b">{r.status}</td>
              <td className="py-2 px-4 border-b">
                {r.status === 'Pending' && (
                  <>
                    <button className="bg-green-500 text-white px-3 py-1 mr-2" onClick={() => act(r._id, 'approve')}>Approve</button>
                    <button className="bg-red-500 text-white px-3 py-1" onClick={() => act(r._id, 'reject')}>Reject</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminHome;