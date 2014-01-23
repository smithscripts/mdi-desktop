(function(){
    'use strict';

    var module = angular.module('mdi.desktop.menubar', []);

    module.controller('mdiDesktopMenubarController', ['$scope',
        function ($scope) {
            $scope.openWindow = function() {
                $scope.desktopController.addWindow();
            }
        }]);

    module.directive('mdiDesktopMenubar', ['$log', function($log) {
        return {
            replace: true,
            templateUrl: 'src/templates/mdi-desktop-menubar.html',
            require: '?^mdiDesktop',
            controller: 'mdiDesktopMenubarController',
            scope: true,
            compile: function() {
                return {
                    pre: function($scope, $elm, $attrs, mdiDesktopCtrl) {
                        console.log(mdiDesktopCtrl);
                        $scope.desktopController = mdiDesktopCtrl;
                    },
                    post: function($scope, $elm, $attrs, mdiDesktopCtrl) {
                        if (mdiDesktopCtrl === undefined) {
                            throw new Error('[mdi-desktop-taskbar] mdiDesktopCtrl is undefined!');
                        }
                    }
                };
            }
        };
    }]);
})();
