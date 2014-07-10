(function(){
    'use strict';

    var module = angular.module('mdi.resizable', []);

    module.controller('mdiResizableController', ['$scope',
        function ($scope) {
            var self = this;
        }]);

    module.directive('mdiResizable', ['$document', function($document) {
        return {
            restrict: 'A',
            replace: false,
            scope: {
                window: '=',
                maximized: '=',
                direction: '@'
            },
            link: function(scope, element, attrs) {

                var currentHeight,
                    currentWidth,
                    currentTop,
                    currentLeft,
                    currentRight,
                    currentBottom,
                    currentMinHeight,
                    currentMinWidth,
                    mouseOffsetX = 0,
                    mouseOffsetY = 0,
                    lastMouseX = 0,
                    lastMouseY = 0,
                    originalHeight = 0,
                    originalWidth = 0;

                element.bind('mousedown', function(event) {
                    if (scope.maximized) return;
                    event.preventDefault();
                    mouseOffsetY = event.clientY;
                    mouseOffsetX = event.clientX;
                    originalHeight = parseInt(scope.window.height, 10);
                    originalWidth = parseInt(scope.window.width, 10);
                    $document.on('mousemove', mouseMove);
                    $document.on('mouseup', mouseUp);
                });

                var mouseMove = function(event) {
                    scope.$apply(function() {
                        var mouseY = event.pageY - mouseOffsetY;
                        var mouseX = event.pageX - mouseOffsetX;
                        var diffY = mouseY - lastMouseY;
                        var diffX = mouseX - lastMouseX;
                        lastMouseY = mouseY;
                        lastMouseX = mouseX;

                        currentHeight = parseInt(scope.window.height, 10);
                        currentWidth = parseInt(scope.window.width, 10);
                        currentTop = parseInt(scope.window.top, 10);
                        currentLeft = parseInt(scope.window.left, 10);
                        currentRight = parseInt(scope.window.right, 10);
                        currentBottom = parseInt(scope.window.bottom, 10);
                        currentMinHeight = parseInt(scope.window.minHeight, 10);
                        currentMinWidth = parseInt(scope.window.minWidth, 10);

                        if (scope.direction.indexOf("w") > -1) {
                            if (currentWidth - diffX < currentMinWidth) mouseOffsetX = mouseOffsetX - (diffX - (diffX = currentWidth - currentMinWidth));
                            //Contain resizing to the west
                            if (currentLeft + diffX < 0) mouseOffsetX = mouseOffsetX - (diffX - (diffX = 0 - currentLeft));
                            scope.window.left = (currentLeft + diffX) + 'px';
                            scope.window.width = (currentWidth - diffX) + 'px';
                        }
                        if (scope.direction.indexOf("n") > -1) {
                            if (currentHeight - diffY < currentMinHeight) mouseOffsetY = mouseOffsetY - (diffY - (diffY = currentHeight - currentMinHeight));
                            //Contain resizing to the north
                            if (currentTop + diffY < 0) mouseOffsetY = mouseOffsetY - (diffY - (diffY = 0 - currentTop));
                            scope.window.top = (currentTop + diffY) + 'px';
                            scope.window.height = (currentHeight - diffY) + 'px';
                        }
                        if (scope.direction.indexOf("e") > -1) {
                            if (currentWidth + diffX < currentMinWidth) mouseOffsetX = mouseOffsetX - (diffX - (diffX = currentMinWidth - currentWidth));
                            scope.window.width = (currentWidth + diffX) + 'px';
                        }
                        if (scope.direction.indexOf("s") > -1) {
                            if (currentHeight + diffY < currentMinHeight) mouseOffsetY = mouseOffsetY - (diffY - (diffY = currentMinHeight- currentHeight));
                            scope.window.height = (currentHeight + diffY) + 'px';
                        }
                    });
                }

                var mouseUp = function() {
                    mouseOffsetX = 0;
                    mouseOffsetY = 0;
                    lastMouseX = 0;
                    lastMouseY = 0;
                    $document.unbind('mousemove', mouseMove);
                    $document.unbind('mouseup', mouseUp);
                }
            }
        };
    }]);
})();
