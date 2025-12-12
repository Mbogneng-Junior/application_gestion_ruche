app.factory('ApiService', function($http, $q) {
    // Backend déployé sur le serveur
    var API_URL = 'http://167.71.176.127:3000/api/v1';

    // Helper pour ajouter le token (à implémenter avec AuthService)
    function getHeaders() {
        var token = localStorage.getItem('auth_token');
        return {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        };
    }

    return {
        // Ruchers
        getRuchers: function() {
            return $http.get(API_URL + '/ruchers', getHeaders());
        },
        
        // Ruches
        getRuchesByRucher: function(rucherId) {
            return $http.get(API_URL + '/ruches/rucher/' + rucherId, getHeaders());
        },
        getRuche: function(id) {
            return $http.get(API_URL + '/ruches/' + id, getHeaders());
        },

        // Mesures
        getMesuresByCapteur: function(capteurId) {
            return $http.get(API_URL + '/mesures/capteur/' + capteurId, getHeaders());
        },

        // Auth
        login: function(email, password) {
            return $http.post(API_URL + '/auth/login', { email: email, password: password });
        },
        
        register: function(user) {
            return $http.post(API_URL + '/auth/register', user);
        }
    };
});
