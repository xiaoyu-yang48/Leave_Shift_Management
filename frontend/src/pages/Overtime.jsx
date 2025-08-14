import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Overtime = () => {
    const { shiftId } = useParams();
    const navigate = useNavigate();
    const [hours, setHours] = useState('');
    const [reason, setReason] = useState('');
    const [myShift, setMyShift] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await axiosInstance.get('/api/schedule/me');
                const s = res.data.find(x => String(x.id) === String(shiftId));
                setMyShift(s || null);
            } catch (e) {
                // ignore
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [shiftId]);

    const submit = async (e) => {
        e.preventDefault();
        if (!shiftId || !hours) { alert('Please provide hours'); return; }
        setSubmitting(true);
        try {
            await axiosInstance.post('/api/requests/overtime', { shiftId, hours: Number(hours), reason });
            alert('Overtime request submitted');
            navigate('/request_status');
        } catch (e) {
            alert('Failed to submit overtime request');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Request Overtime</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                {myShift && (
                    <div className="mb-4">
                        <div className="text-gray-700">Shift: {myShift.date} - {myShift.type}</div>
                    </div>
                )}

                <form onSubmit={submit} className="bg-white p-4 rounded shadow max-w-xl">
                    <div className="mb-4">
                        <label className="block mb-1">Hours</label>
                        <input type="number" min="1" className="w-full border rounded p-2" value={hours} onChange={e => setHours(e.target.value)} />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">Reason (optional)</label>
                        <textarea className="w-full border rounded p-2" rows="3" value={reason} onChange={e => setReason(e.target.value)}></textarea>
                    </div>
                    <button disabled={submitting} className={`bg-blue-500 text-white px-4 py-2 rounded ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}>{submitting ? 'Submitting...' : 'Submit Request'}</button>
                </form>
                </>
            )}
        </div>
    );
};

export default Overtime;