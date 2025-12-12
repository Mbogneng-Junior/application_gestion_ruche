app.controller('AuthController', function($scope, $location, ApiService) {
    $scope.user = {};
    $scope.loading = false;
    $scope.error = null;

    $scope.login = function() {
        $scope.loading = true;
        $scope.error = null;

        ApiService.login($scope.user.email, $scope.user.password)
            .then(function(response) {
                // Stocker le token et l'utilisateur
                localStorage.setItem('auth_token', response.data.token);
                localStorage.setItem('user_info', JSON.stringify(response.data.user));
                
                // Rediriger vers le dashboard
                $location.path('/');
            })
            .catch(function(error) {
                console.error("Login error:", error);
                $scope.error = error.data && error.data.message ? error.data.message : "Email ou mot de passe incorrect.";
            })
            .finally(function() {
                $scope.loading = false;
            });
    };

    $scope.register = function() {
        $scope.loading = true;
        $scope.error = null;

        // Préparer les données
        var userData = {
            email: $scope.user.email,
            password: $scope.user.password,
            prenom: $scope.user.prenom,
            nom: $scope.user.nom,
            telephone: $scope.user.telephone || ''
        };

        console.log("Registering user:", userData);

        ApiService.register(userData)
            .then(function(response) {
                console.log("Register success:", response);
                // Le backend renvoie un token, on connecte directement
                if (response.data && response.data.token) {
                    localStorage.setItem('auth_token', response.data.token);
                    localStorage.setItem('user_info', JSON.stringify(response.data.user));
                    $location.path('/');
                } else {
                    // Sinon redirection vers login
                    $location.path('/login');
                }
            })
            .catch(function(error) {
                console.error("Register error:", error);
                if (error.status === 0 || error.status === -1) {
                    $scope.error = "Impossible de contacter le serveur. Vérifiez votre connexion ou le serveur est peut-être hors ligne.";
                } else {
                    $scope.error = error.data && error.data.message ? error.data.message : "Erreur lors de l'inscription.";
                }
            })
            .finally(function() {
                $scope.loading = false;
            });
    };
});
