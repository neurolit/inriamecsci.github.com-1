function SeedListCtrl($scope, $http) {
    $http.get('grains/grains.json').success(function(data) {
        $scope.seeds = data;
    });
}

function SeedDetailCtrl($scope, $routeParams) {
    $scope.seedId = $routeParams.seedId;
}