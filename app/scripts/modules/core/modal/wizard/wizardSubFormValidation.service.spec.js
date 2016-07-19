'use strict';

describe('Service: wizardSubFormValidation ', function () {

  var accountService, $http, settings, cloudProviderRegistry;

  beforeEach(
    window.module(
      require('./wizardSubFormValidation.service.js')
    )
  );

  beforeEach(
    window.inject(function () {
    })
  );

  describe('wizardSubFormValidation config', function () {

    it('should assign scope and ', function () {
      $http.expectGET('/credentials').respond(200, [
        {name: 'test', type: 'aws'},
        {name: 'prod', type: 'aws'},
      ]);

      $http.expectGET('/credentials/test').respond(200, { a: 1});
      $http.expectGET('/credentials/prod').respond(200, { a: 2});

      var details = null;
      accountService.getAllAccountDetailsForProvider('aws').then((results) => {
        details = results;
      });

      $http.flush();

      expect(details.length).toBe(2);
      expect(details[0].a).toBe(1);
      expect(details[1].a).toBe(2);

    });

    it('should fall back to an empty array if an exception occurs when listing accounts', function () {
      $http.expectGET('/credentials').respond(429, null);

      var details = null;
      accountService.getAllAccountDetailsForProvider('aws').then((results) => {
        details = results;
      });

      $http.flush();

      expect(details).toEqual([]);
    });

    it('should fall back to an empty array if an exception occurs when getting details for an account', function () {
      $http.expectGET('/credentials').respond(200, [
        {name: 'test', type: 'aws'},
        {name: 'prod', type: 'aws'},
      ]);

      $http.expectGET('/credentials/test').respond(500, null);
      $http.expectGET('/credentials/prod').respond(200, { a: 2});

      var details = null;
      accountService.getAllAccountDetailsForProvider('aws').then((results) => {
        details = results;
      });

      $http.flush();

      expect(details).toEqual([]);
    });

  });

  describe('listProviders', function () {

    beforeEach(function() {
      this.registeredProviders = ['aws', 'gce', 'cf'];
      $http.whenGET('/credentials').respond(200,
        [ { type: 'aws' }, { type: 'gce' }, { type: 'cf' }]
      );

      spyOn(cloudProviderRegistry, 'listRegisteredProviders').and.returnValue(this.registeredProviders);
    });

    it('should list all providers when no application provided', function () {

      let test = (result) => expect(result).toEqual(['aws', 'gce', 'cf']);

      accountService.listProviders().then(test);

      $http.flush();
    });

    it('should filter out providers not registered', function () {
      this.registeredProviders.pop();

      let test = (result) => expect(result).toEqual(['aws', 'gce']);

      accountService.listProviders().then(test);

      $http.flush();
    });

    it('should fall back to the defaultProviders if none configured for the application', function () {
      let application = { attributes: {} };

      let test = (result) => expect(result).toEqual(['gce', 'cf']);

      settings.defaultProviders = ['gce', 'cf'];

      accountService.listProviders(application).then(test);

      $http.flush();
    });

    it('should return the intersection of those configured for the application and those available from the server', function () {
      let application = { attributes: { cloudProviders: 'gce,cf,unicron' } };

      let test = (result) => expect(result).toEqual(['gce', 'cf']);

      settings.defaultProviders = ['aws'];

      accountService.listProviders(application).then(test);

      $http.flush();
    });

    it('should return an empty array if none of the app providers are available from the server', function () {
      let application = { attributes: { cloudProviders: 'lamp,ceiling fan' } };

      let test = (result) => expect(result).toEqual([]);

      settings.defaultProviders = 'aws';

      accountService.listProviders(application).then(test);

      $http.flush();
    });

    it('should fall back to all registered available providers if no defaults configured and none configured on app', function () {
      let application = { attributes: {} };

      let test = (result) => expect(result).toEqual(['aws', 'gce', 'cf']);

      delete settings.defaultProviders;

      accountService.listProviders(application).then(test);

      $http.flush();
    });

  });
});
