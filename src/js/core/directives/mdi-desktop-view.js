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
                if (!scope.view.viewDirective) return;
                var tpl = $compile('<div ' + scope.view.viewDirective + ' view="view"></div>')(scope);
                element.append(tpl);
            }
        };
    }]);
})();
