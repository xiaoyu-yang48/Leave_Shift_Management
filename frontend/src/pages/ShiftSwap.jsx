import React, {useState, useEffect} from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const ShiftSwap = () => {
    const {shiftId} = useParams();
    const {user} = useAuth();
    const navigate = useNavigate();

    const [myShift, setMyShift] = useState(null);
    const [availableShifts, setAvailableShifts] = useState([]);
    const [selectedTargetShift, setSelectedTargetShift] = useState('');
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     const fetchShifts = async () => {
    //         try {
    //             const response = await axiosInstance.get(`/api/shifts/${user.id}`);
    //             setShifts(response.data);
    //         } catch (error) {
    //             console.error('Error fetching shifts:', error);
    //             alert('Failed to load shifts. Please try again later.');
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchShifts();
    // }, [user.id]);

    // frontend test only
    useEffect(() => {
        setMyShift(
            { id: shiftId, date: '2023-10-01', type: 'Morning' },
        );

        setAvailableShifts([
            { id: 200, employeeId: 2, employeeName: 'Alice' , date: '2023-10-02', type: 'Afternoon' },
            { id: 201, employeeId: 3, employeeName: 'Bob' , date: '2023-10-03', type: 'Morning' },
            { id: 202, employeeId: 4, employeeName: 'Charlie' , date: '2023-10-04', type: 'Afternoon' },
        ]);
        setLoading(false);
    }, [shiftId]);

    const handleSwap = async (e) => {
        e.preventDefault();
        if (!selectedTargetShift) {
            alert('Please select an employee to swap with.');
            return;
        }

        try {
            // const response = await axiosInstance.post(`/api/shifts/swap`, {
            //     shiftId,
            //     targetShiftId: selectedTargetShift,
            // });
            // alert('Swap request submitted');
            console.log(`Shift ${shiftId} swap request with target shift ${selectedTargetShift}`);
            alert('Swap request sent successfully!');
            navigate('/request_status');
        } catch (error) {
            console.error('Error swapping shift:', error);
            alert('Failed to swap shift. Please try again later.');
        }   
    };

    return (
        <div className="container mx-auto mt-10"> 
            <h2 className="text-2xl font-bold mb-4">Request Shift Swap</h2>
            {loading ? (
                <p>Loading...</p>
            ) : !myShift ? (
                <p>No shift found.</p>
            ) : (
            <>    
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Your Shift to Swap:</h3>
                <p>{myShift?.date} - {myShift?.type}</p>  
            </div> 

            <form onSubmit={handleSwap}>
                <label className="block mb-2">
                    Select Target Shift to Swap With:
                </label>

                    <select
                        value={selectedTargetShift}
                        onChange={(e) => setSelectedTargetShift(e.target.value)}
                        className="block w-full p-2 border rounded"
                    >
                        <option value="">Select</option>
                        {availableShifts.map((shift) => (
                            <option key={shift.id} value={shift.id}>
                                {shift.employeeName} - {shift.date} - {shift.type}
                            </option>
                        ))}
                    </select>


                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Request Swap
                </button>
            </form>
            </>
            )}
        </div>
    );
};

    export default ShiftSwap;