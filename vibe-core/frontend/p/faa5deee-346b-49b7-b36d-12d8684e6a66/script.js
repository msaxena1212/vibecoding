document.addEventListener('alpine:init', () => {
    Alpine.data('app', () => ({
        init() {
            console.log('Alpine.js initialized');
        },
        scrollToSection(sectionId) {
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        },
        toggleVisibility(elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.classList.toggle('hidden');
            }
        }
    }));
});

// Optional: Add a smooth scrolling polyfill for older browsers
// (Not strictly necessary, but enhances compatibility)
// Source: https://github.com/iamdustan/smoothscroll
(function () {
    if (typeof window === 'undefined' || 'document' in window === false) {
        return;
    }

    // Prevent init twice
    if ('scrollBehavior' in document.documentElement.style) {
        return;
    }

    /**
     * Constants
     */
    var CSS_SMOOTH_SCROLL = 'scroll-behavior';
    var CSS_SMOOTH_SCROLL_POLYFILL = 'smoothscroll-polyfill';

    /**
     * Variables
     */
    var elementScroll = Element.prototype.scroll;
    var nativeSmoothScrollDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'scroll');

    /**
     * Utils
     */
    var getScrollableTarget = function (element) {
        var isBody = element === document.body;
        var isDocument = element === document.documentElement;

        if (isBody || isDocument) {
            return document.scrollingElement || document.documentElement;
        }

        return element;
    };

    var isVisible = function (element) {
        return element.offsetWidth > 0 && element.offsetHeight > 0;
    };

    /**
     * Polyfill
     */
    Element.prototype.scroll = function () {
        var _this = this;

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        if (args[0] === undefined) {
            return elementScroll.apply(this, args);
        }

        if (typeof args[0] === 'number') {
            return elementScroll.apply(this, args);
        }

        var arg = args[0] || {};

        if (typeof arg.behavior === 'undefined' || arg.behavior === 'auto' || arg.behavior === 'instant') {
            return elementScroll.apply(this, args);
        }

        arg.behavior = 'auto';

        if (this.nodeName === 'HTML') {
            elementScroll.call(window, arg);
        } else {
            elementScroll.call(this, arg);
        }
    };

    if (nativeSmoothScrollDescriptor) {
        Object.defineProperty(Element.prototype, 'scroll', nativeSmoothScrollDescriptor);
    }

    Element.prototype.scrollTo = Element.prototype.scroll;

    var elementScrollTo = Element.prototype.scrollTo;

    Element.prototype.scrollTo = function () {
        var _this2 = this;

        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        if (args[0] === undefined) {
            return elementScrollTo.apply(this, args);
        }

        if (typeof args[0] === 'number') {
            return elementScrollTo.apply(this, args);
        }

        var arg = args[0] || {};

        if (typeof arg.behavior === 'undefined' || arg.behavior === 'auto' || arg.behavior === 'instant') {
            return elementScrollTo.apply(this, args);
        }

        arg.behavior = 'auto';
        elementScrollTo.call(this, arg);
    };

    /**
     * Add CSS class to prevent init twice
     */
    document.documentElement.classList.add(CSS_SMOOTH_SCROLL_POLYFILL);
})();