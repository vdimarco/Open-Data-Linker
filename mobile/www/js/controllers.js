var module = angular.module('d2dapp.controllers', []);


// // A simple controller that fetches a list of data from a service
// module.controller('PetIndexCtrl', function($scope, PetService) {
//   // "Pets" is a service returning mock data (services.js)
//   $scope.pets = PetService.all();
// })

function magicEncode(s) {
	return s.replace('/', '__');
}

function magicDecode(s) {
	return s.replace('__', '/');
}

function processSearchResults(r) {

	_.each(r, function(i) {
		i.linkId = i.entityId;
		i.linkId = magicEncode(i["@id"]);
		i.identifier = getFallbackName(i["@id"]);
		if (i.identifier == "md5") i.identifier = "Cochrane topic"
		i.label = i['rdfs:label'] || i['oboInOwl:hasExactSynonym'];
	});

	return r;
}

function filterSearchResults(r) {
	return _.filter(r, function(i) {
		return !!i.label;
	});
}

function getNamespace(label) {
	var parts = label.split(':', 2)
	return parts[0];
}
function getSecondPart(label) {
	var parts = label.split(':', 2);
	return parts[1];
}

function getFallbackName(label) {
	var second = getSecondPart(label);
	var subparts = second.split('/', 2);
	return subparts[0].replace('_', ' ').replace('-', ' ')
}

function normalizeLanguage(item) {
	// console.log('normalizing lable langauge', item)
	if (_.isArray(item)) return normalizeLanguage(item[0]); // OR item[0]['@value'] ?
	else if (_.isObject(item)) return item['@value'];
	else return item;
}

function normalizeLabel(item) {
	// console.log('normalizing', item)
	var label = item['rfds:label'];
	if (_.isArray(label)) item['rfds:label'] = label.join('/');
}

module.controller('DescribeCtrl', function($scope, $stateParams, datasource) {
	var id = $stateParams.id;
	id = magicDecode(id);

	var ns = getNamespace(id);

	console.log(ns);

	if (ns == "obolibrary") {
		datasource.doidSuperclass(getSecondPart(id)).then(function(response) {
			$scope.superclasses = response['@graph'];
			console.log("Describing a DOID", response);
		});
		datasource.doidSubclass(getSecondPart(id)).then(function(response) {
			$scope.subclasses = response['@graph'];
		});
	}



	console.log("querying datasource")
	datasource.describe(id).then(function(response) {
			console.log("response received", response)

		if (ns == "bm") {
			// For a list of cochrane reviews related to a concept

			console.log('showing reviews')
			$scope.describeTitle = ""
			$scope.rawTitle = "Reviews"

			$scope.reviews = response['@graph']
			console.log($scope.reviews)
		} else if (ns == "drugbank") {
			console.log("Source: drug bank")
			$scope.isDrug = true;

			var drug = response['@graph'][0];

			$scope.describeTitle = normalizeLanguage ( drug["rdfs:label"] );

			$scope.rawTitle = normalizeLanguage( drug["rdfs:label"] );
			$scope.description = normalizeLanguage( drug["dcterms:description"] );
			$scope.indication = drug["drugbank_vocabulary:indication"];
			$scope.mechanism = drug["drugbank_vocabulary:mechanism-of-action"];
			$scope.absorption = drug["drugbank_vocabulary:absorption"];
			$scope.pharmacodynamics = drug["drugbank_vocabulary:pharmacology"];
			$scope.interactions = _.each(_.rest(response['@graph']), function(i) {
				var matches = normalizeLanguage(i['rdfs:label']).match(/\[(.*)\]/);
				i['@id'] = matches[1];
			}); ///response["interactions"];


		} else {

			normalizeLabel(response);
			$scope.rawTitle = getFallbackName(id);
			$scope.sameAs = response['owl:sameAs'];
			$scope.describeTitle = _.capitalize(response["rdfs:label"] || getFallbackName(id));
			$scope.description = response["http://schema.org/description"] || response["rdfs:comment"];
			$scope.description = $scope.description.replace('/_/', ' ');


		}
	});

})

// // A simple controller that shows a tapped item's data
// module.controller('PetDetailCtrl', function($scope, $stateParams, PetService) {
//   // "Pets" is a service returning mock data (services.js)
//   $scope.pet = PetService.get($stateParams.petId);
// })


var storeQuery = {cochrane:'', doid:'', drugbank: ''};
var storeResults = {cochrane:[], doid:[], drugbank:[]};

module.controller('SearchCtrl', function($scope, $stateParams, datasource) {
	var source = $scope.source = $stateParams.source;
	$scope.query = storeQuery[source];
	console.log('in SearchCtrl')

	$scope.results = storeResults[source];

	$scope.clearQuery = function() {
		$scope.query = '';
		$scope.results = [];
		$scope.onQueryChange('');
	}

	$scope.onQueryChange = function(q) {
		console.log('query changed', q);
		storeQuery[source] = q;
		if (q.length > 3) {
			console.log('querying search...')
			if (source == "doid") {
				datasource.searchDoid(q).then(receiveResults);
			} else if (source == "cochrane") {
				datasource.searchCochrane(q).then(receiveResults);
			} else if (source == "drugbank") {
				datasource.searchDrugbank(q).then(receiveResults);
			}
		}

		function receiveResults(response) {
			var items = response['@graph'];
			items = processSearchResults(items);
			items = filterSearchResults(items);
			console.log('RESULTS', items)
			$scope.results = items;
			storeResults[source] = $scope.results;
		}

		if (q.length == 0) {
			storeResults[source] = $scope.results = [];
		}
	}

	// $scope.$watch('query', function(value) {
	// 	console.log("query changed", arguments)
	// 	if (value.length >= 3) {
	// 		$scope.results = value.split('')
	// 	}
	// });
})
