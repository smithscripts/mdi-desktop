(function(){
    'use strict';

    var module = angular.module('resizable', []);

    module.controller('resizableController', ['$scope',
        function ($scope) {
            var self = this;
        }]);

    module.directive('resizable', ['$document', '$timeout', function($document, $timeout) {
        return {
            restrict: 'A',
            replace: false,
            scope: {
                maximized: '=',
                direction: '@'
            },
            link: function(scope, element, attrs) {
                var window = angular.element(element.parent());

                var x,
                    y,
                    lastX,
                    lastY,
                    lastTop,
                    lastLeft,
                    currentHeight,
                    currentWidth,
                    currentTop,
                    currentLeft,
                    newTop,
                    newLeft,
                    newHeight,
                    newWidth;

                element.bind('mousedown', function(event) {
                    if (scope.maximized) return;
                    event.preventDefault()
                    lastX = event.pageX;
                    lastY = event.pageY
                    console.log(window)
                    currentHeight = window[0].offsetHeight;
                    currentWidth = window[0].offsetWidth;
                    currentTop = window[0].offsetTop;
                    currentLeft = window[0].offsetLeft;
                    $document.on('mousemove', mouseMove);
                    $document.on('mouseup', mouseUp);

                });

                var mouseMove = function(event) {
                    newHeight = currentHeight + (event.pageY - lastY);
                    newWidth = currentWidth + (event.pageX - lastX);
                    newTop = currentTop + ((event.pageY - lastY) * 0.9);
                    newLeft = currentLeft + ((event.pageX - lastX) * 0.9);

                    var newSize = calculateNewSize({
                        direction: scope.direction,
                        currHeight: currentHeight,
                        currWidth: currentWidth,
                        newHeight: newHeight,
                        newWidth: newWidth,
                        offsetX: (event.pageX - lastX),
                        offsetY: (event.pageY - lastY),
                        factor: 0.9
                    });

                    newHeight = newSize.height;
                    newWidth = newSize.width;

                    console.log(newHeight - currentHeight, 'Top')
                    switch(scope.direction)
                    {
                        case 'nw':
                            window.css({
                                height: newHeight + 'px',
                                width: newWidth + 'px',
                                left: newLeft + 'px'
                            });
                            break;
                        case 'ne':
                            window.css({
                                height: newHeight + 'px',
                                width: newWidth + 'px',
                                top: newTop + 'px'
                            });
                            break;
                        case 'sw':
                            window.css({
                                height: newHeight + 'px',
                                width: newWidth + 'px',
                                left: newLeft + 'px'
                            });
                            break;
                        case 'se':
                            window.css({
                                height: newHeight + 'px',
                                width: newWidth + 'px'
                            });
                            break;
                        case 'w':
                            window.css({
                                width: newWidth + 'px',
                                left: newLeft + 'px'
                            });
                            break;
                        case 'n':
                            window.css({
                                height: newHeight + 'px',
                                top: newTop + 'px'
                            });
                            break;
                        case 's':
                            window.css({
                                height: newHeight + 'px'
                            });
                            break;
                        case 'e':
                            window.css({
                                width: newWidth + 'px'
                            });
                            break;
                        default:

                    }

                    currentHeight = newSize.height;
                    currentWidth = newSize.width;
                    lastX = event.pageX;
                    lastY = event.pageY
                    currentTop = newTop;
                    currentLeft = newLeft;
                }

                var calculateNewSize = function(size) {
                    var newWidth;
                    var newHeight;

                    if (size.direction === 's' || size.direction === 'e' || size.direction === 'se') {
                        if (Math.abs(size.offsetX) > Math.abs(size.offsetY)) {
                            newWidth = size.currWidth + (size.offsetX * size.factor);
                            newHeight = newWidth * (size.currHeight / size.currWidth);
                        } else {
                            newHeight = size.currHeight + (size.offsetY * size.factor);
                            newWidth = newHeight * (size.currWidth / size.currHeight);
                        }
                    } else if (size.direction === 'n') {
                        if (Math.abs(size.offsetX) > Math.abs(size.offsetY)) {
                            newWidth = size.currWidth - (size.offsetX * size.factor);
                            newHeight = newWidth * (size.currHeight / size.currWidth);
                        } else {
                            newHeight = size.currHeight - (size.offsetY * size.factor);
                            newWidth = newHeight * (size.currWidth / size.currHeight);
                        }
                    } else if (size.direction === 'ne') {
                        if (Math.abs(size.offsetX) > Math.abs(size.offsetY)) {
                            newWidth = size.currWidth + (size.offsetX * size.factor);
                            newHeight = newWidth * (size.currHeight / size.currWidth);
                        } else {
                            newHeight = size.currHeight - (size.offsetY * size.factor);
                            newWidth = newHeight * (size.currWidth / size.currHeight);
                        }
                    } else if (size.direction === 'nw') {
                        if (Math.abs(size.offsetX) > Math.abs(size.offsetY)) {
                            newWidth = size.currWidth - (size.offsetX * size.factor);
                            newHeight = newWidth * (size.currHeight / size.currWidth);
                        } else {
                            newHeight = size.currHeight - (size.offsetY * size.factor);
                            newWidth = newHeight * (size.currWidth / size.currHeight);
                        }
                    } else if (size.direction === 'w') {
                        if (Math.abs(size.offsetX) > Math.abs(size.offsetY)) {
                            newWidth = size.currWidth - (size.offsetX * size.factor);
                            newHeight = newWidth * (size.currHeight / size.currWidth);
                        } else {
                            newHeight = size.currHeight - (size.offsetY * size.factor);
                            newWidth = newHeight * (size.currWidth / size.currHeight);
                        }
                    } else if (size.direction === 'sw') {
                        if (Math.abs(size.offsetX) > Math.abs(size.offsetY)) {
                            newWidth = size.currWidth - (size.offsetX * size.factor);
                            newHeight = newWidth * (size.currHeight / size.currWidth);
                        } else {
                            newHeight = size.currHeight + (size.offsetY * size.factor);
                            newWidth = newHeight * (size.currWidth / size.currHeight);
                        }
                    }

                    return {
                        "height": newHeight,
                        "width": newWidth
                    };
                }

                var mouseUp = function() {
                    $document.unbind('mousemove', mouseMove);
                    $document.unbind('mouseup', mouseUp);
                }
            }
        };
    }]);
})();
