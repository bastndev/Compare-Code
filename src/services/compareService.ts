// Function to update line numbers with improved synchronization
function updateLineNumbers(textareaId: string, lineNumbersId: string): void {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    const lineNumbers = document.getElementById(lineNumbersId) as HTMLElement;
    
    if (!textarea || !lineNumbers) {
        return;
    }
    
    function updateNumbers(): void {
        const text = textarea.value || textarea.placeholder || '';
        
        // Store current scroll position
        const currentScrollTop = textarea.scrollTop;
        
        // Better line counting - handle edge cases
        let lines = text.split('\n');
        
        // If text is empty, show at least 1 line
        if (text === '') {
            lines = [''];
        }
        
        // Handle trailing newlines properly
        if (text.endsWith('\n') && text !== '\n') {
            lines.push('');
        }
        
        const lineCount = lines.length;
        
        // Generate line numbers with proper formatting
        let numbersHTML = '';
        for (let i = 1; i <= lineCount; i++) {
            numbersHTML += i.toString();
            if (i < lineCount) {
                numbersHTML += '\n';
            }
        }
        
        lineNumbers.textContent = numbersHTML;
        
        // Ensure both line numbers and textarea have same line height and styling
        const textareaStyle = getComputedStyle(textarea);
        lineNumbers.style.lineHeight = textareaStyle.lineHeight;
        lineNumbers.style.fontSize = textareaStyle.fontSize;
        lineNumbers.style.fontFamily = textareaStyle.fontFamily;
        lineNumbers.style.paddingTop = textareaStyle.paddingTop;
        lineNumbers.style.paddingBottom = textareaStyle.paddingBottom;
        
        // Restore scroll position and sync
        textarea.scrollTop = currentScrollTop;
        lineNumbers.scrollTop = currentScrollTop;
    }
    
    function syncScroll(): void {
        // Direct scroll synchronization - much simpler and more reliable
        lineNumbers.scrollTop = textarea.scrollTop;
    }
    
    // Update on input with debouncing for performance
    let updateTimeout: NodeJS.Timeout;
    textarea.addEventListener('input', () => {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
            updateNumbers();
            syncScroll(); // Ensure sync after content change
        }, 10);
    });
    
    textarea.addEventListener('paste', () => {
        setTimeout(() => {
            updateNumbers();
            syncScroll();
        }, 50);
    });
    
    // Enhanced scroll synchronization - multiple events for better coverage
    textarea.addEventListener('scroll', syncScroll, { passive: true });
    textarea.addEventListener('wheel', () => {
        requestAnimationFrame(syncScroll);
    }, { passive: true });
    textarea.addEventListener('touchmove', () => {
        requestAnimationFrame(syncScroll);
    }, { passive: true });
    
    // Handle window resize to maintain sync
    window.addEventListener('resize', () => {
        setTimeout(() => {
            updateNumbers();
            syncScroll();
        }, 100);
    });
    
    // Initial update
    updateNumbers();
}

// Cross-editor synchronization for dual-scroll feature
function setupCrossEditorSync(): void {
    const leftEditor = document.getElementById('code-editor-left') as HTMLTextAreaElement;
    const rightEditor = document.getElementById('code-editor-right') as HTMLTextAreaElement;
    const leftLineNumbers = document.getElementById('line-numbers-left') as HTMLElement;
    const rightLineNumbers = document.getElementById('line-numbers-right') as HTMLElement;
    
    if (!leftEditor || !rightEditor || !leftLineNumbers || !rightLineNumbers) {
        return;
    }
    
    // Sync scroll between both editors (optional dual-scroll feature)
    let isScrolling = false;
    
    function syncEditorScroll(sourceEditor: HTMLTextAreaElement, targetEditor: HTMLTextAreaElement): void {
        if (isScrolling) {
            return;
        }
        isScrolling = true;
        
        const scrollRatio = sourceEditor.scrollTop / Math.max(1, sourceEditor.scrollHeight - sourceEditor.clientHeight);
        const targetMaxScroll = Math.max(0, targetEditor.scrollHeight - targetEditor.clientHeight);
        targetEditor.scrollTop = scrollRatio * targetMaxScroll;
        
        setTimeout(() => {
            isScrolling = false;
        }, 10);
    }
    
    // Add dual scroll listeners (can be toggled by UI button)
    leftEditor.addEventListener('scroll', () => {
        // Uncomment the next line to enable dual-scroll
        // syncEditorScroll(leftEditor, rightEditor);
    });
    
    rightEditor.addEventListener('scroll', () => {
        // Uncomment the next line to enable dual-scroll
        // syncEditorScroll(rightEditor, leftEditor);
    });
}

// Initialize line numbers for both editors after DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Use requestAnimationFrame for better timing
    requestAnimationFrame(() => {
        setTimeout(() => {
            updateLineNumbers('code-editor-left', 'line-numbers-left');
            updateLineNumbers('code-editor-right', 'line-numbers-right');
            setupCrossEditorSync();
            
            // Force initial sync after everything is set up
            const leftTextarea = document.getElementById('code-editor-left') as HTMLTextAreaElement;
            const rightTextarea = document.getElementById('code-editor-right') as HTMLTextAreaElement;
            const leftLineNumbers = document.getElementById('line-numbers-left') as HTMLElement;
            const rightLineNumbers = document.getElementById('line-numbers-right') as HTMLElement;
            
            if (leftTextarea && leftLineNumbers) {
                leftLineNumbers.scrollTop = leftTextarea.scrollTop;
            }
            if (rightTextarea && rightLineNumbers) {
                rightLineNumbers.scrollTop = rightTextarea.scrollTop;
            }
        }, 50);
    });
    
    // Clear functionality
    const clearButton = document.querySelector('.clear') as HTMLElement;
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            const editorLeft = document.getElementById('code-editor-left') as HTMLTextAreaElement;
            const editorRight = document.getElementById('code-editor-right') as HTMLTextAreaElement;
            
            if (editorLeft) {
                editorLeft.value = '';
                // Force update line numbers
                editorLeft.dispatchEvent(new Event('input'));
            }
            if (editorRight) {
                editorRight.value = '';
                // Force update line numbers
                editorRight.dispatchEvent(new Event('input'));
            }
        });
    }
});

export {};