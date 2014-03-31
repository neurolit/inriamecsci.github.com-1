/*global angular: false */

var grainsControllers = angular.module('grainsControllers', []);

grainsControllers.controller('SeedListCtrl', [ '$scope', '$http',
    function ($scope, $http) {
        "use strict";
        $http.get('grains/index.json').success(function (data) {
            $scope.seeds = data;
            $scope.seedsSlicesByThree = [];
            var firstElement = 0;
            while (firstElement < $scope.seeds.length) {
                $scope.seedsSlicesByThree.push($scope.seeds.slice(firstElement, firstElement + 3));
                firstElement = firstElement + 3;
            }
        });
    }]);

grainsControllers.controller('SeedDetailCtrl', [ '$scope', '$routeParams', '$http',
    function ($scope, $routeParams, $http) {
        "use strict";
        $scope.seedId = $routeParams.seedId;

        $http.get('grains/' + $routeParams.seedId + '/meta.json').success(function (data) {
            $scope.seed = data;
        });

        $scope.getSeedUrl = function () {
            return 'grains/' + $scope.seedId + '/index.html';
        };
    }]);
