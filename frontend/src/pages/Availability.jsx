import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function getDaysInMonth(year, monthZero) {
  return new Date(Date.UTC(year, monthZero + 1, 0)).getUTCDate();
}

function fmt(year, monthZero, day) {
  const m = String(monthZero + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

const Availability = () => {
  const { user } = useAuth();

  const today = new Date();
  const year = today.getUTCFullYear();
  const monthZero = today.getUTCMonth();
  const daysInMonth = getDaysInMonth(year, monthZero);

  const [availability, setAvailability] = useState([]); // [{date, available}]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        // Simulated API call for fetching availability
        // const response = await axiosInstance.get(`/api/availability/${user.id}`);
        // setAvailability(response.data);

        // frontend test only: only specify exceptions; unspecified days default to Available
        setAvailability([
          { date: fmt(year, monthZero, 5), available: false },
          { date: fmt(year, monthZero, 12), available: false },
        ]);
      } catch (error) {
        alert('Failed to load availability.');
      } finally {
        setLoading(false);
      }
    };

    if (!user) return;
    fetchAvailability();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  const overrides = new Map(availability.map(a => [a.date, a.available]));
  const rows = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = fmt(year, monthZero, day);
    const available = overrides.has(date) ? overrides.get(date) : true; // default Available
    rows.push(
      <li key={date} className={`mb-2 ${available ? 'text-green-500' : 'text-red-500'}`}>
        {date}: {available ? 'Available' : 'Not Available'}
      </li>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Availability</h1>
      <ul>
        {rows}
      </ul>
    </div>
  );
};

export default Availability;