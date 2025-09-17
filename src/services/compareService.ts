const circle: HTMLElement | null = document.getElementById('circle');
const message: HTMLElement | null = document.getElementById('message');
let clickCount: number = 0;
const colors: string[] = ['rgb(9, 255, 0)', '#ffffffff', '#000000ff', '#1900ffff', '#f92487ff'];

const showMessage = (text: string): void => {
    if (message) {
        message.textContent = text;
        message.classList.add('show');
        setTimeout(() => message.classList.remove('show'), 1000);
    }
};

if (circle) {
    circle.addEventListener('click', () => {
        clickCount++;
        circle.classList.add('clicked');
        circle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        showMessage(`¡Click #${clickCount}! 🎉`);
        setTimeout(() => circle.classList.remove('clicked'), 1000);
    });

    circle.addEventListener('dblclick', () => {
        clickCount = 0;
        circle.style.backgroundColor = colors[0];
        showMessage('Reset! 🔄');
    });
}