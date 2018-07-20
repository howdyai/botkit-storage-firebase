var should = require('should'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire').noCallThru();

require('should-sinon');

describe('Firebase', function() {
    var firebaseMock,
        appMock,
        databaseMock,
        childMock,
        rootRefMock,
        refMock,
        Storage;

    beforeEach(function() {
        childMock = {
            once: sinon.stub()
        };

        refMock = {
            child: sinon.stub().returns(childMock),
            once: sinon.stub(),
            update: sinon.stub()
        };

        rootRefMock = {
            child: sinon.stub().returns(refMock)
        };

        databaseMock = {
            ref: sinon.stub().returns(rootRefMock)
        };

        appMock = {
            database: sinon.stub().returns(databaseMock)
        };

        firebaseMock = {
            initializeApp: sinon.stub().returns(appMock)
        };

        Storage = proxyquire('../src/index', {
            firebase: firebaseMock
        });
    });

    describe('init', function() {

        it('should require a config', function() {
            Storage.should.throw('configuration is required.');
        });

        it('should require databaseURL', function() {
            (function() {Storage({});}).should.throw('databaseURL is required.');
        });

        it('should initialize firebase with databaseURL', function() {
            Storage({databaseURL: 'crystalbluepersuation'});
            firebaseMock.initializeApp.should.be.calledWith({databaseURL: 'crystalbluepersuation'});
        });
    });

    ['teams', 'channels', 'users'].forEach(function(method) {
        describe('get', function() {
            var records,
                record,
                config;

            beforeEach(function() {
                config = {databaseURL: 'right_here'};

                record = {};
                records = {
                    val: sinon.stub().returns(record)
                };
            });

            it('should get records', function() {
                var cb = sinon.stub();
                childMock.once.returns({
                    then: function(callback) {
                        return callback(records);
                    }
                });

                Storage(config)[method].get('walterwhite', cb);
                childMock.once.firstCall.args[0].should.equal('value');
                records.val.should.be.called;
                cb.should.be.calledWith(null, record);
            });

            it('should call callback on error', function() {
                var cb = sinon.stub(),
                    err = new Error('OOPS');

                childMock.once.returns({
                    then: function(success, error) {
                        return error(err);
                    }
                });

                Storage(config)[method].get('walterwhite', cb);
                childMock.once.firstCall.args[0].should.equal('value');
                records.val.should.not.be.called;
                cb.should.be.calledWith(err);
            });
        });

        describe('save', function() {
            var config;

            beforeEach(function() {
                config = {databaseURL: 'right_here'};
            });

            it('should call firebase update', function() {
                var cb = sinon.stub(),
                    data = {id: 'walterwhite'},
                    updateObj = {walterwhite: data};

                refMock.update.returns({
                    then: function(callback) {
                        return callback();
                    }
                });

                Storage(config)[method].save(data, cb);
                refMock.update.should.be.calledWith(updateObj);
                cb.should.be.calledOnce();
            });
        });

        describe('all', function() {

            var records,
                record,
                config;

            beforeEach(function() {
                config = {databaseURL: 'right_here'};

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

                refMock.once.returns({
                    then: function(callback) {
                        return callback(records);
                    }
                });
                Storage(config)[method].all(cb);
                refMock.once.firstCall.args[0].should.equal('value');
                records.val.should.be.called;
                cb.should.be.calledWith(null, result);
            });

            it('should handle no records', function() {
                var cb = sinon.stub();

                records.val.returns(undefined);
                refMock.once.returns({
                    then: function(callback) {
                        return callback(records);
                    }
                });

                Storage(config)[method].all(cb);
                refMock.once.firstCall.args[0].should.equal('value');
                records.val.should.be.called;
                cb.should.be.calledWith(null, []);
            });

            it('should call callback on error', function() {
                var cb = sinon.stub(),
                    err = new Error('OOPS');

                refMock.once.returns({
                    then: function(success, error) {
                        return error(err);
                    }
                });

                Storage(config)[method].all(cb);
                refMock.once.firstCall.args[0].should.equal('value');
                records.val.should.not.be.called;
                cb.should.be.calledWith(err);
            });
        });
    });
});
