app.controller('RuchersController', function($scope, ApiService) {
    $scope.ruchers = [];
    ApiService.getRuchers().then(function(response) {
        $scope.ruchers = response.data;
    });
});
