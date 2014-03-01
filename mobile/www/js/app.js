// Ionic d2dapp App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'd2dapp' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'd2dapp.services' is found in services.js
// 'd2dapp.controllers' is found in controllers.js
angular.module('d2dapp', ['ionic', 'd2dapp.services', 'd2dapp.controllers'])


.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider


    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })

    .state('tab.splash', {
      url: '/splash',
      views: {
        'splash-tab': {
          templateUrl: 'templates/splash.html',
        }
      }
    })

    // the pet tab has its own child nav-view and history
    .state('tab.menu', {
      url: '/search',
      views: {
        'search-tab': {
          templateUrl: 'templates/menu.html',
        }
      }
    })

    .state('tab.pet-detail', {
      url: '/pet/:petId',
      views: {
        'pets-tab': {
          templateUrl: 'templates/pet-detail.html',
          controller: 'PetDetailCtrl'
        }
      }
    })

    .state('tab.describe', {
      url: '/describe/:id',
      views: {
        'search-tab': {
          templateUrl: 'templates/describe.html',
          controller: 'DescribeCtrl'
        }
      }
    })

    .state('tab.about', {
      url: '/about',
      views: {
        'about-tab': {
          templateUrl: 'templates/about.html'
        }
      }
    })

    .state('tab.search', {
      url: '/search/:source',
      views: {
        'search-tab': {
          templateUrl: 'templates/search.html',
          controller: 'SearchCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/splash');

});

