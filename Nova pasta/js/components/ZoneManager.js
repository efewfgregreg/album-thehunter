import { showCustomAlert } from '../auth.js'; 
import { items, reservesData } from '../../data/gameData.js'; 
import { slugify } from '../utils.js';

// --- ESTADOS GLOBAIS ---
let mapState = { scale: 1, panning: false, pointX: 0, pointY: 0, startX: 0, startY: 0 };
let dragState = { isDragging: false, type: null, index: null, startX: 0, startY: 0 };

// Seleção
let selectedPinIndex = null; 
let selectedTextIndex = null;
let selectedShapeIndex = null;

// Ferramenta Ativa
let activeToolMode = 'pan'; 

export function setActiveToolMode(mode) {
    activeToolMode = mode;
    selectedPinIndex = null; selectedTextIndex = null; selectedShapeIndex = null;
}

export function renderZoneManager(container, session, isOpen, onUpdate, customMapUrl = null, onPinSelect = null, onTextSelect = null, onShapeSelect = null) {
    if (!session) return;
    if (!session.zones) session.zones = [];
    if (!session.texts) session.texts = [];
    if (!session.shapes) session.shapes = []; 

    // 1. PREPARAÇÃO
    const reserveObj = reservesData[session.reserveKey];
    const formatFilename = (text) => text ? text.toLowerCase().replace(/[\s-]/g, '_') : '';
    const reserveName = reserveObj ? reserveObj.name : session.reserveKey;
    const reserveFilePart = formatFilename(reserveName);
    const mapSrc = customMapUrl ? customMapUrl : `mapas/${reserveFilePart}_mapa.jpg`;

    // 2. ESTRUTURA HTML (CORRIGIDA: Camadas organizadas para permitir clique e ancoragem fixa)
    container.innerHTML = `
        <div class="tactical-map-wrapper" id="zm-wrapper">
            <div class="zm-map-container" id="zm-map-container" style="overflow: hidden; position: relative; width: 100%; height: 100%; cursor: grab;">
                <div class="zm-map-content" id="zm-map-content" style="position: absolute; top: 0; left: 0; transform-origin: 0 0; display: block; width: fit-content; height: fit-content;">
                    <img src="${mapSrc}" class="zm-map-img" id="zm-map-img" draggable="false" style="display: block; max-width: none;">
                    
                    <svg class="zm-draw-layer" id="zm-draw-layer" viewBox="0 0 100 100" preserveAspectRatio="none" 
                         style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 50;"></svg>
                    
                    <div class="zm-pins-layer" id="zm-pins-layer" 
                         style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 100;"></div>
                    
                    <div class="zm-text-layer" id="zm-text-layer" 
                         style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 150;"></div>
                </div>
            </div>
            <div class="zm-tooltip" id="zm-tooltip"></div>
            <div class="map-zoom-controls" style="z-index: 500;">
                <button class="zoom-btn" id="btn-zoom-in"><i class="fas fa-plus"></i></button>
                <button class="zoom-btn" id="btn-zoom-out"><i class="fas fa-minus"></i></button>
            </div>
        </div>
    `;

    const wrapper = container.querySelector('#zm-wrapper');
    const mapContainer = wrapper.querySelector('#zm-map-container');
    const mapContent = wrapper.querySelector('#zm-map-content');
    const imgElement = wrapper.querySelector('#zm-map-img');
    const pinsLayer = wrapper.querySelector('#zm-pins-layer');
    const textLayer = wrapper.querySelector('#zm-text-layer');
    const shapesLayer = wrapper.querySelector('#zm-draw-layer');

   // --- RENDERIZAÇÃO DE PINOS ---
    const renderPins = () => {
        pinsLayer.innerHTML = '';
        session.zones.forEach((zone, index) => {
            const zType = zone.type || 'drink';
            const zPrio = zone.priority || 'main';
            const scale = parseFloat(zone.scale) || 1.0;

            const pin = document.createElement('div');
            pin.className = `zm-pin type-${zType} prio-${zPrio}`; 
            if (index === selectedPinIndex) pin.classList.add('selected');
            
            // Estilos Críticos para Funcionamento
            pin.style.position = 'absolute';
            pin.style.left = `${zone.x}%`; 
            pin.style.top = `${zone.y}%`;
            pin.style.pointerEvents = 'auto'; // Garante que o pino receba o clique
            pin.style.setProperty('--pin-scale', scale);

            const iconClass = zType === 'feed' ? 'fa-leaf' : (zType === 'rest' ? 'fa-bed' : 'fa-tint');
            const typeLabel = zType === 'drink' ? 'Zona de Bebida' : (zType === 'feed' ? 'Comida' : 'Descanso');
            const prioLabel = zPrio === 'main' ? 'Principal' : 'Secundária';
            const herdLabel = zone.herdType === 'solo' ? 'Solo' : (zone.herdType === 'casal' ? 'Casal' : 'Rebanho');

            pin.innerHTML = `
                <div class="pin-head"><i class="fas ${iconClass}"></i></div>
                <div class="zm-pin-label">${zone.name || ''}</div>
                <div class="pin-info">
                    <div class="pi-header">
                        <span class="pi-type">${typeLabel}</span>
                        <span class="pi-badge ${zPrio}">${prioLabel}</span>
                    </div>
                    <div class="pi-body">
                        <div style="font-size:0.8rem; color:#ccc; display:flex; justify-content:space-between;">
                            <span>${herdLabel}</span>
                            ${zone.time ? `<span style="color:#ffd700;">${zone.time}</span>` : ''}
                        </div>
                        <div class="pi-stats-grid">
                            <div class="pi-stat-box male"><i class="fas fa-mars"></i> ${zone.males||0}</div>
                            <div class="pi-stat-box female"><i class="fas fa-venus"></i> ${zone.females||0}</div>
                        </div>
                    </div>
                </div>
            `;

            pin.addEventListener('mousedown', (e) => {
                e.stopPropagation(); 
                selectedTextIndex = null; selectedShapeIndex = null; selectedPinIndex = index;
                renderTexts(); renderShapes(); renderPins();
                dragState.isDragging = true; dragState.type = 'pin'; dragState.index = index;
                if (typeof onPinSelect === 'function') onPinSelect(index, session.zones[index]);
            });

            pinsLayer.appendChild(pin);
        });
    };

    // --- RENDERIZAÇÃO DE FORMAS ---
    const renderShapes = () => {
        shapesLayer.innerHTML = '';
        session.shapes.forEach((shape, index) => {
            if (shape.x === undefined || shape.y === undefined) return;

            let svgElement;
            const color = shape.color || '#ffa500';
            const size = (parseFloat(shape.scale) || 3) * 1.5; 
            const thickness = parseFloat(shape.strokeWidth) || 0.2; 

            if (shape.type === 'circle') {
                svgElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                svgElement.setAttribute("cx", shape.x); svgElement.setAttribute("cy", shape.y); svgElement.setAttribute("r", size / 2);
            } 
            else if (shape.type === 'square') {
                svgElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                svgElement.setAttribute("x", shape.x - size / 2); svgElement.setAttribute("y", shape.y - size / 2);
                svgElement.setAttribute("width", size); svgElement.setAttribute("height", size);
            }
            else if (shape.type === 'triangle') {
                svgElement = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                const h = size * (Math.sqrt(3)/2);
                const p1 = `${shape.x},${shape.y - h/2}`; const p2 = `${shape.x - size/2},${shape.y + h/2}`; const p3 = `${shape.x + size/2},${shape.y + h/2}`;
                svgElement.setAttribute("points", `${p1} ${p2} ${p3}`);
            }
            else if (shape.type === 'x') {
                svgElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
                const s2 = size / 2;
                const d = `M ${shape.x - s2} ${shape.y - s2} L ${shape.x + s2} ${shape.y + s2} M ${shape.x - s2} ${shape.y + s2} L ${shape.x + s2} ${shape.y - s2}`;
                svgElement.setAttribute("d", d);
            }

            svgElement.setAttribute("fill", "none"); 
            svgElement.setAttribute("stroke", color);
            svgElement.setAttribute("stroke-width", thickness);
            svgElement.setAttribute("class", "zm-shape");
            svgElement.style.pointerEvents = 'auto'; // Permite arrastar a forma

            if (index === selectedShapeIndex) svgElement.classList.add("selected");

            svgElement.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                selectedPinIndex = null; selectedTextIndex = null; selectedShapeIndex = index;
                renderPins(); renderTexts(); renderShapes();
                dragState.isDragging = true; dragState.type = 'shape'; dragState.index = index;
                if (typeof onShapeSelect === 'function') onShapeSelect(index, session.shapes[index]);
            });
            shapesLayer.appendChild(svgElement);
        });
    };

    // --- RENDERIZAÇÃO DE TEXTOS ---
    const renderTexts = () => {
        textLayer.innerHTML = '';
        session.texts.forEach((txt, index) => {
            const el = document.createElement('div');
            el.className = 'zm-text-element';
            if (index === selectedTextIndex) el.classList.add('selected');
            el.textContent = txt.content || 'Novo Texto';
            el.style.position = 'absolute';
            el.style.left = `${txt.x}%`; el.style.top = `${txt.y}%`;
            el.style.color = txt.color || '#ffffff'; el.style.fontSize = `${txt.fontSize || 16}px`;
            el.style.pointerEvents = 'auto'; // Permite arrastar o texto

            el.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                selectedPinIndex = null; selectedShapeIndex = null; selectedTextIndex = index;
                renderPins(); renderShapes(); renderTexts();
                dragState.isDragging = true; dragState.type = 'text'; dragState.index = index;
                if (typeof onTextSelect === 'function') onTextSelect(index, session.texts[index]);
            });
            textLayer.appendChild(el);
        });
    };

    // --- LISTENERS DE MOUSE E ZOOM ---
    const updateTransform = () => { mapContent.style.transform = `translate(${mapState.pointX}px, ${mapState.pointY}px) scale(${mapState.scale})`; };

    mapContainer.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        if (!e.target.closest('.zm-pin') && !e.target.closest('.zm-text-element') && !e.target.closest('.zm-shape')) {
            mapState.panning = true; 
            mapState.startX = e.clientX - mapState.pointX; 
            mapState.startY = e.clientY - mapState.pointY; 
            mapContainer.style.cursor = 'grabbing';
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (mapState.panning) {
            mapState.pointX = e.clientX - mapState.startX; 
            mapState.pointY = e.clientY - mapState.startY; 
            updateTransform();
        }
        if (dragState.isDragging && dragState.index !== null) {
            e.preventDefault();
            const rect = mapContent.getBoundingClientRect();
            // Cálculo preciso independente do Zoom
            let x = ((e.clientX - rect.left) / rect.width) * 100;
            let y = ((e.clientY - rect.top) / rect.height) * 100;
            const safeX = Math.max(0, Math.min(100, x)); 
            const safeY = Math.max(0, Math.min(100, y));

            if (dragState.type === 'pin') { session.zones[dragState.index].x = safeX; session.zones[dragState.index].y = safeY; renderPins(); } 
            else if (dragState.type === 'text') { session.texts[dragState.index].x = safeX; session.texts[dragState.index].y = safeY; renderTexts(); } 
            else if (dragState.type === 'shape') { session.shapes[dragState.index].x = safeX; session.shapes[dragState.index].y = safeY; renderShapes(); }
        }
    });

    window.addEventListener('mouseup', () => {
        mapState.panning = false; 
        mapContainer.style.cursor = 'grab';
        if (dragState.isDragging) { dragState.isDragging = false; if (onUpdate) onUpdate(); }
    });

    const handleZoom = (delta) => {
        // Limite de zoom ampliado para permitir ver o mapa todo (0.1 a 8)
        mapState.scale = Math.max(0.1, Math.min(8, mapState.scale + delta)); 
        updateTransform();
    };
    wrapper.querySelector('#btn-zoom-in').onclick = () => handleZoom(0.2);
    wrapper.querySelector('#btn-zoom-out').onclick = () => handleZoom(-0.2);
    mapContainer.addEventListener('wheel', (e) => { e.preventDefault(); handleZoom(e.deltaY > 0 ? -0.1 : 0.1); }, { passive: false });

    // Botão direito para novo pino
    mapContainer.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const rect = mapContent.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        session.zones.push({ id: Date.now(), type: 'drink', x, y, priority: 'main', scale: 1 });
        renderPins();
        if (onUpdate) onUpdate();
    });

    // --- LÓGICA DE CARREGAMENTO E AJUSTE INICIAL ---
    imgElement.onload = () => {
        const imgW = imgElement.naturalWidth;
        const imgH = imgElement.naturalHeight;
        
        // Trava o container no tamanho da imagem (Impede o "deslocamento" ao fechar abas)
        mapContent.style.width = `${imgW}px`;
        mapContent.style.height = `${imgH}px`;

        // Ajuste automático inicial para caber na tela
        const containerRect = mapContainer.getBoundingClientRect();
        mapState.scale = Math.min(containerRect.width / imgW, containerRect.height / imgH, 1);
        updateTransform();
        renderPins(); renderTexts(); renderShapes();
    };

    if (imgElement.complete) imgElement.onload();
    
    // Funções de Criação (FAB)
    document.addEventListener('zm-create-text', () => {
        session.texts.push({ id: Date.now(), x: 50, y: 50, content: 'NOVO TEXTO', color: '#ffffff', fontSize: 24 });
        renderTexts();
    });
    document.addEventListener('zm-create-shape', () => {
        session.shapes.push({ id: Date.now(), type: 'circle', x: 50, y: 50, scale: 5, color: '#ffa500', strokeWidth: 0.2 });
        renderShapes();
    });
}

/* ==========================================================================
   FUNÇÃO AUXILIAR: GERAÇÃO DE SNAPSHOT (PRINT) DO MAPA
   ========================================================================== */
export async function generateMapSnapshot(session, imgElement) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const imgW = imgElement.naturalWidth;
        const imgH = imgElement.naturalHeight;
        canvas.width = imgW;
        canvas.height = imgH;

        // 1. Desenha o mapa base
        ctx.drawImage(imgElement, 0, 0, imgW, imgH);

        // 2. Desenha as Formas (Shapes)
        session.shapes.forEach(shape => {
            ctx.beginPath();
            const x = (shape.x / 100) * imgW;
            const y = (shape.y / 100) * imgH;
            const size = (parseFloat(shape.scale) || 3) * 1.5 * (imgW / 100);
            ctx.strokeStyle = shape.color || '#ffa500';
            ctx.lineWidth = (parseFloat(shape.strokeWidth) || 0.2) * (imgW / 100);

            if (shape.type === 'circle') {
                ctx.arc(x, y, size / 2, 0, Math.PI * 2);
            } else if (shape.type === 'square') {
                ctx.rect(x - size / 2, y - size / 2, size, size);
            }
            ctx.stroke();
        });

        // 3. Desenha os Pinos
        session.zones.forEach(zone => {
            const x = (zone.x / 100) * imgW;
            const y = (zone.y / 100) * imgH;
            const radius = 22 * (imgW / 1600); // Escala baseada na largura

            // Círculo do Pino
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = zone.type === 'drink' ? '#00bcd4' : (zone.type === 'feed' ? '#4caf50' : '#ff9800');
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Rótulo do Nome
            if (zone.name) {
                ctx.font = `bold ${radius * 0.8}px Arial`;
                ctx.fillStyle = '#fff';
                ctx.shadowColor = '#000';
                ctx.shadowBlur = 4;
                ctx.textAlign = 'center';
                ctx.fillText(zone.name.toUpperCase(), x, y + radius + 15);
                ctx.shadowBlur = 0;
            }
        });

        // 4. Desenha os Textos
        session.texts.forEach(txt => {
            const x = (txt.x / 100) * imgW;
            const y = (txt.y / 100) * imgH;
            ctx.font = `bold ${txt.fontSize * (imgW / 1600)}px Arial`;
            ctx.fillStyle = txt.color || '#ffffff';
            ctx.fillText(txt.content, x, y);
        });

        resolve(canvas.toDataURL('image/png'));
    });
}