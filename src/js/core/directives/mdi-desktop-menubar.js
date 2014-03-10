(function(){
    'use strict';

    var module = angular.module('mdi.desktop.menubar', []);

    module.controller('mdiDesktopMenubarController', ['$scope',
        function ($scope) {
            var self = this;

            $scope.openWindow = function(title, templateUrl) {
                $scope.desktopCtrl.clearActive();
                var zIndex = $scope.desktopCtrl.getNextMaxZIndex()
                $scope.windows.push(
                    {
                        title: title,
                        active: true,
                        minimized: false,
                        maximized: false,
                        zIndex: zIndex,
                        views: [
                            {
                                templateUrl: templateUrl,
                                active: true
                            }
                        ]
                    }
                );
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
            link: function(scope, element, attrs, desktopCtrl) {
                scope.desktopCtrl = desktopCtrl;
                scope.options = desktopCtrl.getOptions();
            }
        };
    }]);
})();
