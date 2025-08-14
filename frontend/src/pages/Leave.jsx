import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Leave = () => {
    const { user } = useAuth();
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        type: 'Vacation',
        reason: ''
    });

    const leaveTypes = ['Sick', 'Vacation', 'Personal', 'Emergency', 'Family'];

    useEffect(() => {
        fetchLeaveRequests();
    }, []);

    const fetchLeaveRequests = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/leave/me');
            setLeaveRequests(response.data);
        } catch (error) {
            console.error('Error fetching leave requests:', error);
            alert('Failed to load leave requests. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.startDate || !formData.endDate || !formData.type || !formData.reason) {
            alert('Please fill in all required fields.');
            return;
        }

        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            alert('End date cannot be before start date.');
            return;
        }

        try {
            setSubmitting(true);
            await axiosInstance.post('/api/leave', formData);
            alert('Leave request submitted successfully!');
            setFormData({ startDate: '', endDate: '', type: 'Vacation', reason: '' });
            setShowForm(false);
            fetchLeaveRequests();
        } catch (error) {
            console.error('Error submitting leave request:', error);
            alert(error.response?.data?.message || 'Failed to submit leave request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (leaveId) => {
        if (!window.confirm('Are you sure you want to cancel this leave request?')) {
            return;
        }

        try {
            await axiosInstance.put(`/api/leave/${leaveId}/cancel`);
            alert('Leave request cancelled successfully!');
            fetchLeaveRequests();
        } catch (error) {
            console.error('Error cancelling leave request:', error);
            alert(error.response?.data?.message || 'Failed to cancel leave request.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'text-yellow-500';
            case 'Approved':
                return 'text-green-500';
            case 'Rejected':
                return 'text-red-500';
            case 'Cancelled':
                return 'text-gray-500';
            default:
                return 'text-gray-500';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <h1 className="text-2xl font-bold mb-4">Leave Requests</h1>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Leave Requests</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {showForm ? 'Cancel' : 'Request Leave'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 shadow-md rounded mb-6">
                    <h2 className="text-xl font-bold mb-4">New Leave Request</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Start Date</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Leave Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            >
                                {leaveTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Reason</label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full p-2 border rounded"
                                rows="3"
                                placeholder="Please provide a reason for your leave request"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 ${
                                submitting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {submitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white shadow-md rounded">
                {leaveRequests.length === 0 ? (
                    <div className="p-6 text-center">
                        <p>No leave requests found.</p>
                    </div>
                ) : (
                    <table className="min-w-full bg-white text-center">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Type</th>
                                <th className="py-2 px-4 border-b">Start Date</th>
                                <th className="py-2 px-4 border-b">End Date</th>
                                <th className="py-2 px-4 border-b">Reason</th>
                                <th className="py-2 px-4 border-b">Status</th>
                                <th className="py-2 px-4 border-b">Request Date</th>
                                <th className="py-2 px-4 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaveRequests.map(leave => (
                                <tr key={leave.id}>
                                    <td className="py-2 px-4 border-b">{leave.type}</td>
                                    <td className="py-2 px-4 border-b">{leave.startDate}</td>
                                    <td className="py-2 px-4 border-b">{leave.endDate}</td>
                                    <td className="py-2 px-4 border-b" title={leave.reason}>
                                        {leave.reason.length > 50 
                                            ? `${leave.reason.substring(0, 50)}...` 
                                            : leave.reason}
                                    </td>
                                    <td className={`py-2 px-4 border-b ${getStatusColor(leave.status)}`}>
                                        {leave.status}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {formatDate(leave.requestDate)}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {leave.status === 'Pending' && (
                                            <button
                                                onClick={() => handleCancel(leave.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        {leave.adminNotes && (
                                            <div className="mt-1">
                                                <small className="text-gray-600" title={leave.adminNotes}>
                                                    Admin Notes: {leave.adminNotes.length > 30 
                                                        ? `${leave.adminNotes.substring(0, 30)}...` 
                                                        : leave.adminNotes}
                                                </small>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Leave;