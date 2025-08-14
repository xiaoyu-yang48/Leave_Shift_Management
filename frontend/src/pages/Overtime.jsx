import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Overtime = () => {
    const { user } = useAuth();
    const [overtimeHistory, setOvertimeHistory] = useState([]);
    const [formData, setFormData] = useState({
        date: '',
        hours: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // In a real application, you would fetch overtime history from the backend
        // For now, using mock data
        setOvertimeHistory([
            { id: 1, date: '2023-10-01', hours: 2, reason: 'Project deadline', status: 'Approved' },
            { id: 2, date: '2023-10-05', hours: 1.5, reason: 'Client meeting', status: 'Pending' },
        ]);
    }, []);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.date || !formData.hours || !formData.reason) {
            alert('Please fill in all fields');
            return;
        }

        const hours = parseFloat(formData.hours);
        if (isNaN(hours) || hours <= 0 || hours > 12) {
            alert('Please enter a valid number of hours (1-12)');
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post('/api/requests/overtime', {
                ...formData,
                hours: hours
            });
            alert('Overtime request submitted successfully!');
            setFormData({
                date: '',
                hours: '',
                reason: ''
            });
        } catch (error) {
            console.error('Error submitting overtime request:', error);
            alert('Failed to submit overtime request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved':
                return 'text-green-600 bg-green-100';
            case 'Rejected':
                return 'text-red-600 bg-red-100';
            case 'Pending':
                return 'text-yellow-600 bg-yellow-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Overtime Management</h1>
            
            {/* Overtime Request Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Request Overtime</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                Date
                            </label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
                                Hours
                            </label>
                            <input
                                type="number"
                                id="hours"
                                name="hours"
                                value={formData.hours}
                                onChange={handleInputChange}
                                min="0.5"
                                max="12"
                                step="0.5"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 2.5"
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                            Reason
                        </label>
                        <textarea
                            id="reason"
                            name="reason"
                            value={formData.reason}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Please provide a reason for your overtime request..."
                            required
                        />
                    </div>
                    
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Overtime History */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Overtime Requests</h2>
                {overtimeHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No overtime requests found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 px-4">Date</th>
                                    <th className="text-left py-2 px-4">Hours</th>
                                    <th className="text-left py-2 px-4">Reason</th>
                                    <th className="text-left py-2 px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {overtimeHistory.map((request) => (
                                    <tr key={request.id} className="border-b hover:bg-gray-50">
                                        <td className="py-2 px-4">{request.date}</td>
                                        <td className="py-2 px-4">{request.hours} hours</td>
                                        <td className="py-2 px-4">{request.reason}</td>
                                        <td className="py-2 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Overtime;