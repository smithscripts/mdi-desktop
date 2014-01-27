(function(){
    'use strict';

    var module = angular.module('mdi.desktop.viewport', []);

    module.controller('mdiDesktopViewportController', ['$scope', '$element', '$window',
        function ($scope, $element, $window) {
            var self = this;

            self.getViewportDimensions = function() {
              return $scope.dimensions;
            };

            angular.element($window).bind('resize', function () {
                $scope.$apply(function() {
                    $scope.dimensions.height = $element[0].clientHeight;
                    $scope.dimensions.width = $element[0].clientWidth;
                });
            });

            $scope.dimensions = {
                height: $element[0].clientHeight,
                width: $element[0].clientWidth
            };
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
            }
        };
    }]);
})();
