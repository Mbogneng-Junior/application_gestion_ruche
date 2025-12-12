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

        ApiService.register($scope.user)
            .then(function(response) {
                // Connexion automatique après inscription ou redirection vers login
                // Ici on redirige vers login pour faire simple, ou on connecte direct
                // On va connecter direct si le backend renvoie un token, sinon login
                
                // Pour l'instant, on redirige vers login avec un message (ou on connecte auto si on implémente le login auto)
                // On va appeler login()
                $scope.login(); 
            })
            .catch(function(error) {
                console.error("Register error:", error);
                $scope.error = error.data && error.data.message ? error.data.message : "Erreur lors de l'inscription.";
            })
            .finally(function() {
                $scope.loading = false;
            });
    };
});
