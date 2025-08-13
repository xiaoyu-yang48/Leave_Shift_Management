const User = require('../models/User');
const Shift = require('../models/Shift');

async function seedDevData() {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return; // already seeded
    }

    const admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: 'Admin@123', role: 'admin' });
    const employee = await User.create({ name: 'Employee One', email: 'employee@example.com', password: 'Employee@123', role: 'employee' });

    const today = new Date();
    const d1 = new Date(today);
    d1.setDate(today.getDate() + 1);
    const d2 = new Date(today);
    d2.setDate(today.getDate() + 2);
    const d3 = new Date(today);
    d3.setDate(today.getDate() + 3);

    await Shift.create([
      { employee: employee._id, date: d1, shiftType: 'Morning', location: 'Site A' },
      { employee: employee._id, date: d2, shiftType: 'Afternoon', location: 'Site A' },
      { employee: admin._id, date: d3, shiftType: 'Night', location: 'HQ' },
    ]);

    console.log('Seeded admin, employee, and sample shifts');
  } catch (e) {
    console.error('Seeding error:', e.message);
  }
}

module.exports = { seedDevData };