const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = require('../server');
const User = require('../models/User');

const { expect } = chai;
chai.use(chaiHttp);

process.env.JWT_SECRET = 'testsecret';

function mockSelect(obj) {
	return { select: () => Promise.resolve(obj) };
}

describe('Auth API', () => {
	afterEach(() => sinon.restore());

	it('POST /api/auth/register should create a user', async () => {
		sinon.stub(User, 'findOne').resolves(null);
		sinon.stub(User, 'create').resolves({ id: 'u1', name: 'John', email: 'john@example.com' });

		const res = await chai
			.request(app)
			.post('/api/auth/register')
			.send({ name: 'John', email: 'john@example.com', password: 'secret' });

		expect(res).to.have.status(201);
		expect(res.body).to.include({ name: 'John', email: 'john@example.com' });
		expect(res.body).to.have.property('token');
	});

	it('POST /api/auth/login should login with valid credentials', async () => {
		const hashed = await bcrypt.hash('secret', 10);
		sinon.stub(User, 'findOne').resolves({ id: 'u1', name: 'John', email: 'john@example.com', password: hashed });

		const res = await chai
			.request(app)
			.post('/api/auth/login')
			.send({ email: 'john@example.com', password: 'secret' });

		expect(res).to.have.status(200);
		expect(res.body).to.include({ name: 'John', email: 'john@example.com' });
		expect(res.body).to.have.property('token');
	});
});