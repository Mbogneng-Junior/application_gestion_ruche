var app = angular.module('beeApp', ['ngRoute']);

// Configuration des routes
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl: "app/views/dashboard.html",
        controller: "DashboardController"
    })
    .when("/ruches", {
        templateUrl: "app/views/ruches.html",
        controller: "RuchesController"
    })
    .when("/ruchers", {
        templateUrl: "app/views/ruchers.html",
        controller: "RuchersController"
    })
    .when("/balance", {
        templateUrl: "app/views/balance.html",
        controller: "BalanceController"
    })
    .when("/alertes", {
        templateUrl: "app/views/alertes.html",
        controller: "AlertesController"
    })
    .when("/compte", {
        templateUrl: "app/views/compte.html",
        controller: "CompteController"
    })
    .when("/login", {
        templateUrl: "app/views/login.html",
        controller: "AuthController"
    })
    .when("/register", {
        templateUrl: "app/views/register.html",
        controller: "AuthController"
    })
    .otherwise({
        redirectTo: '/'
    });
});

// Protection des routes
app.run(function($rootScope, $location) {
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        var publicPages = ['/login', '/register'];
        var restrictedPage = publicPages.indexOf($location.path()) === -1;
        var loggedIn = localStorage.getItem('auth_token');

        if (restrictedPage && !loggedIn) {
            $location.path('/login');
        }
        
        // Si on est connecté et qu'on essaie d'aller sur login/register, on redirige vers dashboard
        if (!restrictedPage && loggedIn) {
            $location.path('/');
        }
    });
});

// Contrôleur Principal (Layout, DarkMode)
app.controller('MainCtrl', function($scope, $location) {
    $scope.isDarkMode = false;
    $scope.isSidebarOpen = false;

    // Vérifier si on est sur une page d'auth pour cacher la sidebar/header
    $scope.isAuthPage = function() {
        return ['/login', '/register'].indexOf($location.path()) !== -1;
    };

    $scope.logout = function() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        $location.path('/login');
    };

    $scope.toggleDarkMode = function() {
        $scope.isDarkMode = !$scope.isDarkMode;
    };

    $scope.toggleSidebar = function() {
        $scope.isSidebarOpen = !$scope.isSidebarOpen;
    };

    $scope.closeSidebarMobile = function() {
        if (window.innerWidth < 768) {
            $scope.isSidebarOpen = false;
        }
    };

    $scope.isActive = function(route) {
        return route === $location.path();
    };
});
