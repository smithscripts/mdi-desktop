(function() {
    "use strict";
    describe('mdi-desktop window controller', function() {
        var compile, windowScope, element, desktopCtrl, windowCtrl;

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

        beforeEach(inject(function ($rootScope, $templateCache, $compile, $controller, $document, $window, $animate) {
            $templateCache.put('src/templates/mdi-desktop-window.html', __html__['src/templates/mdi-desktop-window.html']);
            windowScope = $rootScope.$new();
            compile = $compile;
            var elm = $templateCache.get('src/templates/mdi-desktop-window.html');
            element = compile(elm)(windowScope);

            windowScope.window = { views: [{ active: true }] };

            windowCtrl = $controller('mdiDesktopWindowController', {'$scope': windowScope, '$element': element, '$document': $document, '$window': $window});
            windowScope.desktopCtrl = {};

            windowScope.$digest();
        }));

        describe('minimize button behavior', function() {
            it('should visually hide window', function() {

            });
        });

        describe('mdi-desktop-window', function() {
            it('previous and next buttons should be disabled when no views are loaded', function() {
                element.appendTo(document.body);
                var previousButton =  angular.element(getElement('button', 0));
                var nextButton =  angular.element(getElement('button', 1));

                windowScope.desktopCtrl.getActiveView = function() { return { isEditing: true }};

                expect(previousButton[0]).toHaveAttr('disabled', 'disabled');
                expect(nextButton[0]).toHaveAttr('disabled', 'disabled');
            });

            it('previous and next buttons should be disabled when one view is loaded', function() {
                element.appendTo(document.body);
                var previousButton =  angular.element(getElement('button', 0));
                var nextButton =  angular.element(getElement('button', 1));

                windowCtrl.updateNavigationState();
                windowScope.$digest();

                expect(previousButton[0]).toHaveAttr('disabled', 'disabled');
                expect(nextButton[0]).toHaveAttr('disabled', 'disabled');
            });

            it('previous button should be disabled and next should be enabled when two view are loaded and the first window is active', function() {
                element.appendTo(document.body);

                var previousButton =  angular.element(getElement('button', 0));
                var nextButton =  angular.element(getElement('button', 1));

                windowScope.window = { views: [{ active: true },  { active: false }] };

                windowCtrl.updateNavigationState();
                windowScope.$digest();

                expect(previousButton[0]).toHaveAttr('disabled', 'disabled');
                expect(nextButton[0]).not.toHaveAttr('disabled', 'disabled');
            });

            it('previous button should be enabled and next should be disabled when two view are loaded and the second window is active', function() {
                element.appendTo(document.body);
                var previousButton =  angular.element(getElement('button', 0));
                var nextButton =  angular.element(getElement('button', 1));

                windowScope.window = { views: [{ active: false },  { active: true }] };
                windowCtrl.updateNavigationState();
                windowScope.$digest();

                expect(previousButton[0]).not.toHaveAttr('disabled', 'disabled');
                expect(nextButton[0]).toHaveAttr('disabled', 'disabled');
            });

//            it('when view one is active and next button is clicked view two should become active', function() {
//                element.appendTo(document.body);
//                var previousButton =  angular.element(getElement('button', 0));
//                var nextButton =  angular.element(getElement('button', 1));
//
//                windowScope.window = { views: [{ active: true },  { active: false }] };
//                windowCtrl.updateNavigationState();
//                windowScope.$digest();
//
//                expect(previousButton[0]).toHaveAttr('disabled', 'disabled');
//                expect(nextButton[0]).not.toHaveAttr('disabled', 'disabled');
//
//                nextButton.triggerHandler('click');
//
//                expect(previousButton[0]).not.toHaveAttr('disabled', 'disabled');
//                expect(nextButton[0]).toHaveAttr('disabled', 'disabled');
//            });

//            it('when view two is active and previous button is clicked view one should become active', function() {
//                element.appendTo(document.body);
//                var previousButton =  angular.element(getElement('button', 0));
//                var nextButton =  angular.element(getElement('button', 1));
//
//                windowScope.window = { views: [{ active: false },  { active: true }] };
//                windowCtrl.updateNavigationState();
//                windowScope.$digest();
//
//                expect(previousButton[0]).not.toHaveAttr('disabled', 'disabled');
//                expect(nextButton[0]).toHaveAttr('disabled', 'disabled');
//
//                previousButton.triggerHandler('click');
//
//                expect(previousButton[0]).toHaveAttr('disabled', 'disabled');
//                expect(nextButton[0]).not.toHaveAttr('disabled', 'disabled');
//            });

            it('outOfBounds should be true when window leaves the viewport boundaries', function() {
                element.appendTo(document.body);

                windowScope.window = {
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

                windowScope.viewportCtrl = {
                    getViewportDimensions: function() { return { height: 100, width: 100 }}
                };
                windowScope.desktopCtrl.activateForemostWindow = function() { return {}};
                windowCtrl.isWindowInViewport();
                expect(windowScope.window.outOfBounds).toBeTruthy();
            });

            it('outOfBounds should be false when window enters the viewport boundaries', function() {
                element.appendTo(document.body);

                windowScope.window = {
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

                windowScope.desktopCtrl.activateForemostWindow = function() { return {}};

                windowScope.viewportCtrl = {
                    getViewportDimensions: function() { return { height: 100, width: 100 }}
                };
                windowCtrl.isWindowInViewport();
                expect(windowScope.window.outOfBounds).toBeTruthy();

                windowScope.viewportCtrl = {
                    getViewportDimensions: function() { return { height: 1000, width: 1000 }}
                };

                windowCtrl.isWindowInViewport();
                expect(windowScope.window.outOfBounds).toBeFalsy();
            });

            describe('removeForwardViews', function() {

                it('should remove all view after the first active window', function() {
                    element.appendTo(document.body);

                    windowScope.window = {
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
                        views: [{ active: false }, { active: true }]
                    };

                    windowScope.desktopCtrl.getActiveView = function() { return windowScope.window.views[1] };
                    windowCtrl.removeForwardViews();
                    expect(windowScope.window.views.length).toBe(2);
                });

            });

            describe('addView', function() {

                it('deactivates currently active view', function() {
                    element.appendTo(document.body);

                    windowScope.window = {
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
                    windowScope.desktopCtrl = {
                        getActiveView: function () {
                            return windowScope.window.views[2]
                        },
                        getDesktop: function () {
                            return {viewConfig: viewConfig};
                        }
                    };
                    windowCtrl.addView({active: true});
                    expect(windowScope.window.views[2].active).toBeFalsy();
                });

                it('inserts a new active view at the end of the array', function() {
                    element.appendTo(document.body);

                    windowScope.window = {
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
                    windowScope.desktopCtrl = {
                        getActiveView: function () {
                            return windowScope.window.views[2]
                        },
                        getDesktop: function () {
                            return {viewConfig: viewConfig};
                        }
                    };
                    windowCtrl.addView({ active: true });
                    expect(windowScope.window.views.length).toBe(4);
                    expect(windowScope.window.views[3].active).toBeTruthy(3);
                });

            });
        });
    });

})();
