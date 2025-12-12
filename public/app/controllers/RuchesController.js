app.controller('RuchesController', function($scope, ApiService) {
    $scope.ruches = [];
    
    ApiService.getRuchers().then(function(response) {
        var ruchers = response.data;
        ruchers.forEach(function(rucher) {
            ApiService.getRuchesByRucher(rucher.id).then(function(res) {
                $scope.ruches = $scope.ruches.concat(res.data);
            });
        });
    });
});
