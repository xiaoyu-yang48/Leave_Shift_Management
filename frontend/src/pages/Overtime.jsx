import React, {useState, useEffect} from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Overtime = () => {
    const {shiftId} = useParams();
    const {user} = useAuth();
    const navigate = useNavigate();

    const [myShift, setMyShift] = useState(null);
    const [date, setDate] = useState('');
    const [hours, setHours] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadShiftData = async () => {
            try {
                const response = await axiosInstance.get(`/api/schedule/me`);
                const myShiftData = response.data.find(shift => String(shift.id) === String(shiftId));
                setMyShift(myShiftData || null);
                if (myShiftData) {
                    setDate(myShiftData.date);
                }
            } catch (error) {
                console.error('Error loading shift data:', error);
                alert('Failed to load shift data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            loadShiftData();
        }
    }, [user, shiftId]);

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!date || !hours) {
                alert('Please fill in all fields');
                return;
            }
            setSubmitting(true);
            try {
                await axiosInstance.post('/api/requests/overtime', {
                    shiftId,
                    date,
                    hours,
                });
                alert('Overtime request submitted successfully');
                navigate('/request_status');
            } catch (error) {
                console.error('Error submitting overtime request:', error);
                alert('Failed to submit overtime request. Please try again later.');
            } finally {
                setSubmitting(false);
            }
        };

        if (loading) {
            return <p>Loading...</p>;
        }
        if (!myShift) {
            return <p>No shift found.</p>;
        }

        return (
            <div className="container mx-auto mt-10">
                <h2 className="text-2xl font-bold mb-4">Request Overtime</h2>
                <div className="mb-6">Shift:{` ${myShift.date} (${myShift.type})`}</div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Shift Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Overtime Hours</label>
                        <input
                            type="number"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`px-4 py-2 bg-blue-700 text-white rounded ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {submitting ? 'Submitting...' : 'Submit Overtime Request'}
                    </button>
                </form>
            </div>
        );
    };

export default Overtime;