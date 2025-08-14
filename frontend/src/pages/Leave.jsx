import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Leave = () => {
	const { user } = useAuth();
	const navigate = useNavigate();

	const [balance, setBalance] = useState(null);
	const [form, setForm] = useState({ leaveType: 'Annual', startDate: '', endDate: '', reason: '' });
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		const load = async () => {
			try {
				const resp = await axiosInstance.get('/api/leave/balance', { headers: { Authorization: `Bearer ${user.token}` } });
				setBalance(resp.data);
			} catch (e) {
				setBalance({ annualTotal: 20, used: 0, remaining: 20 });
			} finally {
				setLoading(false);
			}
		};
		if (user) load();
	}, [user]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.startDate || !form.endDate) {
			alert('Please select start and end dates');
			return;
		}
		setSubmitting(true);
		try {
			await axiosInstance.post('/api/requests/leave', form, { headers: { Authorization: `Bearer ${user.token}` } });
			alert('Leave request submitted');
			navigate('/request_status');
		} catch (e) {
			alert('Submit failed');
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) return <div className="container mx-auto p-6">Loading...</div>;

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-4">Leave</h1>
			{balance && (
				<div className="mb-6">
					<h2 className="text-xl font-semibold mb-2">Balance</h2>
					<p>Total: {balance.annualTotal} days</p>
					<p>Used: {balance.used} days</p>
					<p>Remaining: {balance.remaining} days</p>
				</div>
			)}

			<form onSubmit={handleSubmit} className="max-w-md space-y-4">
				<div>
					<label className="block mb-1">Leave Type</label>
					<select value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value })} className="w-full p-2 border rounded">
						<option>Annual</option>
						<option>Sick</option>
						<option>Unpaid</option>
					</select>
				</div>
				<div>
					<label className="block mb-1">Start Date</label>
					<input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full p-2 border rounded" />
				</div>
				<div>
					<label className="block mb-1">End Date</label>
					<input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full p-2 border rounded" />
				</div>
				<div>
					<label className="block mb-1">Reason (optional)</label>
					<textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="w-full p-2 border rounded" />
				</div>
				<button type="submit" disabled={submitting} className={`bg-blue-600 text-white px-4 py-2 rounded ${submitting ? 'opacity-50' : ''}`}>
					{submitting ? 'Submitting...' : 'Submit Leave Request'}
				</button>
			</form>
		</div>
	);
};

export default Leave;