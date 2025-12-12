app.factory('ApiService', function($http, $q) {
    // Détection automatique de l'environnement
    // En local (localhost) -> backend local direct
    // En production (Vercel) -> utiliser le proxy Vercel (même domaine)
    var isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    var API_URL = isLocal ? 'http://localhost:3000/api/v1' : '/api/v1';
    
    console.log('API URL:', API_URL, '(isLocal:', isLocal, ')');

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
