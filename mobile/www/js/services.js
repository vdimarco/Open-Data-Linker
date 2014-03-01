
var searchUrl = "http://mobile.bio2rdf.org/cochrane/search_ns/json-ld?callback=JSON_CALLBACK&parm1="
var describeUrl = "http://mobile.bio2rdf.org/cochrane/describe/json-ld?callback=JSON_CALLBACK&uri="
// var describeDoidUrl = "http://mobile.bio2rdf.org/ontobee/describe/json-ld?callback=JSON_CALLBACK&uri=http://purl.obolibrary.org/obo/"

// var doidSuperclassUrl = "http://mobile.bio2rdf.org/ontobee/superclass/json-ld?callback=JSON_CALLBACK&uri=http://purl.obolibrary.org/obo/"
// var doidSubclassUrl = "http://mobile.bio2rdf.org/ontobee/subclass/json-ld?callback=JSON_CALLBACK&uri=http://purl.obolibrary.org/obo/"

var md5Url = "http://mobile.bio2rdf.org/md5/links/json-ld?callback=JSON_CALLBACK&uri=";

var describeDoidUrl = "http://mobile.bio2rdf.org/doid/describe/json-ld?callback=JSON_CALLBACK&uri=http://purl.obolibrary.org/obo/"

var doidSuperclassUrl = "http://mobile.bio2rdf.org/doid/superclass/json-ld?callback=JSON_CALLBACK&uri=http://purl.obolibrary.org/obo/"
var doidSubclassUrl = "http://mobile.bio2rdf.org/doid/subclass/json-ld?callback=JSON_CALLBACK&uri=http://purl.obolibrary.org/obo/"

var drugbankSearchUrl = "http://mobile.bio2rdf.org/drugbank/search_ns/json-ld?callback=JSON_CALLBACK&parm1=";
var drugbankDescribeUrl = "http://mobile.bio2rdf.org/drugbank/describe/json-ld?callback=JSON_CALLBACK&uri=";

angular.module('d2dapp.services', [])



.filter('normalizeLabelLanguage', function() {
  return normalizeLanguage
})

.filter('capitalize', function() {
  return _.capitalize
})


.filter('stripFirstNamespace', function() {
  return function(s) {
    var colon = s.indexOf(':')

    return s.slice(colon + 1);
  }
})

.filter('magicEncode', function() {
  return magicEncode
})


.factory('datasource', function($http) {
  return {
    describe: function(id) {
      var parts = id.split(':', 2);
      if (parts[0] == "obolibrary") {
        var url = describeDoidUrl + parts[1];
      } else if (parts[0] == "bm") {

        var url = md5Url + 'http://bio2rdf.org/' + id.slice(3);
      } else if (parts[0] == "drugbank") {
        var url = drugbankDescribeUrl + 'http://bio2rdf.org/' + id;
      } else {
        // Cochrane
        var url = describeUrl + "http://bio2rdf.org/" + id
      }
      return $http.jsonp(url).then(responseDataReturner);
    },
    searchDoid: function(q) {
      var url = doidSearchUrl + q;
      return $http.jsonp(url).then(responseDataReturner);
    },
    searchDrugbank: function(q) {
      var url = drugbankSearchUrl + q
      return $http.jsonp(url).then(responseDataReturner);
    },
    // describeDrugbank: function(id) {
    //   var url = drugbankDescribeUrl + id;
    // return $http.jsonp(url).then(responseDataReturner);

    // },
    searchCochrane: function(query) {
      // $http returns a promise, which has a then function, which also returns a promise
      var url = searchUrl + query;
      var promise = $http.jsonp(url).then(function (response) {
        // The then function here is an opportunity to modify the response
        console.log(response);
        // The return value gets picked up by the then in the controller.
        return response.data;
      });
      // Return the promise to the controller
      return promise;
    },
    doidSuperclass: function(doid) {
      var url = doidSuperclassUrl + doid;
      return $http.jsonp(url).then(responseDataReturner);
    },
    doidSubclass: function(doid) {
      var url = doidSubclassUrl + doid;
      return $http.jsonp(url).then(responseDataReturner);
    }
  };
});

function responseDataReturner(response) {
  return response.data;
}

var doidSearchUrl = "http://mobile.bio2rdf.org/ontobee/search_ns/json-ld?callback=JSON_CALLBACK&parm2=DOID&parm1=";