import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Leave = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
    const [submitting, setSubmitting] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!form.startDate || !form.endDate) {
            alert('Please provide start and end dates');
            return;
        }
        setSubmitting(true);
        try {
            await axiosInstance.post('/api/requests/leave', form);
            alert('Leave request submitted');
            navigate('/request_status');
        } catch (e) {
            alert('Failed to submit leave request');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Request Leave</h1>
            <form onSubmit={submit} className="bg-white p-4 rounded shadow max-w-xl">
                <div className="mb-4">
                    <label className="block mb-1">Start Date</label>
                    <input type="date" className="w-full border rounded p-2" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="mb-4">
                    <label className="block mb-1">End Date</label>
                    <input type="date" className="w-full border rounded p-2" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Reason (optional)</label>
                    <textarea className="w-full border rounded p-2" rows="3" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}></textarea>
                </div>
                <button disabled={submitting} className={`bg-blue-500 text-white px-4 py-2 rounded ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}>{submitting ? 'Submitting...' : 'Submit Request'}</button>
            </form>
        </div>
    );
};

export default Leave;