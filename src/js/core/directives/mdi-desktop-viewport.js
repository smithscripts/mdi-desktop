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

            $scope.dimensions = {};
            $scope.showLeftOutline = false;
            $scope.showRightOutline = false;
            $scope.displayViewportDimensions = false;
            $scope.logoUrl = undefined;

            $scope.viewportMouseDown = function (event) {
                //Ignore resize events.
                if (event.target.nodeName.toLowerCase() === 'span') return;

                $document.on('mousemove', self.mouseMove);
                $document.on('mouseup', self.mouseUp);
            };

            /**
             * @mdi.doc $watch function
             * @name mdiDesktopViewportController.visibilityWatch
             * @module mdi.desktop.viewport
             * @function
             *
             * @description
             * Monitors for visibility changes. This method is responsible for updating the viewport
             * dimensions in situations where the viewport is initially hidden.
             *
             */
            $scope.$watch(function () {
                //Emulates jQuery's $(element).is(':visible')
                return $element[0].offsetWidth > 0 && $element[0].offsetHeight > 0;
            }, function (newValue, oldValue) {
                $scope.dimensions = {
                    height: $element[0].clientHeight,
                    width: $element[0].clientWidth
                };
            });

            /**
             * @mdi.doc window.resize
             * @name mdiDesktopViewportController.resize
             * @module mdi.desktop.viewport
             * @function
             *
             * @description
             * This method is responsible for updating the viewport dimensions when the
             * browser window has been re-sized.
             *
             */
            angular.element($window).bind('resize', function () {
                $scope.$apply(function () {
                    $scope.dimensions = {
                        height: $element[0].clientHeight,
                        width: $element[0].clientWidth
                    };
                });
            });

            $scope.init = function() {
                $scope.displayViewportDimensions = $scope.options.displayViewportDimensions;
                $scope.logoUrl = $scope.options.logoUrl;
            }
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
                scope.init();
            }
        };
    }]);
})();
