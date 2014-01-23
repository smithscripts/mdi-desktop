(function(){
    'use strict';

    var module = angular.module('mdi.desktop.viewport', []);

    module.controller('mdiDesktopViewportController', ['$scope',
        function ($scope) {

        }]);

    module.directive('mdiDesktopViewport', ['$log', function($log) {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'src/templates/mdi-desktop-viewport.html',
            require: '?^mdiDesktop',
            controller: 'mdiDesktopViewportController',
            scope: {
                windows: '='
            },
            compile: function() {
                return {
                    pre: function($scope, $elm, $attrs, mdiDesktopCtrl) {
                        $scope.window = mdiDesktopCtrl;
                    },
                    post: function($scope, $elm, $attrs, mdiDesktopCtrl) {

                    }
                };
            }
        };
    }]);
})();
