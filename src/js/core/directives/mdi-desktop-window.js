(function(){
    'use strict';

    var module = angular.module('mdi.desktop.window', []);

    module.controller('mdiDesktopWindowController', ['$scope', '$element', '$document',
        function ($scope, $element, $document) {
            var self = this;

            self.top,
            self.left,
            self.right,
            self.bottom,
            self.height,
            self.width,
            self.x = $element[0].offsetLeft,
            self.y = $element[0].offsetTop,
            self.startX = 0,
            self.startY = 0;

            self.mouseMove = function(event) {
                $element.css({ opacity: 0.5 });
                self.x = event.screenX - self.startX
                self.y = event.screenY - self.startY
                $element.css({
                    top: self.y + 'px',
                    left:  self.x + 'px'
                });
            }

            self.mouseUp = function() {
                $element.css({ opacity: 1.0 });
                $document.unbind('mousemove', self.mouseMove);
                $document.unbind('mouseup', self.mouseUp);
            }

            $scope.maximized = false;

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
                if ($scope.maximized) {
                    $element.css({
                        top: self.top,
                        left: self.left,
                        right: self.right,
                        bottom: self.bottom,
                        height: self.height,
                        width: self.height
                    });

                    $scope.maximized = false;
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

                    $scope.maximized = true;
                }
            };

            $scope.close = function() {
                $scope.desktopCtrl.getWindows().splice($scope.index, 1);
            };

            $scope.setPosition = function(event) {
                if ($scope.maximized) return;
                event.preventDefault()
                self.startX = event.screenX - self.x
                self.startY = event.screenY - self.y
                $document.on('mousemove', self.mouseMove);
                $document.on('mouseup', self.mouseUp);
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
