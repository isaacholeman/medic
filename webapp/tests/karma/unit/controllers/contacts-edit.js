describe('Contacts Edit controller', () => {

  'use strict';

  let actions,
      contactSchema,
      createController,
      scope,
      $rootScope,
      contactForm,
      spyState;

  beforeEach(module('inboxApp'));

  beforeEach(inject((_$rootScope_, $controller) => {
    contactForm = { forEdit: sinon.stub(), forCreate: sinon.stub() };
    actions = {
      setCancelCallback: sinon.stub(),
      setEnketoSavingStatus: sinon.stub(),
      setEnketoError: sinon.stub(),
    };
    $rootScope = _$rootScope_;
    scope = $rootScope.$new();
    scope.setTitle = sinon.stub();
    scope.clearSelected = sinon.stub();
    scope.setShowContent = sinon.stub();
    contactSchema = { get: sinon.stub().returns({ fields: { parent: '' }}) };
    var $translate = key => Promise.resolve(key + 'translated');
    $translate.instant = key => key + 'translated';

    spyState = {
      go: sinon.spy(),
      current: { name: 'my.state.is.great' },
      includes: () => { return true; },
      params: { parent_id: 'parent_id' }
    };

    createController = () => {
      return $controller('ContactsEditCtrl', {
        '$log': { error: sinon.stub() },
        '$q': Q,
        '$scope': scope,
        '$state': spyState,
        '$timeout': work => work(),
        '$translate': $translate,
        'Actions': () => actions,
        'ContactForm': contactForm,
        'ContactSave': sinon.stub(),
        'ContactSchema': contactSchema,
        'Enketo': sinon.stub(),
        'LineageModelGenerator': { contact: sinon.stub().resolves() },
        'Snackbar': sinon.stub(),
        'SessionStorage': sessionStorage
      });
    };
  }));

  it('cancelling redirects to contacts list when query has `from` param equal to `list`', () => {
    let cancelCallback;
    spyState.params.from = 'list';
    actions.setCancelCallback.callsFake(func => cancelCallback = func);

    createController();
    cancelCallback();
    chai.expect(spyState.go.callCount).to.equal(1);
    chai.expect(spyState.go.args[0]).to.deep.equal([ 'contacts.detail', { id: null } ]);
  });

  it('cancelling falls back to parent contact if new contact and query `from` param is not equal to `list`', () => {
    let cancelCallback;
    spyState.params.from = 'something';
    actions.setCancelCallback.callsFake(func => cancelCallback = func);

    createController();
    cancelCallback();
    chai.expect(spyState.go.callCount).to.equal(1);
    chai.expect(spyState.go.args[0]).to.deep.equal([ 'contacts.detail', { 'id': 'parent_id' } ]);
  });

  it('cancelling falls back to parent contact if new contact and query does not have `from` param', () => {
    let cancelCallback;
    actions.setCancelCallback.callsFake(func => cancelCallback = func);

    createController();
    cancelCallback();
    chai.expect(spyState.go.callCount).to.equal(1);
    chai.expect(spyState.go.args[0]).to.deep.equal([ 'contacts.detail', { 'id': 'parent_id' } ]);
  });

  it('cancelling falls back to contact if edit contact', () => {
    let cancelCallback;
    spyState.params.id = 'id';
    actions.setCancelCallback.callsFake(func => cancelCallback = func);

    createController();
    cancelCallback();
    chai.expect(spyState.go.callCount).to.equal(1);
    chai.expect(spyState.go.args[0]).to.deep.equal([ 'contacts.detail', { 'id': 'id' } ]);
  });

});
