app.controller('AlertesController', function($scope) {
    $scope.alertes = [
        { id: 1, type: 'Variation', condition: 'Poids augmente de 1kg en 4h', active: true },
        { id: 2, type: 'Limite', condition: 'Poids < 10kg', active: false }
    ];
});
