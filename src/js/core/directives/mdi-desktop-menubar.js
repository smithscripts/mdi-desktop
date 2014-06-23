(function(){
    'use strict';

    var module = angular.module('mdi.desktop.menubar', []);

    module.controller('mdiDesktopMenubarController', ['$scope',
        function ($scope) {
            var self = this;

            $scope.openWindow = function(event, windowOverrides) {
              $scope.desktopCtrl.openWindow(windowOverrides);
            };
        }]);

    module.directive('mdiDesktopMenubar', ['$compile', '$http', function($compile, $http) {
        return {
            restrict: 'A',
            replace: true,
            require: '?^mdiDesktop',
            scope: {},
            controller: 'mdiDesktopMenubarController',
            link: function(scope, element, attrs, desktopCtrl) {
                scope.desktopCtrl = desktopCtrl;
                scope.options = desktopCtrl.getOptions();

                attrs.$observe('templateUrl', function (url) {
                    $http.get(url, {cache: true}).then(function (response) {
                        var tpl = $compile(response.data)(scope);
                        element.append(tpl);
                    });
                });
            }
        };
    }]);
})();
