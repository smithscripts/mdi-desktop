(function(){
    'use strict';

    var module = angular.module('mdi.desktop.view', []);

    module.directive('mdiDesktopView', ['$compile', '$http', function($compile, $http) {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                view: '='
            },
            link: function(scope, element, attrs) {
                if (!scope.view.directiveName) return;
                var tpl = $compile('<div ' + scope.view.directiveName + '></div>')(scope);
                element.append(tpl);
            }
        };
    }]);
})();
