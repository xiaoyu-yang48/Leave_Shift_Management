import React, {useState, useEffect} from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

function getDaysInMonth(year, monthZero) {
    return new Date(year, monthZero + 1, 0).getDate();
}

function fmt(year, monthZero, day) {
    const month = String(monthZero + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
}

const Availability = () => {
    const { user } = useAuth();

    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [monthZero, setMonthZero] = useState(today.getMonth());
    const daysInMonth = getDaysInMonth(year, monthZero);

    const [availability, setAvailability] = useState([]);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);


    useEffect(() => {
        const fetchAvailability = async () => {
            setLoading(true);
            try {
                // Simulated API call for fetching availability
                const response = await axiosInstance.get(`/api/availability/me`, {
                    params: { year, month: monthZero + 1 },
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setAvailability(response.data);
                
                // // frontend test only
                // setAvailability([
                //     { date: fmt(year, monthZero, 10), available: true },
                //     { date: fmt(year, monthZero, 17), available: false },
                //     { date: fmt(year, monthZero, 25), available: true },
                // ]);
            } catch (error) {
                console.error('Error fetching availability:', error);
                alert('Failed to load availability. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

       if (user) fetchAvailability();
    }, [user.id, year, monthZero]);

    useEffect(() => {
    const overrides = new Map(availability.map(item => [item.date, item.available]));
    const nextRows = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const date = fmt(year, monthZero, day);
        const available = overrides.get(date) ?? true; // Default to true if not overridden
        nextRows.push({ date, available });
    }
    setRows(nextRows);
    }, [year, monthZero, availability, daysInMonth]);

    const toggleAvailability = (date) => {
        setRows(prevRows =>
            prevRows.map(row => 
                row.date === date ? { ...row, available: !row.available } : row
            )
        );
    }

    const handleSave = async () => {
        setSaving(true);
        try {
            // Simulated API call for saving availability
            await axiosInstance.post('/api/availability/save', rows, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            // console.log('Availability saved:', rows);
            alert('Availability saved successfully!');
        } catch (error) {
            console.error('Error saving availability:', error);
            alert('Failed to save availability. Please try again later.');
        } finally {
            setSaving(false);
        }
    };

    const previousMonth = () => {
        setMonthZero(prev => {
            if (prev === 0) {
                setYear(prevYear => prevYear - 1);
                return 11; // December of the previous year
            }
            return prev - 1; // Previous month
        });
    };

    const nextMonth = () => {
        setMonthZero(prev => {
            if (prev === 11) {
                setYear(prevYear => prevYear + 1);
                return 0; // January of the next year
            }
            return prev + 1; // Next month
        });
    };

    if (loading) {
        return <div className="container mx-auto p-6">Loading...</div>;
    };

    return (
        <div>
            <div className="container mx-auto p-6">
                <h1 className="text-2xl font-bold mb-4">My Availability</h1>
                <div className="flex justify-between mb-4">
                    <button onClick={previousMonth} className="bg-gray-200 px-4 py-2 rounded">Previous</button>
                    <h2 className="text-xl">{year} - {monthZero + 1}</h2>
                    <button onClick={nextMonth} className="bg-gray-200 px-4 py-2 rounded">Next</button>
            </div>
        </div>

        <div className="mb-4">
            <table className="min-w-full bg-white text-center">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">Date</th>
                        <th className="py-2 px-4 border-b">Available</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(row => (
                        <tr key={row.date}>
                            <td className="py-2 px-4 border-b">{row.date}</td>
                            <td className="py-2 px-4 border-b">
                                {row.available ? 'Yes' : 'No'}
                            </td>
                            <td className="py-2 px-4 border-b">
                                <button
                                    onClick={() => toggleAvailability(row.date)}
                                    className={`px-3 py-1 rounded ${row.available ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                                >
                                    {row.available ? 'Mark Unavailable' : 'Mark Available'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button
                onClick={handleSave}
                disabled={saving}
                className={`bg-blue-500 text-white px-4 py-2 rounded ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {saving ? 'Saving...' : 'Save Availability'}
            </button>
        </div>
    </div>    
);
};

export default Availability;