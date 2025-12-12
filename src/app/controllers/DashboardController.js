app.controller('DashboardController', function($scope, $timeout, ApiService) {
    $scope.loading = true;
    $scope.ruches = [];
    $scope.ruchers = [];
    $scope.selectedRuche = null;
    $scope.selectedRucher = null;
    $scope.selectedRucheChart = null;
    $scope.selectedRucherVision = null;
    $scope.chartFilter = 'mois';
    
    // Stats pour les hexagones
    $scope.stats = {
        poids: 18,
        humidite: 25,
        temp: 9,
        gainJour: 0.84,
        poidsTotal: 156,
        ruchesActives: 12,
        alertes: 2
    };

    // Météo - 5 jours
    $scope.weatherDays = [
        { label: 'Lun', tempMax: 19, tempMin: 13, icon: 'ph-cloud-lightning', color: '#facc15' },
        { label: 'Mar', tempMax: 22, tempMin: 13, icon: 'ph-cloud-rain', color: '#60a5fa' },
        { label: 'Mer', tempMax: 23, tempMin: 12, icon: 'ph-sun', color: '#fb923c' },
        { label: 'Jeu', tempMax: 26, tempMin: 16, icon: 'ph-cloud-sun', color: '#fbbf24' },
        { label: 'Ven', tempMax: 20, tempMin: 16, icon: 'ph-cloud', color: '#94a3b8' }
    ];

    // Prévisions horaires
    $scope.hourlyForecast = [
        { time: '8h', temp: 12, icon: 'ph-cloud', color: '#94a3b8' },
        { time: '10h', temp: 15, icon: 'ph-cloud-sun', color: '#fbbf24' },
        { time: '12h', temp: 19, icon: 'ph-sun', color: '#fb923c' },
        { time: '14h', temp: 22, icon: 'ph-sun', color: '#fb923c' },
        { time: '16h', temp: 20, icon: 'ph-cloud-sun', color: '#fbbf24' },
        { time: '18h', temp: 17, icon: 'ph-cloud', color: '#94a3b8' },
        { time: '20h', temp: 14, icon: 'ph-moon-stars', color: '#6366f1' }
    ];

    // Initialisation
    function init() {
        // 1. Récupérer les ruchers depuis le backend
        ApiService.getRuchers().then(function(response) {
            $scope.ruchers = response.data;
            if ($scope.ruchers.length > 0) {
                $scope.selectedRucher = $scope.ruchers[0];
                $scope.selectedRucherVision = $scope.ruchers[0];
            }

            var promises = [];

            // 2. Récupérer les ruches pour chaque rucher
            $scope.ruchers.forEach(function(rucher) {
                promises.push(ApiService.getRuchesByRucher(rucher.id));
            });

            Promise.all(promises).then(function(results) {
                // Aplatir la liste des ruches
                results.forEach(function(res) {
                    $scope.ruches = $scope.ruches.concat(res.data);
                });

                if ($scope.ruches.length > 0) {
                    $scope.selectedRuche = $scope.ruches[0];
                    $scope.selectedRucheChart = $scope.ruches[0];
                    $scope.selectRuche($scope.ruches[0]);
                } else {
                    $scope.loading = false;
                }
                
                $timeout(function() {
                    initMap();
                    initMainChart();
                    initRucheEvolutionChart();
                    $scope.$apply();
                }, 100);
            });
        }, function(error) {
            console.error("Erreur chargement ruchers", error);
            $scope.loading = false;
            // Données de fallback pour le développement
            $scope.ruchers = [
                { id: 1, nom: '25 Fires' },
                { id: 2, nom: 'Rucher Sud' }
            ];
            $scope.ruches = [
                { id: 1, nom: 'Ruchette Lele', lat: 45.83, lng: 1.26 },
                { id: 2, nom: 'Ruche Reine', lat: 45.84, lng: 1.27 }
            ];
            $scope.selectedRucher = $scope.ruchers[0];
            $scope.selectedRuche = $scope.ruches[0];
            $timeout(function() {
                initMap();
                initMainChart();
                initRucheEvolutionChart();
            }, 100);
        });
    }

    $scope.selectRucher = function(rucher) {
        $scope.selectedRucher = rucher;
        // Filtrer les ruches par rucher si nécessaire
    };

    $scope.selectRuche = function(ruche) {
        $scope.selectedRuche = ruche;
        loadRucheData(ruche);
    };

    $scope.setChartFilter = function(filter) {
        $scope.chartFilter = filter;
    };

    $scope.updateChartData = function() {
        // Mise à jour du graphique selon la ruche sélectionnée
    };

    function loadRucheData(ruche) {
        if (!ruche || !ruche.capteur_id) {
            $scope.loading = false;
            return;
        }

        ApiService.getMesuresByCapteur(ruche.capteur_id).then(function(response) {
            var mesures = response.data;
            processMesures(mesures);
            updateChartData(mesures);
            $scope.loading = false;
        }, function(err) {
            console.error("Erreur chargement mesures", err);
            $scope.loading = false;
        });
    }

    function processMesures(mesures) {
        if (!mesures || mesures.length === 0) {
            return;
        }

        mesures.sort((a, b) => new Date(a.date_mesure) - new Date(b.date_mesure));
        var last = mesures[mesures.length - 1];

        $scope.stats.poids = last.poids_kg || 18;
        $scope.stats.humidite = last.humidite_ext || 25;
        $scope.stats.temp = last.temperature_ext || 9;
        
        if (mesures.length > 1) {
            var prev = mesures[mesures.length - 2];
            $scope.stats.gainJour = ((last.poids_kg - prev.poids_kg) || 0.84).toFixed(2);
        }
    }

    function updateChartData(mesures) {
        if (window.mainChartInstance && mesures && mesures.length > 0) {
            var labels = mesures.map(m => new Date(m.date_mesure).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }));
            var data = mesures.map(m => m.poids_kg);
            
            window.mainChartInstance.data.labels = labels;
            window.mainChartInstance.data.datasets[0].data = data;
            window.mainChartInstance.update();
        }
    }

    function initMap() {
        var mapEl = document.getElementById('mapDashboard');
        if (!mapEl) return;
        
        // Coordonnées par défaut (Charente)
        var defaultLat = 45.65;
        var defaultLng = 0.16;
        
        var map = L.map('mapDashboard', { zoomControl: true }).setView([defaultLat, defaultLng], 10);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            maxZoom: 19
        }).addTo(map);

        // Custom icon
        var beeIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div class="w-8 h-8 bg-honey-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white"><i class="ph-fill ph-hexagon text-white text-lg"></i></div>',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        // Add markers for ruches
        $scope.ruches.forEach(function(r) {
            if (r.lat && r.lng) {
                L.marker([r.lat, r.lng], { icon: beeIcon })
                    .addTo(map)
                    .bindPopup('<strong>' + r.nom + '</strong>');
            }
        });

        // Add markers for ruchers
        $scope.ruchers.forEach(function(r) {
            if (r.latitude && r.longitude) {
                L.marker([r.latitude, r.longitude], { icon: beeIcon })
                    .addTo(map)
                    .bindPopup('<strong>' + r.nom + '</strong>');
            }
        });
    }

    function initMainChart() {
        var ctx = document.getElementById('mainChart');
        if (!ctx) return;
        
        window.mainChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['14 oct', '16 oct', '18 oct', '20 oct', '22 oct', '24 oct'],
                datasets: [
                    { 
                        label: 'Ruche Lele', 
                        data: [30, 31, 30.5, 32, 33, 33.5], 
                        borderColor: '#f59e0b', 
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#f59e0b',
                        pointBorderWidth: 2
                    },
                    { 
                        label: 'Ruche Reine', 
                        data: [28, 28.5, 29, 29.5, 30, 30.2], 
                        borderColor: '#10b981', 
                        tension: 0.4,
                        pointRadius: 3
                    },
                    { 
                        label: 'Ruche Violette', 
                        data: [25, 25.2, 25.1, 25.3, 25.2, 25.4], 
                        borderColor: '#8b5cf6', 
                        tension: 0.4,
                        pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        titleColor: '#1e293b',
                        bodyColor: '#64748b',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true
                    }
                },
                scales: {
                    y: { 
                        grid: { color: '#f1f5f9' }, 
                        border: { display: false },
                        ticks: { color: '#94a3b8', font: { size: 11 } }
                    },
                    x: { 
                        grid: { display: false }, 
                        border: { display: false },
                        ticks: { color: '#94a3b8', font: { size: 11 } }
                    }
                }
            }
        });
    }

    function initRucheEvolutionChart() {
        var ctx = document.getElementById('rucheEvolutionChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['14 oct', '16 oct', '18 oct', '20 oct', '22 oct', '24 oct'],
                datasets: [{
                    label: 'Poids (kg)',
                    data: [36.4, 36.8, 37.2, 37.0, 37.8, 38.2],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#f59e0b',
                    pointBorderWidth: 2,
                    yAxisID: 'y'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        titleColor: '#1e293b',
                        bodyColor: '#64748b',
                        borderColor: '#e2e8f0',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: { 
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: { color: '#f1f5f9' }, 
                        border: { display: false },
                        ticks: { color: '#94a3b8', font: { size: 11 } }
                    },
                    x: { 
                        grid: { display: false }, 
                        border: { display: false },
                        ticks: { color: '#94a3b8', font: { size: 11 } }
                    }
                }
            }
        });
    }

    init();
});
