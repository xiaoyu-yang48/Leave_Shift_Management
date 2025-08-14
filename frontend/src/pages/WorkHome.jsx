import React, {useState, useEffect} from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const WorkHome = () => {
    const {user} = useAuth();
    const navigate = useNavigate();

    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await axiosInstance.get('/api/schedule/me');
                setSchedule(response.data);
            } catch (error) {
                console.error('Error fetching schedule:', error);
                alert('Failed to load schedule. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchSchedule();
        }
    }, [user]);

    return (
        <>
        <div className="container mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4">Welcome, {user.name}</h1>
            <p className="mb-4">Here is your work schedule:</p>
            {loading ? (
                <p>Loading...</p>
            ) : schedule.length === 0 ? (
                <p>No shifts scheduled for you.</p>
            ) : (
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b text-center">Date</th>
                            <th className="py-2 px-4 border-b text-center">Shift Type</th>
                            <th className="py-2 px-4 border-b text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedule.map((shift) => (
                            <tr key={shift.id}>
                                <td className="py-2 px-4 border-b text-center">{shift.date}</td>
                                <td className="py-2 px-4 border-b text-center">{shift.type}</td>
                                <td className="py-2 px-4 border-b text-center space-x-2">
                                    <button
                                        onClick={() => navigate(`/shiftswap/${shift.id}`)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                                    >
                                        Swap
                                    </button>
                                    <button
                                        onClick={() => navigate(`/overtime/${shift.id}`)}
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                                    >
                                        Overtime
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
        </>
        );
};

export default WorkHome;