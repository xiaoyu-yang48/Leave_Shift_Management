import React, {useState, useEffect} from 'react';
import { useAuth } from '../context/AuthContext';
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

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axiosInstance.get('/api/requests/me');
                setRequests(response.data);
            } catch (error) {
                alert('Failed to fetch requests.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchRequests();
        }
    }, [user]);


    // // frontend test only
    // useEffect(() => {
    //     setRequests([
    //         { id: 'r001', type: 'Leave', status: 'Pending', date: '2023-10-01' },
    //         { id: 'r002', type: 'Overtime', status: 'Approved', date: '2023-10-02' },
    //         { id: 'r003', type: 'Shift Swap', status: 'Rejected', date: '2023-10-03' },
    //     ]);
    //     setLoading(false);
    // }, []);


    const handleCancelRequest = async (req) => {
        if (req.status !== 'Pending') return; // Prevent multiple clicks
        const ok = window.confirm('Are you sure you want to cancel this request?');
        if (!ok) return;


        try {
            const requestType = req.type.toLowerCase().replace(' ', '_');
            await axiosInstance.put(`/api/requests/${requestType}/${req.id}/cancel`);
            alert('Request canceled successfully!');

            const response = await axiosInstance.get('/api/requests/me');
            setRequests(response.data);
        } catch (error) {
            alert('Failed to cancel request.');
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
                        <th className="py-2 px-4 border-b">Sub Types</th>
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
                            <td className="py-2 px-4 border-b">{request.subType || 'N/A'}</td>
                            <td className="py-2 px-4 border-b">
                                {request.type === 'Leave' && (
                                    <div>
                                        <p>Start: {request.details.startDate}</p>
                                        <p>End: {request.details.endDate}</p>
                                    </div>
                                )}

                                {request.type === 'Overtime' && (
                                    <div>
                                        <p>Date: {request.details.date}</p>
                                        <p>Hours: {request.details.hours}</p>
                                    </div>
                                )}

                                {request.type === 'Shift Swap' && (
                                    <div>
                                        <p>My Shift: {request.details.requesterSchedule?.date} - {request.details.requesterSchedule?.type}</p>
                                        <p>Target Shift: {request.details.targetUser?.name || 'Open Request'}</p>
                                    </div>
                                )}

                                {request.subType === 'Received' && (
                                    <div>
                                        <p>From: {request.details.requester?.name}</p> 
                                        <p>Shift: {request.details.requesterSchedule?.date} - {request.details.requesterSchedule?.type}</p>
                                    </div>
                                )}
                                </td>
                            <td className={`py-2 px-4 border-b ${statusColor(request.status)}`}>
                                {request.status}
                            </td>

                            <td className="py-2 px-4 border-b">{new Date(request.createdAt).toLocaleDateString()}</td>
                            
                            <td className="py-2 px-4 border-b">
                                {request.status === 'Pending' && (
                                    <button
                                        className="bg-blue-500 text-white py-2 px-4 border-b hover:scale-105 transition-transform"
                                        onClick={() => handleCancelRequest(request)}
                                    >
                                        Cancel
                                    </button>
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


