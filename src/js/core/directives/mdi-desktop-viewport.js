(function(){
    'use strict';

    var module = angular.module('mdi.desktop.viewport', []);

    module.controller('mdiDesktopViewportController', ['$scope', '$element', '$window', '$document',
        function ($scope, $element, $window, $document) {
            var self = this;

            self.getViewportDimensions = function() {
              return $scope.dimensions;
            };
            
            self.mouseMove = function(event) {
                $scope.$apply(function() {
                    if (event.pageX <= 0) {
                        $scope.showLeftOutline = true;
                    } else {
                        $scope.showLeftOutline = false;
                    };
                    if (event.pageX >= $scope.dimensions.width - 1) {
                        $scope.showRightOutline = true;
                    } else {
                        $scope.showRightOutline = false;
                    };
                });
            }

            self.mouseUp = function(event) {
                $scope.$apply(function() {
                    $scope.showLeftOutline = false;
                    $scope.showRightOutline = false;
                });
                $document.unbind('mousemove', self.mouseMove);
                $document.unbind('mouseup', self.mouseUp);
            }

            $scope.showLeftOutline = false;
            $scope.showRightOutline = false;

            $scope.viewportMouseDown = function (event) {
                $document.on('mousemove', self.mouseMove);
                $document.on('mouseup', self.mouseUp);
            };

            angular.element($window).bind('resize', function () {
                $scope.$apply(function() {
                    $scope.dimensions.height = $element[0].clientHeight;
                    $scope.dimensions.width = $element[0].clientWidth;
                });
            });
        }]);

    module.directive('mdiDesktopViewport', ['$timeout', '$window', function($timeout, $window) {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'src/templates/mdi-desktop-viewport.html',
            require: '?^mdiDesktop',
            controller: 'mdiDesktopViewportController',
            scope: {
                windows: '='
            },
            link: function(scope, element, attrs, desktopCtrl) {
                scope.desktopCtrl = desktopCtrl;
                scope.options = desktopCtrl.getOptions();

                $timeout(function() {
                    scope.dimensions = {
                        height: element[0].clientHeight,
                        width: element[0].clientWidth
                    };
                }, 100)
            }
        };
    }]);
})();
