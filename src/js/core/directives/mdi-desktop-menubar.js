(function(){
    'use strict';

    var module = angular.module('mdi.desktop.menubar', []);

    module.controller('mdiDesktopMenubarController', ['$scope',
        function ($scope) {
            $scope.openWindow = function(windowTitle) {
                $scope.windows.push({ windowTitle: windowTitle });
            }
        }]);

    module.directive('mdiDesktopMenubar', ['$log', function($log) {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'src/templates/mdi-desktop-menubar.html',
            require: '?^mdiDesktop',
            controller: 'mdiDesktopMenubarController',
            scope: {
                windows: '='
            },
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
