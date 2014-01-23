(function(){
    'use strict';

    var module = angular.module('mdi.desktop.viewport', []);

    module.controller('mdiDesktopViewportController', ['$scope',
        function ($scope) {

        }]);

    module.directive('mdiDesktopViewport', ['$log', function($log) {
        return {
            replace: true,
            templateUrl: 'src/templates/mdi-desktop-viewport.html',
            require: '?^mdiDesktop',
            controller: 'mdiDesktopViewportController',
            compile: function() {
                return {
                    pre: function($scope, $elm, $attrs, mdiDesktopCtrl) {
                        $scope.desktopController = mdiDesktopCtrl;
                    },
                    post: function($scope, $elm, $attrs, mdiDesktopCtrl) {

                    }
                };
            }
        };
    }]);
})();
