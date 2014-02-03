(function(){
    'use strict';

    var module = angular.module('mdi.desktop.window', []);

    module.controller('mdiDesktopWindowController', ['$scope', '$element', '$document', '$window',
        function ($scope, $element, $document, $window) {
            var self = this;

            self.top,
                self.left,
                self.right,
                self.bottom,
                self.height,
                self.width;

            $scope.activate = function() {
                $scope.desktopCtrl.clearActive();
                $scope.window.active =  true;
                $scope.window.zIndex = $scope.desktopCtrl.getNextMaxZIndex();
            };

            $scope.minimize = function() {
                $scope.window.active = false;
                $scope.window.minimize = true;
            };

            $scope.maximize = function() {
                if ($scope.window.maximized) {
                    $element.css({
                        top: self.top,
                        left: self.left,
                        right: self.right,
                        bottom: self.bottom,
                        height: self.height,
                        width: self.width
                    });

                    $scope.window.maximized = false;
                } else {
                    self.top = $element.css('top');
                    self.left = $element.css('left');
                    self.right = $element.css('right');
                    self.bottom = $element.css('bottom');
                    self.height = $element.css('height');
                    self.width = $element.css('width');

                    $element.css({
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: '100%',
                        width: '100%'
                    });

                    $scope.window.maximized = true;
                }
            };

            $scope.close = function() {
                $scope.desktopCtrl.getWindows().splice($scope.index, 1);
            };

            function isElementInViewport (el) {
                var rect = el[0].getBoundingClientRect();

                console.log(rect.top, 'TOP');
                console.log(rect.left, ('LEFT'));

                return (
                    rect.top >= 0 &&
                        rect.left >= 0
                    );
            }
        }]);

    module.directive('mdiDesktopWindow', ['$log', '$document', '$animate', function($log, $document, $animate) {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'src/templates/mdi-desktop-window.html',
            require: ['^mdiDesktop', '^mdiDesktopViewport'],
            controller: 'mdiDesktopWindowController',
            scope: {
                index: '=',
                window: '='
            },
            link: function(scope, element, attrs, ctrls) {
                scope.desktopCtrl = ctrls[0];
                scope.viewportCtrl = ctrls[1];
            }
        };
    }]);
})();
