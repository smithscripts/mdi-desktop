(function(){
    'use strict';

    var module = angular.module('mdi.draggable', []);

    module.controller('mdiDraggableController', ['$scope', '$element', '$document', '$window',
        function ($scope, $element, $document, $window) {
            var self = this;

            self.windowElement = $element.parent().parent();

            self.x = self.windowElement[0].offsetLeft,
                self.y = self.windowElement[0].offsetTop,
                self.lastX = 0,
                self.lastY = 0,
                self.startX = 0,
                self.startY = 0,
                self.viewportDimensions = undefined;

            self.mouseMove = function(event) {
                self.windowElement.css({ opacity: 0.5 });
                self.x = event.screenX - self.startX
                self.y = event.screenY - self.startY

                self.viewportDimensions = $scope.viewportCtrl.getViewportDimensions();

                self.y = self.y >= 0 ? self.y : 0;
                self.y = self.y <= self.viewportDimensions.height - $element[0].offsetHeight ? self.y : self.viewportDimensions.height - $element[0].offsetHeight;

                self.x = self.x >= -($element[0].offsetWidth + $element[0].offsetLeft) ? self.x : -($element[0].offsetWidth + $element[0].offsetLeft);
                self.x = self.x <=  self.viewportDimensions.width - $element[0].offsetLeft ? self.x : self.viewportDimensions.width - $element[0].offsetLeft;

                self.windowElement.css({
                    top: self.y + 'px',
                    left:  self.x + 'px'
                });
            }

            self.mouseUp = function() {
                self.windowElement.css({ opacity: 1.0 });
                $document.unbind('mousemove', self.mouseMove);
                $document.unbind('mouseup', self.mouseUp);
            }

            $element.bind('mousedown', function (event) {
                if ($scope.window.maximized) return;
                event.preventDefault()
                self.startX = event.screenX - self.x
                self.startY = event.screenY - self.y
                $document.on('mousemove', self.mouseMove);
                $document.on('mouseup', self.mouseUp);
            });

            var win = angular.element($window);
            win.bind("resize",function(e){
                $scope.$apply(function() {
                    if (self.viewportDimensions === undefined) return

                    self.y = self.y <= self.viewportDimensions.height - $element[0].offsetHeight ? self.y : self.viewportDimensions.height - $element[0].offsetHeight;
                    self.x = self.x <=  self.viewportDimensions.width - $element[0].offsetLeft ? self.x : self.viewportDimensions.width - $element[0].offsetLeft;

                    self.y = self.y >= 0 ? self.y : 0;
                    self.x = self.x >= 0 ? self.x : 0;

                    self.windowElement.css({
                        top: self.y + 'px',
                        left:  self.x + 'px'
                    });
                })
            })
        }]);

    module.directive('mdiDraggable', ['$document', function($document) {
        return {
            restrict: 'A',
            replace: false,
            require: '?^mdiDesktopViewport',
            controller: 'mdiDraggableController',
            scope: {
                window: '='
            },
            link: function(scope, element, attrs, viewportCtrl) {
                scope.viewportCtrl = viewportCtrl;
            }
        };
    }]);
})();

