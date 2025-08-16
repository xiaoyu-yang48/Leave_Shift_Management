const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server'); 
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const { expect } = chai;
const Request = require('../models/Request');

chai.use(chaiHttp);
let server;
let port;


describe('Request Test', () => {

    afterEach(async () => {
        sinon.restore();
    });

    it('POST /api/requests should create a new overtime request', async () => {
        const createRequestStub = sinon.stub(Request, 'create').resolves({
            _id: mongoose.Types.ObjectId()});

        const res = await chai.request(app)
        .post('/api/requests/overtime')
        .send({shiftId: '12345', hours: 2});

        expect(res).to.have.status(201);
        expect(res.body).to.have.property('message', 'Request created successfully');
        expect(createRequestStub.calledOnce).to.be.true;
    });
    
    it('POST /api/requests should create a new shift swap request', async () => {
        const requestData = {
        userId: mongoose.Types.ObjectId(),
        type: 'Shift Swap',
        subType: 'Morning to Afternoon',
        details: { shiftId: mongoose.Types.ObjectId() }
        };

        const res = await chai.request(app)
        .post('/api/requests')
        .send(requestData);

        expect(res).to.have.status(201);
        expect(res.body).to.have.property('_id');
        expect(res.body.type).to.equal('Shift Swap');
        expect(res.body.subType).to.equal('Morning to Afternoon');
        expect(res.body.details).to.deep.equal({ shiftId: res.body.details.shiftId });
    });
});
