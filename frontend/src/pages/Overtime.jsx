import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Overtime = () => {
    const { user } = useAuth();
    const { shiftId } = useParams();
    const navigate = useNavigate();
    const [overtimeRequests, setOvertimeRequests] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        scheduleId: shiftId || '',
        requestedHours: '',
        reason: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (shiftId) {
            setShowForm(true);
            setFormData(prev => ({ ...prev, scheduleId: shiftId }));
        }
    }, [shiftId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [overtimeResponse, scheduleResponse] = await Promise.all([
                axiosInstance.get('/api/overtime/me'),
                axiosInstance.get('/api/schedule/me')
            ]);
            setOvertimeRequests(overtimeResponse.data);
            setSchedule(scheduleResponse.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to load data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.scheduleId || !formData.requestedHours || !formData.reason) {
            alert('Please fill in all required fields.');
            return;
        }

        const hours = parseFloat(formData.requestedHours);
        if (isNaN(hours) || hours <= 0 || hours > 12) {
            alert('Please enter a valid number of hours (0.5 - 12).');
            return;
        }

        try {
            setSubmitting(true);
            await axiosInstance.post('/api/overtime', {
                scheduleId: formData.scheduleId,
                requestedHours: hours,
                reason: formData.reason
            });
            alert('Overtime request submitted successfully!');
            setFormData({ scheduleId: '', requestedHours: '', reason: '' });
            setShowForm(false);
            fetchData();
            
            // If we came from a specific shift, navigate back to home
            if (shiftId) {
                navigate('/home');
            }
        } catch (error) {
            console.error('Error submitting overtime request:', error);
            alert(error.response?.data?.message || 'Failed to submit overtime request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (overtimeId) => {
        if (!window.confirm('Are you sure you want to cancel this overtime request?')) {
            return;
        }

        try {
            await axiosInstance.put(`/api/overtime/${overtimeId}/cancel`);
            alert('Overtime request cancelled successfully!');
            fetchData();
        } catch (error) {
            console.error('Error cancelling overtime request:', error);
            alert(error.response?.data?.message || 'Failed to cancel overtime request.');
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

    const getAvailableShifts = () => {
        // Filter out shifts that already have overtime requests
        const shiftsWithOvertime = overtimeRequests.map(ot => ot.schedule?.id);
        return schedule.filter(shift => 
            !shiftsWithOvertime.includes(shift.id) && 
            shift.status === 'Scheduled' &&
            new Date(shift.date) >= new Date().setHours(0, 0, 0, 0)
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <h1 className="text-2xl font-bold mb-4">Overtime Requests</h1>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Overtime Requests</h1>
                {!shiftId && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {showForm ? 'Cancel' : 'Request Overtime'}
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white p-6 shadow-md rounded mb-6">
                    <h2 className="text-xl font-bold mb-4">
                        {shiftId ? 'Request Overtime for Shift' : 'New Overtime Request'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Select Shift</label>
                            <select
                                value={formData.scheduleId}
                                onChange={(e) => setFormData({ ...formData, scheduleId: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                                disabled={!!shiftId}
                            >
                                <option value="">Select a shift</option>
                                {getAvailableShifts().map(shift => (
                                    <option key={shift.id} value={shift.id}>
                                        {shift.date} - {shift.type} ({shift.startTime} - {shift.endTime})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Requested Hours (0.5 - 12)
                            </label>
                            <input
                                type="number"
                                min="0.5"
                                max="12"
                                step="0.5"
                                value={formData.requestedHours}
                                onChange={(e) => setFormData({ ...formData, requestedHours: e.target.value })}
                                className="w-full p-2 border rounded"
                                placeholder="e.g., 2.5"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Reason</label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full p-2 border rounded"
                                rows="3"
                                placeholder="Please provide a reason for your overtime request"
                                required
                            />
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 ${
                                    submitting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                            {shiftId && (
                                <button
                                    type="button"
                                    onClick={() => navigate('/home')}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
                                >
                                    Back to Schedule
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white shadow-md rounded">
                {overtimeRequests.length === 0 ? (
                    <div className="p-6 text-center">
                        <p>No overtime requests found.</p>
                    </div>
                ) : (
                    <table className="min-w-full bg-white text-center">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Date</th>
                                <th className="py-2 px-4 border-b">Shift</th>
                                <th className="py-2 px-4 border-b">Requested Hours</th>
                                <th className="py-2 px-4 border-b">Approved Hours</th>
                                <th className="py-2 px-4 border-b">Reason</th>
                                <th className="py-2 px-4 border-b">Status</th>
                                <th className="py-2 px-4 border-b">Request Date</th>
                                <th className="py-2 px-4 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {overtimeRequests.map(overtime => (
                                <tr key={overtime.id}>
                                    <td className="py-2 px-4 border-b">{overtime.date}</td>
                                    <td className="py-2 px-4 border-b">
                                        {overtime.schedule ? (
                                            <>
                                                {overtime.schedule.type}
                                                <br />
                                                <small className="text-gray-600">
                                                    {overtime.schedule.startTime} - {overtime.schedule.endTime}
                                                </small>
                                            </>
                                        ) : (
                                            'N/A'
                                        )}
                                    </td>
                                    <td className="py-2 px-4 border-b">{overtime.requestedHours}h</td>
                                    <td className="py-2 px-4 border-b">
                                        {overtime.approvedHours ? `${overtime.approvedHours}h` : '-'}
                                    </td>
                                    <td className="py-2 px-4 border-b" title={overtime.reason}>
                                        {overtime.reason.length > 40 
                                            ? `${overtime.reason.substring(0, 40)}...` 
                                            : overtime.reason}
                                    </td>
                                    <td className={`py-2 px-4 border-b ${getStatusColor(overtime.status)}`}>
                                        {overtime.status}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {formatDate(overtime.requestDate)}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {overtime.status === 'Pending' && (
                                            <button
                                                onClick={() => handleCancel(overtime.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        {overtime.adminNotes && (
                                            <div className="mt-1">
                                                <small className="text-gray-600" title={overtime.adminNotes}>
                                                    Admin Notes: {overtime.adminNotes.length > 30 
                                                        ? `${overtime.adminNotes.substring(0, 30)}...` 
                                                        : overtime.adminNotes}
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

export default Overtime;