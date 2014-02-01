(function() {
    "use strict";
    describe('mdi-desktop menubar controller', function() {
        var compile, scope, element, ctrl;

        function windows() {
            return element.find('div.desktop-window-container');
        }

        beforeEach(module('mdi.desktop'));

        beforeEach(inject(function ($rootScope, $templateCache, $compile) {
            $templateCache.put('src/templates/mdi-desktop.html', __html__['src/templates/mdi-desktop.html']);
            $templateCache.put('src/templates/mdi-desktop-menubar.html', __html__['src/templates/mdi-desktop-menubar.html']);
            $templateCache.put('src/templates/mdi-desktop-taskbar.html', __html__['src/templates/mdi-desktop-taskbar.html']);
            $templateCache.put('src/templates/mdi-desktop-viewport.html', __html__['src/templates/mdi-desktop-viewport.html']);
            $templateCache.put('src/templates/mdi-desktop-window.html', __html__['src/templates/mdi-desktop-window.html']);

            scope = $rootScope.$new();
            compile = $compile;

            var elm = angular.element('<div mdi-desktop></div>');
            element = compile(elm)(scope);
            scope.$digest();
            ctrl = element.controller('mdiDesktopMenubar');
        }));

        describe('mdi-desktop-menubar', function() {
            it('should open window on click', function() {
                var menuItems = element.find('.menuItem');
                expect(windows().length).toBe(0);
                angular.element(menuItems[0]).triggerHandler('click');
                expect(windows().length).toBe(1);
            });
        });

        describe('mdi-desktop-menubar', function() {
            it('should apply active class to the newest window on click', function() {
                var menuItems = element.find('.menuItem');
                expect(windows().length).toBe(0);
                angular.element(menuItems[0]).triggerHandler('click');
                angular.element(menuItems[0]).triggerHandler('click');
                expect(windows().length).toBe(2);

                var activeWindows = element.find('.active-window');
                expect(activeWindows.length).toBe(1);
            });
        });
    });

})();