import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const ShiftSwap = () => {
    const { shiftId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [myShift, setMyShift] = useState(null);
    const [swapRequests, setSwapRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        reason: '',
        targetUserId: '',
        targetScheduleId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (shiftId) {
            setShowForm(true);
        }
    }, [shiftId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [swapResponse, shiftResponse] = await Promise.all([
                axiosInstance.get('/api/shiftswap/me'),
                shiftId ? axiosInstance.get(`/api/schedule/${shiftId}`) : Promise.resolve({ data: null })
            ]);
            
            setSwapRequests(swapResponse.data);
            if (shiftResponse.data) {
                setMyShift(shiftResponse.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to load data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.reason) {
            alert('Please provide a reason for the shift swap.');
            return;
        }

        if (!shiftId && !myShift) {
            alert('No shift selected for swap.');
            return;
        }

        try {
            setSubmitting(true);
            await axiosInstance.post('/api/shiftswap', {
                requesterScheduleId: shiftId || myShift.id,
                targetUserId: formData.targetUserId || null,
                targetScheduleId: formData.targetScheduleId || null,
                reason: formData.reason
            });
            
            alert('Shift swap request submitted successfully!');
            setFormData({ reason: '', targetUserId: '', targetScheduleId: '' });
            setShowForm(false);
            fetchData();
            
            // If we came from a specific shift, navigate back to home
            if (shiftId) {
                navigate('/home');
            }
        } catch (error) {
            console.error('Error submitting swap request:', error);
            alert(error.response?.data?.message || 'Failed to submit swap request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResponse = async (swapId, action) => {
        const actionText = action === 'accept' ? 'accept' : 'reject';
        if (!window.confirm(`Are you sure you want to ${actionText} this swap request?`)) {
            return;
        }

        try {
            await axiosInstance.put(`/api/shiftswap/${swapId}/respond`, { action });
            alert(`Swap request ${actionText}ed successfully!`);
            fetchData();
        } catch (error) {
            console.error(`Error ${actionText}ing swap request:`, error);
            alert(error.response?.data?.message || `Failed to ${actionText} swap request.`);
        }
    };

    const handleCancel = async (swapId) => {
        if (!window.confirm('Are you sure you want to cancel this swap request?')) {
            return;
        }

        try {
            await axiosInstance.put(`/api/shiftswap/${swapId}/cancel`);
            alert('Swap request cancelled successfully!');
            fetchData();
        } catch (error) {
            console.error('Error cancelling swap request:', error);
            alert(error.response?.data?.message || 'Failed to cancel swap request.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'text-yellow-500';
            case 'Accepted':
                return 'text-green-500';
            case 'Rejected':
                return 'text-red-500';
            case 'Cancelled':
                return 'text-gray-500';
            case 'Admin_Approved':
                return 'text-blue-500';
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
                <h1 className="text-2xl font-bold mb-4">Shift Swap</h1>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">
                    {shiftId ? 'Request Shift Swap' : 'Shift Swap Requests'}
                </h1>
                {!shiftId && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {showForm ? 'Cancel' : 'New Swap Request'}
                    </button>
                )}
            </div>

            {/* Show current shift info if coming from specific shift */}
            {shiftId && myShift && (
                <div className="bg-blue-50 p-4 rounded mb-6">
                    <h3 className="text-lg font-semibold mb-2">Your Shift to Swap:</h3>
                    <p className="text-gray-700">
                        <strong>Date:</strong> {myShift.date} | 
                        <strong> Type:</strong> {myShift.type} | 
                        <strong> Time:</strong> {myShift.startTime} - {myShift.endTime}
                    </p>
                </div>
            )}

            {showForm && (
                <div className="bg-white p-6 shadow-md rounded mb-6">
                    <h2 className="text-xl font-bold mb-4">
                        {shiftId ? 'Request Swap for This Shift' : 'New Shift Swap Request'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Reason for Swap Request <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full p-2 border rounded"
                                rows="3"
                                placeholder="Please provide a reason for your shift swap request"
                                required
                            />
                        </div>
                        
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Note:</strong> You can submit a general swap request and let other employees respond, 
                                or contact a specific colleague directly to arrange a swap.
                            </p>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 ${
                                    submitting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {submitting ? 'Submitting...' : 'Submit Swap Request'}
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

            {/* Swap Requests Table */}
            <div className="bg-white shadow-md rounded">
                {swapRequests.length === 0 ? (
                    <div className="p-6 text-center">
                        <p>No shift swap requests found.</p>
                    </div>
                ) : (
                    <table className="min-w-full bg-white text-center">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Type</th>
                                <th className="py-2 px-4 border-b">My Shift</th>
                                <th className="py-2 px-4 border-b">Other Party</th>
                                <th className="py-2 px-4 border-b">Their Shift</th>
                                <th className="py-2 px-4 border-b">Reason</th>
                                <th className="py-2 px-4 border-b">Status</th>
                                <th className="py-2 px-4 border-b">Request Date</th>
                                <th className="py-2 px-4 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {swapRequests.map(request => (
                                <tr key={request.id}>
                                    <td className="py-2 px-4 border-b">
                                        <span className={`px-2 py-1 rounded text-sm ${
                                            request.type === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {request.type === 'sent' ? 'Sent' : 'Received'}
                                        </span>
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {request.requesterSchedule ? (
                                            <>
                                                {request.requesterSchedule.date}
                                                <br />
                                                <small className="text-gray-600">
                                                    {request.requesterSchedule.type} ({request.requesterSchedule.startTime}-{request.requesterSchedule.endTime})
                                                </small>
                                            </>
                                        ) : 'N/A'}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {request.type === 'sent' ? (
                                            request.target ? `${request.target.name}` : 'Open Request'
                                        ) : (
                                            request.requester ? `${request.requester.name}` : 'N/A'
                                        )}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {request.targetSchedule ? (
                                            <>
                                                {request.targetSchedule.date}
                                                <br />
                                                <small className="text-gray-600">
                                                    {request.targetSchedule.type} ({request.targetSchedule.startTime}-{request.targetSchedule.endTime})
                                                </small>
                                            </>
                                        ) : 'TBD'}
                                    </td>
                                    <td className="py-2 px-4 border-b" title={request.reason}>
                                        {request.reason.length > 40 
                                            ? `${request.reason.substring(0, 40)}...` 
                                            : request.reason}
                                    </td>
                                    <td className={`py-2 px-4 border-b ${getStatusColor(request.status)}`}>
                                        {request.status}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {formatDate(request.requestDate)}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        <div className="space-y-1">
                                            {request.type === 'received' && request.status === 'Pending' && (
                                                <div className="space-x-1">
                                                    <button
                                                        onClick={() => handleResponse(request.id, 'accept')}
                                                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-700 text-xs"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleResponse(request.id, 'reject')}
                                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700 text-xs"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                            {request.type === 'sent' && request.status === 'Pending' && (
                                                <button
                                                    onClick={() => handleCancel(request.id)}
                                                    className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-700 text-xs"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            {request.adminNotes && (
                                                <div>
                                                    <small className="text-gray-600" title={request.adminNotes}>
                                                        Admin: {request.adminNotes.length > 20 
                                                            ? `${request.adminNotes.substring(0, 20)}...` 
                                                            : request.adminNotes}
                                                    </small>
                                                </div>
                                            )}
                                        </div>
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

export default ShiftSwap;