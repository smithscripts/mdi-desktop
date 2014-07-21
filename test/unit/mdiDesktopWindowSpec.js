(function() {
    "use strict";
    describe('mdi-desktop window controller', function() {
        var compile, scope, element, ctrl;

        var viewConfig = {
            active: true,
            entities: undefined,
            entityIndex: 0,
            isDirty: false,
            isEditing: false,
            isInvalid: false,
            viewDirective: undefined
        };

        function windows() {
            return element.find('div.desktop-window-container');
        }

        function getElement(type, index) {
            return element.find(type)[index];
        };

        beforeEach(module('mdi.desktop.window'));

        beforeEach(inject(function ($rootScope, $templateCache, $compile, $controller, $document, $window) {
            $templateCache.put('src/templates/mdi-desktop-window.html', __html__['src/templates/mdi-desktop-window.html']);
            scope = $rootScope.$new();
            compile = $compile;
            var elm = $templateCache.get('src/templates/mdi-desktop-window.html')
            element = compile(elm)(scope);

            scope.window = { views: [{ active: true }] };

            ctrl = $controller('mdiDesktopWindowController', {'$scope': scope, '$element': element, '$document': $document, '$window': $window});
            scope.$digest();
        }));

        describe('mdi-desktop-window', function() {
            it('previous and next buttons should be disabled when no views are loaded', function() {
                element.appendTo(document.body);
                var previousButton =  angular.element(getElement('button', 0));
                var nextButton =  angular.element(getElement('button', 1));
                expect(previousButton[0]).toHaveAttr('disabled', 'disabled');
                expect(nextButton[0]).toHaveAttr('disabled', 'disabled');
            });

            it('previous and next buttons should be disabled when one view is loaded', function() {
                element.appendTo(document.body);
                var previousButton =  angular.element(getElement('button', 0));
                var nextButton =  angular.element(getElement('button', 1));

                ctrl.updateNavigationState();
                scope.$digest();

                expect(previousButton[0]).toHaveAttr('disabled', 'disabled');
                expect(nextButton[0]).toHaveAttr('disabled', 'disabled');
            });

            it('previous button should be disabled and next should be enabled when two view are loaded and the first window is active', function() {
                element.appendTo(document.body);

                var previousButton =  angular.element(getElement('button', 0));
                var nextButton =  angular.element(getElement('button', 1));

                scope.window = { views: [{ active: true },  { active: false }] };

                ctrl.updateNavigationState();
                scope.$digest();

                expect(previousButton[0]).toHaveAttr('disabled', 'disabled');
                expect(nextButton[0]).not.toHaveAttr('disabled', 'disabled');
            });

            it('previous button should be enabled and next should be disabled when two view are loaded and the second window is active', function() {
                element.appendTo(document.body);
                var previousButton =  angular.element(getElement('button', 0));
                var nextButton =  angular.element(getElement('button', 1));

                scope.window = { views: [{ active: false },  { active: true }] };
                ctrl.updateNavigationState();
                scope.$digest();

                expect(previousButton[0]).not.toHaveAttr('disabled', 'disabled');
                expect(nextButton[0]).toHaveAttr('disabled', 'disabled');
            });

            it('when view one is active and next button is clicked view two should become active', function() {
                element.appendTo(document.body);
                var previousButton =  angular.element(getElement('button', 0));
                var nextButton =  angular.element(getElement('button', 1));

                scope.window = { views: [{ active: true },  { active: false }] };
                ctrl.updateNavigationState();
                scope.$digest();

                expect(previousButton[0]).toHaveAttr('disabled', 'disabled');
                expect(nextButton[0]).not.toHaveAttr('disabled', 'disabled');

                nextButton.triggerHandler('click');

                expect(previousButton[0]).not.toHaveAttr('disabled', 'disabled');
                expect(nextButton[0]).toHaveAttr('disabled', 'disabled');
            });

            it('when view two is active and previous button is clicked view one should become active', function() {
                element.appendTo(document.body);
                var previousButton =  angular.element(getElement('button', 0));
                var nextButton =  angular.element(getElement('button', 1));

                scope.window = { views: [{ active: false },  { active: true }] };
                ctrl.updateNavigationState();
                scope.$digest();

                expect(previousButton[0]).not.toHaveAttr('disabled', 'disabled');
                expect(nextButton[0]).toHaveAttr('disabled', 'disabled');

                previousButton.triggerHandler('click');

                expect(previousButton[0]).toHaveAttr('disabled', 'disabled');
                expect(nextButton[0]).not.toHaveAttr('disabled', 'disabled');
            });

            it('getActiveWindow returns the active window', function() {
                element.appendTo(document.body);

                scope.window = { views: [{ active: false },  { active: true }] };
                ctrl.updateNavigationState();
                scope.$digest();

                var activeView = ctrl.getActiveView();

                expect(scope.window.views.indexOf(activeView)).toBe(1);
            });

            it('outOfBounds should be true when window leaves the viewport boundaries', function() {
                element.appendTo(document.body);

                scope.window = {
                    title: '',
                    active: true,
                    minimized: false,
                    maximized: false,
                    outOfBounds: false,
                    split: null,
                    top: 0,
                    left: 0,
                    right: 'auto',
                    bottom: 'auto',
                    height: '400px',
                    width: '400px',
                    minHeight: '200px',
                    minWidth: '200px',
                    zIndex: -1,
                    isDirty: false,
                    isInvalid: false,
                    views: [{ active: false },  { active: true }]
                };

                scope.viewportCtrl = {
                    getViewportDimensions: function() { return { height: 100, width: 100 }}
                };
                ctrl.isWindowInViewport();
                expect(scope.window.outOfBounds).toBeTruthy();
                expect(scope.window.active).toBeFalsy();
            });

            it('outOfBounds should be false when window enters the viewport boundaries', function() {
                element.appendTo(document.body);

                scope.window = {
                    title: '',
                    active: true,
                    minimized: false,
                    maximized: false,
                    outOfBounds: false,
                    split: null,
                    top: 0,
                    left: 0,
                    right: 'auto',
                    bottom: 'auto',
                    height: '400px',
                    width: '400px',
                    minHeight: '200px',
                    minWidth: '200px',
                    zIndex: -1,
                    isDirty: false,
                    isInvalid: false,
                    views: [{ active: false },  { active: true }]
                };

                scope.viewportCtrl = {
                    getViewportDimensions: function() { return { height: 100, width: 100 }}
                };
                ctrl.isWindowInViewport();
                expect(scope.window.outOfBounds).toBeTruthy();

                scope.viewportCtrl = {
                    getViewportDimensions: function() { return { height: 1000, width: 1000 }}
                };
                ctrl.isWindowInViewport();
                expect(scope.window.outOfBounds).toBeFalsy();
            });

            describe('removeForwardViews', function() {

                it('should remove all view after the first active window', function() {
                    element.appendTo(document.body);

                    scope.window = {
                        title: '',
                        active: true,
                        minimized: false,
                        maximized: false,
                        outOfBounds: false,
                        split: null,
                        top: 0,
                        left: 0,
                        right: 'auto',
                        bottom: 'auto',
                        height: '400px',
                        width: '400px',
                        minHeight: '200px',
                        minWidth: '200px',
                        zIndex: -1,
                        isDirty: false,
                        isInvalid: false,
                        views: [{ active: false }, { active: true }, { active: false }, { active: false }]
                    };
                    ctrl.removeForwardViews();
                    expect(scope.window.views.length).toBe(2);
                });

            });

            describe('addView', function() {

                iit('deactivates currently active view', function() {
                    element.appendTo(document.body);

                    scope.window = {
                        title: '',
                        active: true,
                        minimized: false,
                        maximized: false,
                        outOfBounds: false,
                        split: null,
                        top: 0,
                        left: 0,
                        right: 'auto',
                        bottom: 'auto',
                        height: '400px',
                        width: '400px',
                        minHeight: '200px',
                        minWidth: '200px',
                        zIndex: -1,
                        isDirty: false,
                        isInvalid: false,
                        views: [{ active: false }, { active: false }, {active: true}]
                    };
                    scope.desktopCtrl = {
                        getActiveView: function () {
                            return scope.window.views[2]
                        },
                        getDesktop: function () {
                            return {viewConfig: viewConfig};
                        }
                    };
                    ctrl.addView({active: true});
                    expect(scope.window.views[2].active).toBeFalsy();
                });

                iit('inserts a new active view at the end of the array', function() {
                    element.appendTo(document.body);

                    scope.window = {
                        title: '',
                        active: true,
                        minimized: false,
                        maximized: false,
                        outOfBounds: false,
                        split: null,
                        top: 0,
                        left: 0,
                        right: 'auto',
                        bottom: 'auto',
                        height: '400px',
                        width: '400px',
                        minHeight: '200px',
                        minWidth: '200px',
                        zIndex: -1,
                        isDirty: false,
                        isInvalid: false,
                        views: [{ active: false }, { active: false }, { active: false }, { active: true }]
                    };
                    scope.desktopCtrl = {
                        getActiveView: function () {
                            return scope.window.views[2]
                        },
                        getDesktop: function () {
                            return {viewConfig: viewConfig};
                        }
                    };
                    ctrl.addView({ active: true });
                    expect(scope.window.views.length).toBe(4);
                    expect(scope.window.views[3].active).toBeTruthy(3);
                });

            });
        });
    });

})();
