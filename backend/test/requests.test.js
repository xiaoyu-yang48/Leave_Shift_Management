const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = require('../server');
const User = require('../models/User');
const Request = require('../models/Request');

const { expect } = chai;
chai.use(chaiHttp);

// Helper to stub auth middleware's User.findById().select('-password') chain
function stubUserAuth(userId) {
	return sinon.stub(User, 'findById').callsFake(() => ({
		select: () => Promise.resolve({ _id: userId, id: String(userId), name: 'Test User' })
	}));
}

describe('Requests API', () => {
	let token;
	let userId;

	beforeEach(() => {
		process.env.JWT_SECRET = 'testsecret';
		userId = new mongoose.Types.ObjectId();
		token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
	});

	afterEach(() => {
		sinon.restore();
	});

	it('POST /api/requests/overtime should create a new overtime request', async () => {
		const userStub = stubUserAuth(userId);
		const createStub = sinon.stub(Request, 'create').resolves({ _id: new mongoose.Types.ObjectId() });

		const res = await chai
			.request(app)
			.post('/api/requests/overtime')
			.set('Authorization', `Bearer ${token}`)
			.send({ shiftId: '123', date: '2025-01-15', hours: 3 });

		expect(res).to.have.status(201);
		expect(res.body).to.have.property('message', 'Overtime request submitted');
		expect(createStub.calledOnce).to.be.true;
		expect(userStub.calledOnce).to.be.true;
	});

	it('POST /api/requests/overtime should return 400 when required fields missing', async () => {
		stubUserAuth(userId);
		const res = await chai
			.request(app)
			.post('/api/requests/overtime')
			.set('Authorization', `Bearer ${token}`)
			.send({});
		expect(res).to.have.status(400);
		expect(res.body).to.have.property('message');
	});

	it('GET /api/requests/me should return current user requests', async () => {
		stubUserAuth(userId);
		const docs = [
			{ _id: new mongoose.Types.ObjectId(), type: 'Overtime', subType: null, status: 'Pending', details: { date: '2025-01-01', hours: 2 }, createdAt: new Date() },
		];
		sinon.stub(Request, 'find').returns({ sort: () => ({ lean: () => Promise.resolve(docs) }) });

		const res = await chai
			.request(app)
			.get('/api/requests/me')
			.set('Authorization', `Bearer ${token}`);

		expect(res).to.have.status(200);
		expect(res.body).to.be.an('array');
		expect(res.body[0]).to.include({ type: 'Overtime', status: 'Pending' });
	});

	it('PUT /api/requests/:type/:id/cancel should cancel a pending request', async () => {
		stubUserAuth(userId);
		const reqId = new mongoose.Types.ObjectId();
		const saveSpy = sinon.stub().resolves();
		sinon.stub(Request, 'findOne').resolves({ _id: reqId, userId, status: 'Pending', save: saveSpy });

		const res = await chai
			.request(app)
			.put(`/api/requests/overtime/${reqId}/cancel`)
			.set('Authorization', `Bearer ${token}`);

		expect(res).to.have.status(200);
		expect(res.body).to.have.property('message', 'Request canceled');
		expect(saveSpy.calledOnce).to.be.true;
	});
});