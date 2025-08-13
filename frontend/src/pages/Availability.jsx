import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../axiosConfig';

function getDaysInMonth(year, monthZero) {
  return new Date(Date.UTC(year, monthZero + 1, 0)).getUTCDate();
}

function formatYYYYMMDD(year, monthZero, day) {
  const m = String(monthZero + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

const Availability = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getUTCFullYear());
  const [monthZero, setMonthZero] = useState(today.getUTCMonth());
  const [loading, setLoading] = useState(false);
  const [availabilityMap, setAvailabilityMap] = useState({}); // { 'YYYY-MM-DD': true/false }

  const monthLabel = useMemo(() => new Date(Date.UTC(year, monthZero, 1)).toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }), [year, monthZero]);
  const numDays = getDaysInMonth(year, monthZero);
  const from = formatYYYYMMDD(year, monthZero, 1);
  const to = formatYYYYMMDD(year, monthZero, numDays);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/availability/my`, { params: { from, to } });
      const map = {};
      for (const item of res.data) {
        map[item.date] = !!item.available;
      }
      setAvailabilityMap(map);
    } catch (e) {
      alert('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, monthZero]);

  const changeMonth = (delta) => {
    let m = monthZero + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setYear(y);
    setMonthZero(m);
  };

  const toggleDay = async (day) => {
    const date = formatYYYYMMDD(year, monthZero, day);
    const current = availabilityMap[date] ?? true; // default available if not set
    const next = !current;
    try {
      await axiosInstance.put('/api/availability/my', { date, available: next });
      setAvailabilityMap(prev => ({ ...prev, [date]: next }));
    } catch (e) {
      alert('Failed to update availability');
    }
  };

  const rows = [];
  for (let i = 1; i <= numDays; i++) {
    const date = formatYYYYMMDD(year, monthZero, i);
    const available = availabilityMap[date] ?? true;
    rows.push(
      <tr key={date}>
        <td className="py-2 px-4 border-b text-center">{date}</td>
        <td className="py-2 px-4 border-b text-center">
          <span className={available ? 'text-green-600' : 'text-red-600'}>
            {available ? 'Available' : 'Unavailable'}
          </span>
        </td>
        <td className="py-2 px-4 border-b text-center">
          <button onClick={() => toggleDay(i)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700">
            Toggle
          </button>
        </td>
      </tr>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Availability</h1>

      <div className="flex items-center gap-4 mb-4">
        <button className="bg-gray-200 px-3 py-1" onClick={() => changeMonth(-1)}>&lt; Prev</button>
        <div className="font-semibold">{monthLabel}</div>
        <button className="bg-gray-200 px-3 py-1" onClick={() => changeMonth(1)}>Next &gt;</button>
        {loading && <span className="ml-4 text-gray-500">Loading...</span>}
      </div>

      <table className="min-w-full bg-white text-center">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Date</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  );
};

export default Availability;