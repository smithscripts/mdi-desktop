(function() {
    "use strict";
    describe('mdi-desktop window controller', function() {
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
            ctrl = element.controller('mdiDesktopWindow');
        }));

        describe('mdi-desktop-window', function() {
            it('should close window on click', function() {
                var menuItems = element.find('.menuItem');
                expect(windows().length).toBe(0);
                angular.element(menuItems[0]).triggerHandler('click');
                expect(windows().length).toBe(1);

                var buttons = element.find('.desktop-window-close-button');

                angular.element(buttons[0]).triggerHandler('click');
                expect(windows().length).toBe(0);
            });
        });

        describe('mdi-desktop-window', function() {
            it('should bring window to the front on mouse down', function() {
                var menuItems = element.find('.menuItem');
                expect(windows().length).toBe(0);
                angular.element(menuItems[0]).triggerHandler('click');
                angular.element(menuItems[0]).triggerHandler('click');
                expect(windows().length).toBe(2);

                $(windows()[0]).mousedown();

                var window1ZIndex = $(windows()[0]).css('z-index');
                var window2ZIndex = $(windows()[1]).css('z-index');
                expect(window1ZIndex).toBeGreaterThan(window2ZIndex);
            });
        });

        describe('mdi-desktop-window', function() {
            it('should make window active on mouse down', function() {
                var menuItems = element.find('.menuItem');
                expect(windows().length).toBe(0);
                angular.element(menuItems[0]).triggerHandler('click');
                angular.element(menuItems[0]).triggerHandler('click');
                expect(windows().length).toBe(2);

                $(windows()[0]).mousedown();

                expect(angular.element(windows()[0]).hasClass('active')).toBeTruthy();
                expect(angular.element(windows()[1]).hasClass('active')).toBeFalsy();
            });
        });
    });

})();
