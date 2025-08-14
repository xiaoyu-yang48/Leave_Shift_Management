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
                alert('Failed to fetch requests.');
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [user]);





    const handleCancelRequest = async (req) => {
        if (req.status !== 'Pending') return; // Prevent multiple clicks
        const ok = window.confirm('Are you sure you want to cancel this request?');
        if (!ok) return;


        try {
            setCancelingRequestId(req.id);
            await axiosInstance.post(`/api/requests/${req.id}/cancel`);
            setRequests(prev => prev.map(r => r.id === req.id ? {...r, status: 'Canceled'} : r));
        } catch (error) {
            alert('Failed to cancel request.');
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
                        <th className="py-2 px-4 border-b">Request Date</th>
                        <th className="py-2 px-4 border-b">Status</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map(request => (
                        <tr key={request.id}>
                            <td className="py-2 px-4 border-b">{request.type}</td>
                            <td className="py-2 px-4 border-b">{request.date}</td>
                            <td className={`py-2 px-4 border-b ${statusColor(request.status)}`}>
                                {request.status}
                            </td>
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


