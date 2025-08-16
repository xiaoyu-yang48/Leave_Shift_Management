const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const mongoose = require('mongoose');

const app = require('../server');
const Request = require('../models/Request');

const { expect } = chai;
chai.use(chaiHttp);

process.env.SKIP_AUTH = '1';

describe('Requests API', () => {
	afterEach(() => {
		sinon.restore();
	});

	it('POST /api/requests/overtime should create a new overtime request', async () => {
		const createStub = sinon.stub(Request, 'create').resolves({ _id: new mongoose.Types.ObjectId() });

		const res = await chai
			.request(app)
			.post('/api/requests/overtime')
			.send({ shiftId: '123', date: '2025-01-15', hours: 3 });

		expect(res).to.have.status(201);
		expect(res.body).to.have.property('message', 'Overtime request submitted');
		expect(createStub.calledOnce).to.be.true;
	});

	it('POST /api/requests/overtime should return 400 when required fields missing', async () => {
		const res = await chai
			.request(app)
			.post('/api/requests/overtime')
			.send({});
		expect(res).to.have.status(400);
		expect(res.body).to.have.property('message');
	});

	it('GET /api/requests/me should return current user requests', async () => {
		const docs = [
			{ _id: new mongoose.Types.ObjectId(), type: 'Overtime', subType: null, status: 'Pending', details: { date: '2025-01-01', hours: 2 }, createdAt: new Date() },
		];
		sinon.stub(Request, 'find').returns({ sort: () => ({ lean: () => Promise.resolve(docs) }) });

		const res = await chai
			.request(app)
			.get('/api/requests/me');

		expect(res).to.have.status(200);
		expect(res.body).to.be.an('array');
		expect(res.body[0]).to.include({ type: 'Overtime', status: 'Pending' });
	});

	it('PUT /api/requests/:type/:id/cancel should cancel a pending request', async () => {
		const reqId = new mongoose.Types.ObjectId();
		const saveSpy = sinon.stub().resolves();
		sinon.stub(Request, 'findOne').resolves({ _id: reqId, userId: 'test-user', status: 'Pending', save: saveSpy });

		const res = await chai
			.request(app)
			.put(`/api/requests/overtime/${reqId}/cancel`);

		expect(res).to.have.status(200);
		expect(res.body).to.have.property('message', 'Request canceled');
		expect(saveSpy.calledOnce).to.be.true;
	});
});