import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Overtime = () => {
	const { shiftId } = useParams();
	const { user } = useAuth();
	const navigate = useNavigate();

	const [myShift, setMyShift] = useState(null);
	const [date, setDate] = useState('');
	const [hours, setHours] = useState('');
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		const load = async () => {
			try {
				const resp = await axiosInstance.get('/api/schedule/me', { headers: { Authorization: `Bearer ${user.token}` } });
				const shift = (resp.data || []).find(s => String(s.id) === String(shiftId));
				setMyShift(shift || null);
				if (shift) setDate(shift.date);
			} catch (e) {
				alert('Failed to load shift');
			} finally {
				setLoading(false);
			}
		};
		if (user) load();
	}, [shiftId, user]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!date || !hours) {
			alert('Please fill in date and hours');
			return;
		}
		setSubmitting(true);
		try {
			await axiosInstance.post('/api/requests/overtime', { date, hours: Number(hours), shiftId }, { headers: { Authorization: `Bearer ${user.token}` } });
			alert('Overtime request submitted');
			navigate('/request_status');
		} catch (e) {
			alert('Submit failed');
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) return <div className="container mx-auto p-6">Loading...</div>;
	if (!myShift) return <div className="container mx-auto p-6">Shift not found</div>;

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-4">Request Overtime</h1>
			<div className="mb-4">Shift: {myShift.date} - {myShift.type}</div>
			<form onSubmit={handleSubmit} className="max-w-md space-y-4">
				<div>
					<label className="block mb-1">Date</label>
					<input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded" />
				</div>
				<div>
					<label className="block mb-1">Hours</label>
					<input type="number" min="1" max="12" value={hours} onChange={e => setHours(e.target.value)} className="w-full p-2 border rounded" />
				</div>
				<button type="submit" disabled={submitting} className={`bg-green-600 text-white px-4 py-2 rounded ${submitting ? 'opacity-50' : ''}`}>
					{submitting ? 'Submitting...' : 'Submit Overtime Request'}
				</button>
			</form>
		</div>
	);
};

export default Overtime;