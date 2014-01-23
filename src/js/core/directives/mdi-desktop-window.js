(function(){
    'use strict';

    var module = angular.module('mdi.desktop.window', []);

    module.controller('mdiDesktopWindowController', ['$scope',
        function ($scope) {

        }]);

    module.directive('mdiDesktopWindow', ['$log', '$document', function($log, $document) {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'src/templates/mdi-desktop-window.html',
            require: '?^mdiDesktop',
            controller: 'mdiDesktopWindowController',
            scope: {
                windowId: '=',
                windowTitle: '='
            }
        };
    }]);
})();
