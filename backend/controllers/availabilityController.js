const Availability = require('../models/Availability');

function formatDateToYYYYMMDD(d) {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthRange(year, monthZeroBased) {
  const start = new Date(Date.UTC(year, monthZeroBased, 1));
  const end = new Date(Date.UTC(year, monthZeroBased + 1, 0));
  return { from: formatDateToYYYYMMDD(start), to: formatDateToYYYYMMDD(end) };
}

const getMyAvailability = async (req, res) => {
  try {
    let { from, to } = req.query;
    if (!from || !to) {
      const now = new Date();
      const range = getMonthRange(now.getUTCFullYear(), now.getUTCMonth());
      from = range.from;
      to = range.to;
    }

    const docs = await Availability.find({
      user: req.user._id,
      date: { $gte: from, $lte: to },
    }).sort({ date: 1 });

    res.json(docs.map(d => ({ date: d.date, available: d.isAvailable })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const upsertMyAvailability = async (req, res) => {
  try {
    const { date, available } = req.body;
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid date format (expected YYYY-MM-DD)' });
    }
    if (typeof available !== 'boolean') {
      return res.status(400).json({ message: 'available must be boolean' });
    }

    const updated = await Availability.findOneAndUpdate(
      { user: req.user._id, date },
      { $set: { isAvailable: available } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ date: updated.date, available: updated.isAvailable });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyAvailability, upsertMyAvailability };