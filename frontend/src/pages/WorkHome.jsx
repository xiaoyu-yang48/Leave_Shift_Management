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
        if (user){
            fetchSchedule();
        }
    }, [user]);

    // frontend test only
    useEffect(() => {
        setSchedule([
            { id: 1, date: '2023-10-01', type: 'Morning' },
            { id: 2, date: '2023-10-02', type: 'Afternoon' },
            { id: 3, date: '2023-10-03', type: 'Afternoon' },
        ]);
        setLoading(false);
    }, []);

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
                <table className="min-w-full border-collapse border border-green-400">
                    <thead>
                        <tr>
                            <th className="border border-green-400 py-2 px-4 border-b text-center">Date</th>
                            <th className="border border-green-400 py-2 px-4 border-b text-center">Shift Type</th>
                            <th className="border border-green-400 py-2 px-4 border-b text-center space-x-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedule.map((shift) => (
                            <tr key={shift.id}>
                                <td className="border border-green-300 py-2 px-4 border-b text-center">{shift.date}</td>
                                <td className="border border-green-300 py-2 px-4 border-b text-center">{shift.type}</td>
                                <td className="border border-green-300 py-2 px-4 border-b text-center space-x-2">
                                    <button
                                        onClick={() => navigate(`/shiftswap/${shift.id}`)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    >
                                        Swap
                                    </button>
                                    <button
                                        onClick={() => navigate(`/overtime/${shift.id}`)}
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
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