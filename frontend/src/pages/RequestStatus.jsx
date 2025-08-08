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
    const [cancelingRequestId, setCancellingRequestId] = useState(null);

//     useEffect(() => {
//         const fetchRequests = async () => {
//             try {
//                 const response = await axiosInstance.get('/api/requests', {
//                     headers: { Authorization: `Bearer ${user.token}` },
//                 });
//                 setRequests(response.data);
//             } catch (error) {
//                 alert('Failed to fetch requests.');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchRequests();
//     }, [user]);


    // frontend test only
    useEffect(() => {
        setRequests([
            { id: 'r001', type: 'Leave', status: 'Pending', date: '2023-10-01' },
            { id: 'r002', type: 'Overtime', status: 'Approved', date: '2023-10-02' },
            { id: 'r003', type: 'Shift Swap', status: 'Rejected', date: '2023-10-03' },
        ]);
        setLoading(false);
    }, []);


    const handleCancelRequest = async (req) => {
        if (req.status !== 'Pending') return; // Prevent multiple clicks
        const ok = window.confirm('Are you sure you want to cancel this request?');
        if (!ok) return;


        try {
            setCancellingRequestId(request.id);
            // const response = await axiosInstance.post(`/api/requests/${request.id}/cancel`, {}, {
            //     headers: { Authorization: `Bearer ${user.token}` },
            // });
            // alert('Request canceled successfully');
            setRequests(prev => prev.map(r => r.id === request.id ? {...r, status: 'Canceled'} : r));
            console.log(`Request ${request.id} canceled successfully`);
        } catch (error) {
            alert('Failed to cancel request.');
        } finally {
            setCancellingRequestId(null);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">My Requests</h1>
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">Type</th>
                        <th className="py-2 px-4 border-b">Date</th>
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
                                        className="text-red-500 hover:text-red-700"
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


