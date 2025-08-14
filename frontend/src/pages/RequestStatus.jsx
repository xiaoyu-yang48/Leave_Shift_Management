import React, {useState, useEffect} from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const statusColor = (s) => {
    switch (s) {
        case 'Pending':
            return 'text-yellow-500';
        case 'Approved':
            return 'text-green-500';
        case 'Rejected':
            return 'text-red-500';
        case 'Canceled':
            return 'text-gray-500';
        default:
            return 'text-gray-500';
    }
};

const RequestStatus = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelingRequestId, setCancelingRequestId] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axiosInstance.get('/api/requests/me');
                setRequests(response.data);
            } catch (error) {
                console.error('Error fetching requests:', error);
                alert('Failed to fetch requests.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchRequests();
        }
    }, [user]);


    const handleCancelRequest = async (req) => {
        if (req.status !== 'Pending') return; // Prevent multiple clicks
        const ok = window.confirm('Are you sure you want to cancel this request?');
        if (!ok) return;

        try {
            setCancelingRequestId(req.id);
            const requestType = req.type.toLowerCase().replace(' ', '');
            await axiosInstance.put(`/api/requests/${requestType}/${req.id}/cancel`);
            alert('Request canceled successfully');
            // Refresh the requests
            const response = await axiosInstance.get('/api/requests/me');
            setRequests(response.data);
        } catch (error) {
            console.error('Error canceling request:', error);
            alert(error.response?.data?.message || 'Failed to cancel request.');
        } finally {
            setCancelingRequestId(null);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">My Requests</h1>
            <table className="min-w-full bg-white text-center">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">Type</th>
                        <th className="py-2 px-4 border-b">Sub Type</th>
                        <th className="py-2 px-4 border-b">Details</th>
                        <th className="py-2 px-4 border-b">Status</th>
                        <th className="py-2 px-4 border-b">Request Date</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map(request => (
                        <tr key={request.id}>
                            <td className="py-2 px-4 border-b">{request.type}</td>
                            <td className="py-2 px-4 border-b">{request.subType}</td>
                            <td className="py-2 px-4 border-b">
                                {request.type === 'Leave' && (
                                    <div className="text-sm">
                                        <div><strong>Dates:</strong> {request.details.startDate} to {request.details.endDate}</div>
                                        <div><strong>Reason:</strong> {request.details.reason.length > 30 
                                            ? `${request.details.reason.substring(0, 30)}...` 
                                            : request.details.reason}
                                        </div>
                                    </div>
                                )}
                                {request.type === 'Overtime' && (
                                    <div className="text-sm">
                                        <div><strong>Date:</strong> {request.details.date}</div>
                                        <div><strong>Hours:</strong> {request.details.requestedHours}h 
                                            {request.details.approvedHours ? ` (Approved: ${request.details.approvedHours}h)` : ''}
                                        </div>
                                        <div><strong>Shift:</strong> {request.details.schedule?.type || 'N/A'}</div>
                                    </div>
                                )}
                                {request.type === 'Shift Swap' && (
                                    <div className="text-sm">
                                        {request.subType === 'Sent' && (
                                            <div>
                                                <div><strong>My Shift:</strong> {request.details.requesterSchedule?.date} - {request.details.requesterSchedule?.type}</div>
                                                <div><strong>Target:</strong> {request.details.targetUser?.name || 'Open Request'}</div>
                                            </div>
                                        )}
                                        {request.subType === 'Received' && (
                                            <div>
                                                <div><strong>From:</strong> {request.details.requester?.name}</div>
                                                <div><strong>Their Shift:</strong> {request.details.requesterSchedule?.date} - {request.details.requesterSchedule?.type}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </td>
                            <td className={`py-2 px-4 border-b ${statusColor(request.status)}`}>
                                {request.status}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {new Date(request.requestDate).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {request.status === 'Pending' && (
                                    <button
                                        className={`bg-red-500 text-white py-1 px-3 rounded hover:bg-red-700 text-sm ${
                                            cancelingRequestId === request.id ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                        onClick={() => handleCancelRequest(request)}
                                        disabled={cancelingRequestId === request.id}
                                    >
                                        {cancelingRequestId === request.id ? 'Canceling...' : 'Cancel'}
                                    </button>
                                )}
                                {request.details.adminNotes && (
                                    <div className="mt-1">
                                        <small className="text-gray-600" title={request.details.adminNotes}>
                                            Admin Notes: {request.details.adminNotes.length > 20 
                                                ? `${request.details.adminNotes.substring(0, 20)}...` 
                                                : request.details.adminNotes}
                                        </small>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    };

export default RequestStatus;


