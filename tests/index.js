var should = require('should'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire').noCallThru();

require('should-sinon');

describe('Firebase', function() {
    var firebaseMock,
        childMock,
        rootRefMock,
        refMocks,
        Storage;

    beforeEach(function() {
        childMock = {
            once: sinon.stub()
        };

        refMocks = {
            teams: {
                child: sinon.stub().returns(childMock),
                once: sinon.stub(),
                update: sinon.stub()
            },
            channels: {
                child: sinon.stub().returns(childMock),
                once: sinon.stub(),
                update: sinon.stub()
            },
            users: {
                child: sinon.stub().returns(childMock),
                once: sinon.stub(),
                update: sinon.stub()
            }
        };

        rootRefMock = {
            child: sinon.stub()
        };

        rootRefMock.child.withArgs('teams').returns(refMocks.teams);
        rootRefMock.child.withArgs('channels').returns(refMocks.channels);
        rootRefMock.child.withArgs('users').returns(refMocks.users);

        firebaseMock = sinon.stub().returns(rootRefMock);

        Storage = proxyquire('../src/index', {
            firebase: firebaseMock
        });
    });

    describe('init', function() {

        it('should require a config', function() {
            Storage.should.throw('firebase_uri is required.');
        });

        it('should require firebase_uri', function() {
            (function() {Storage({});}).should.throw('firebase_uri is required.');
        });
    });

    ['teams', 'channels', 'users'].forEach(function(method) {
        describe('get', function() {
            var records,
                record,
                config;

            beforeEach(function() {
                config = {firebase_uri: 'right_here'};

                record = {};
                records = {
                    val: sinon.stub().returns(record)
                };
            });

            it('should get records', function() {
                var cb = sinon.stub();
                childMock.once.callsArgWith(1, records);

                Storage(config)[method].get('walterwhite', cb);
                childMock.once.firstCall.args[0].should.equal('value');
                records.val.should.be.called;
                cb.should.be.calledWith(null, record);
            });

            it('should call callback on error', function() {
                var cb = sinon.stub(),
                    err = new Error('OOPS');

                childMock.once.callsArgWith(2, err);

                Storage(config)[method].get('walterwhite', cb);
                childMock.once.firstCall.args[0].should.equal('value');
                records.val.should.not.be.called;
                cb.should.be.calledWith(err);
            });
        });

        describe('save', function() {
            var config;

            beforeEach(function() {
                config = {firebase_uri: 'right_here'};
            });

            it('should call firebase update', function() {
                var cb = sinon.stub(),
                    data = {id: 'walterwhite'},
                    updateObj = {walterwhite: data};

                Storage(config)[method].save(data, cb);
                refMocks[method].update.should.be.calledWith(updateObj, cb);
            });
        });

        describe('all', function() {

            var records,
                record,
                config;

            beforeEach(function() {
                config = {firebase_uri: 'right_here'};

                record = {
                    'walterwhite': {id: 'walterwhite', name: 'heisenberg'},
                    'jessepinkman': {id: 'jessepinkman', name: 'capncook'}
                };

                records = {
                    val: sinon.stub().returns(record)
                };
            });

            it('should get records', function() {
                var cb = sinon.stub(),
                    result = [record.walterwhite, record.jessepinkman];

                refMocks[method].once.callsArgWith(1, records);

                Storage(config)[method].all(cb);
                refMocks[method].once.firstCall.args[0].should.equal('value');
                records.val.should.be.called;
                cb.should.be.calledWith(null, result);
            });

            it('should call callback on error', function() {
                var cb = sinon.stub(),
                    err = new Error('OOPS');

                refMocks[method].once.callsArgWith(2, err);

                Storage(config)[method].all(cb);
                refMocks[method].once.firstCall.args[0].should.equal('value');
                records.val.should.not.be.called;
                cb.should.be.calledWith(err);
            });
        });
    });
});
