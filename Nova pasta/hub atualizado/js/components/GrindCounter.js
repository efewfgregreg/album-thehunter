// Arquivo: js/components/GrindCounter.js

/**
 * Cria um contador de grind individual (ex: Diamantes, Abates).
 * @param {Object} params
 * @param {string} params.label - Nome do contador (ex: "Diamantes").
 * @param {string} params.icon - Caminho do ícone.
 * @param {number|string} params.value - Valor atual.
 * @param {string} params.type - Classe CSS para estilo (ex: "diamond", "total-kills").
 * @param {boolean} params.isInput - Se deve mostrar um campo de texto ou apenas número.
 * @param {Function} params.onIncrease - Função ao clicar no (+).
 * @param {Function} params.onDecrease - Função ao clicar no (-).
 * @param {Function} [params.onInput] - Função ao digitar (só para Total de Abates).
 */
export function createGrindCounter({ label, icon, value, type, isInput = false, onIncrease, onDecrease, onInput }) {
    const div = document.createElement('div');
    div.className = `grind-counter-item ${type}`;
    
    // Cria o cabeçalho
    const header = document.createElement('div');
    header.className = 'grind-counter-header';
    header.innerHTML = `<img src="${icon}" class="custom-icon" alt="${label}"><span>${label}</span>`;
    
    // Cria o corpo (botões e valor)
    const body = document.createElement('div');
    body.className = 'grind-counter-body';

    const btnDec = document.createElement('button');
    btnDec.className = 'grind-counter-btn decrease';
    btnDec.innerHTML = '<i class="fas fa-minus"></i>';
    btnDec.onclick = (e) => { e.stopPropagation(); onDecrease(); };

    const btnInc = document.createElement('button');
    btnInc.className = 'grind-counter-btn increase';
    btnInc.innerHTML = '<i class="fas fa-plus"></i>';
    btnInc.onclick = (e) => { e.stopPropagation(); onIncrease(); };

    body.appendChild(btnDec);

    if (isInput) {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'grind-total-input';
        input.value = value;
        // Salva ao sair do campo ou apertar enter
        const handleInput = (e) => onInput && onInput(e.target.value);
        input.onchange = handleInput;
        input.onblur = handleInput;
        body.appendChild(input);
    } else {
        const span = document.createElement('span');
        span.className = 'grind-counter-value';
        span.textContent = value;
        body.appendChild(span);
    }

    body.appendChild(btnInc);

    div.appendChild(header);
    div.appendChild(body);
    
    return div;
}