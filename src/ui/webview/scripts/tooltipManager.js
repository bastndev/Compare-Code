/**
 * Tooltip Manager
 * Manages tooltip behavior: hides tooltip on click and re-enables on mouse out/in cycle
 */

(function() {
    'use strict';

    /**
     * Initialize tooltip behavior for all elements with data-tooltip attribute
     */
    function initTooltips() {
        // Select all elements that have tooltips
        const tooltipElements = document.querySelectorAll('[data-tooltip]');

        tooltipElements.forEach(element => {
            // Handle click event
            element.addEventListener('click', function() {
                // Add class to disable tooltip
                this.classList.add('tooltip-disabled');
            });

            // Handle mouse leave event
            element.addEventListener('mouseleave', function() {
                // Remove the disabled class when mouse leaves
                // This allows the tooltip to show again on next hover
                this.classList.remove('tooltip-disabled');
            });
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTooltips);
    } else {
        // DOM is already ready
        initTooltips();
    }

    // Re-initialize tooltips when new elements are added dynamically
    // This is useful if buttons are added/removed dynamically
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        if (node.hasAttribute('data-tooltip')) {
                            initTooltipForElement(node);
                        }
                        // Check children
                        const childTooltips = node.querySelectorAll('[data-tooltip]');
                        childTooltips.forEach(initTooltipForElement);
                    }
                });
            }
        });
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    /**
     * Initialize tooltip for a single element
     * @param {HTMLElement} element - Element to initialize
     */
    function initTooltipForElement(element) {
        // Avoid adding duplicate listeners
        if (element.dataset.tooltipInitialized) {
            return;
        }

        element.addEventListener('click', function() {
            this.classList.add('tooltip-disabled');
        });

        element.addEventListener('mouseleave', function() {
            this.classList.remove('tooltip-disabled');
        });

        element.dataset.tooltipInitialized = 'true';
    }
})();
