// Function to update line numbers
function updateLineNumbers(textareaId: string, lineNumbersId: string): void {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    const lineNumbers = document.getElementById(lineNumbersId) as HTMLElement;
    
    if (!textarea || !lineNumbers) {
        return;
    }
    
    function updateNumbers(): void {
        const text = textarea.value || textarea.placeholder || '';
        const lines = text.split('\n');
        const lineCount = lines.length;
        
        let numbersHTML = '';
        for (let i = 1; i <= lineCount; i++) {
            numbersHTML += i + '\n';
        }
        
        lineNumbers.textContent = numbersHTML.trim();
    }
    
    // Update on input
    textarea.addEventListener('input', updateNumbers);
    textarea.addEventListener('paste', () => {
        setTimeout(updateNumbers, 0);
    });
    
    // Sync scroll
    textarea.addEventListener('scroll', () => {
        lineNumbers.scrollTop = textarea.scrollTop;
    });
    
    // Initial update
    updateNumbers();
}

// Initialize line numbers for both editors after DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        updateLineNumbers('codeEditor1', 'lineNumbers1');
        updateLineNumbers('codeEditor2', 'lineNumbers2');
    }, 100);
    
    // Clear functionality
    const clearButton = document.querySelector('.clear') as HTMLElement;
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            const editor1 = document.getElementById('codeEditor1') as HTMLTextAreaElement;
            const editor2 = document.getElementById('codeEditor2') as HTMLTextAreaElement;
            
            if (editor1) {
                editor1.value = '';
            }
            if (editor2) {
                editor2.value = '';
            }
            
            // Update line numbers after clearing
            updateLineNumbers('codeEditor1', 'lineNumbers1');
            updateLineNumbers('codeEditor2', 'lineNumbers2');
        });
    }
});

export {};