// Versión súper simplificada - solo lo esencial
function updateLineNumbers(textareaId: string, lineNumbersId: string): void {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    const lineNumbers = document.getElementById(lineNumbersId) as HTMLElement;
    
    if (!textarea || !lineNumbers) {
        return;
    }
    
    function update(): void {
        const text = textarea.value || textarea.placeholder || '';
        const lines = text.split('\n').length;
        lineNumbers.textContent = Array.from({length: lines}, (_, i) => i + 1).join('\n');
        lineNumbers.scrollTop = textarea.scrollTop;
    }
    
    textarea.addEventListener('input', update);
    textarea.addEventListener('scroll', () => lineNumbers.scrollTop = textarea.scrollTop);
    
    update(); // Initial
}

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
    updateLineNumbers('code-editor-left', 'line-numbers-left');
    updateLineNumbers('code-editor-right', 'line-numbers-right');
    
    // Botón limpiar (opcional)
    const clearBtn = document.querySelector('.clear') as HTMLElement;
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            ['code-editor-left', 'code-editor-right'].forEach(id => {
                const editor = document.getElementById(id) as HTMLTextAreaElement;
                if (editor) {
                    editor.value = '';
                    editor.dispatchEvent(new Event('input'));
                }
            });
        });
    }
});

export {};