(function(){
    'use strict';

    var module = angular.module('mdi.desktop.view', []);

    module.directive('mdiDesktopView', ['$compile', '$http', function($compile, $http) {
        return {
            restrict: 'A',
            replace: false,
            scope: {
                view: '='
            },
            link: function(scope, element, attrs) {
                if (!scope.view.viewName) return;
                var tpl = $compile('<div ' + scope.view.viewName + '></div>')(scope);
                element.append(tpl);
            }
        };
    }]);
})();
