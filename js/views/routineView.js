// =================================================================
// ARQUIVO: js/views/routineView.js
// =================================================================
import { animalHotspotData } from '../../data/gameData.js';

// Função global para abrir mapas em tela cheia
window.openFullscreen = function(imageSrc) {
    if (!imageSrc) return;
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.95); display:flex; justify-content:center; align-items:center; z-index:9999; cursor:zoom-out;';
    modal.innerHTML = `<img src="${imageSrc}" style="max-width:90%; max-height:90%; border-radius:8px; box-shadow: 0 0 20px rgba(0,0,0,0.5);" onerror="this.style.display='none'; this.parentElement.innerHTML += '<p style=\'color:white;\'>Mapa não encontrado</p>'">`;
    modal.onclick = () => modal.remove();
    document.body.appendChild(modal);
};

export function renderRoutineDetailView(container, name, slug, originReserveKey = null, filter = 'all') {
    container.innerHTML = '';
    
    // Busca dados táticos
    const tacticalData = (originReserveKey && animalHotspotData[originReserveKey] && animalHotspotData[originReserveKey][slug]) 
                         ? animalHotspotData[originReserveKey][slug] 
                         : { population: { total: '--', machos: '--', femeas: '--', zonasGrupo: '--', solos: '--' }, schedules: [] };

    // GERAÇÃO DINÂMICA DO CAMINHO DA IMAGEM
    // Converte a chave da reserva para o formato da pasta (ex: 'layton-lake' -> 'layton_lake')
    const reserveFolderKey = originReserveKey ? originReserveKey.replace(/-/g, '_') : 'default';
    const mapaUrl = `hotspots/${reserveFolderKey}_${slug}_hotspot.jpg`;

    const popTotal = tacticalData.population?.total || '--';
    const popMachos = tacticalData.population?.machos || '--';
    const popFemeas = tacticalData.population?.femeas || '--';
    const popZonasGrupo = tacticalData.population?.zonasGrupo || '--';
    const popSolos = tacticalData.population?.solos || '--';
    const schedules = tacticalData.schedules || [];

    const routineHtml = `
        <div class="routine-population-container" style="display: flex; gap: 25px; flex-wrap: wrap; margin-top: 15px; animation: fadeIn 0.4s ease-out;">
            
            <div class="pop-card" style="flex: 1; min-width: 280px; background: rgba(20, 22, 25, 0.85); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px);">
                <h3 style="color: var(--primary-color); font-family: 'Bebas Neue', cursive; font-size: 1.8rem; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; letter-spacing: 1px;">
                    <i class="fas fa-users" style="margin-right: 8px;"></i> POPULAÇÃO (ESTIMATIVA)
                </h3>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 6px;">
                    <span style="color: #aaa; font-weight: 600; font-size: 0.9rem; letter-spacing: 1px;">TOTAL NO MAPA:</span>
                    <span style="color: #fff; font-size: 1.4rem; font-family: monospace; font-weight: bold;">${popTotal}</span>
                </div>
                
                <div style="padding: 5px 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color: #aaa; font-size: 0.95rem;"><i class="fas fa-mars" style="color: #03a9f4; width: 20px;"></i> Machos:</span>
                        <span style="color: #fff; font-family: monospace; font-size: 1.1rem;">${popMachos}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                        <span style="color: #aaa; font-size: 0.95rem;"><i class="fas fa-venus" style="color: #e91e63; width: 20px;"></i> Fêmeas:</span>
                        <span style="color: #fff; font-family: monospace; font-size: 1.1rem;">${popFemeas}</span>
                    </div>
                    <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #aaa; font-size: 0.95rem;"><i class="fas fa-map-marker-alt" style="color: #ff9800; width: 20px;"></i> Zonas de Grupo:</span>
                            <span style="color: #ff9800; font-family: monospace; font-size: 1.1rem; font-weight: bold;">${popZonasGrupo}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #aaa; font-size: 0.95rem;"><i class="fas fa-crosshairs" style="color: #9c27b0; width: 20px;"></i> Solos:</span>
                            <span style="color: #9c27b0; font-family: monospace; font-size: 1.1rem; font-weight: bold;">${popSolos}</span>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <span style="color: #aaa; font-size: 0.8rem; margin-bottom: 8px; display: block; letter-spacing: 1px;">MAPA DE HOTSPOT:</span>
                    <div onclick="window.openFullscreen('${mapaUrl}')" 
                         style="cursor: pointer; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; overflow: hidden; height: 120px; background: #000 url('${mapaUrl}') center/contain no-repeat; position: relative;">
                        <div style="position: absolute; bottom: 5px; right: 5px; background: rgba(0,0,0,0.7); padding: 2px 8px; font-size: 0.6rem; color: #fff; border-radius: 4px;">AMPLIAR</div>
                    </div>
                </div>
            </div>

            <div class="schedule-card" style="flex: 2; min-width: 320px; background: rgba(20, 22, 25, 0.85); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px);">
                <h3 style="color: var(--primary-color); font-family: 'Bebas Neue', cursive; font-size: 1.8rem; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; letter-spacing: 1px;">
                    <i class="fas fa-stopwatch" style="margin-right: 8px;"></i> ZONAS DE NECESSIDADE
                </h3>
                <div class="schedule-list" style="display: flex; flex-direction: column; gap: 10px;">
                    ${schedules.length > 0 ? schedules.map(sched => {
                        let icon = 'fas fa-question';
                        let color = '#ffffff';
                        if (sched.type === 'rest') { icon = 'fas fa-bed'; color = '#b8860b'; } 
                        else if (sched.type === 'eat') { icon = 'fas fa-leaf'; color = '#689f38'; } 
                        else if (sched.type === 'drink') { icon = 'fas fa-water'; color = '#0288d1'; }
                        return `
                            <div style="display: flex; align-items: center; justify-content: flex-start; gap: 20px; background: rgba(0,0,0,0.4); padding: 12px 20px; border-radius: 8px; border-left: 4px solid ${color};">
                                <i class="${icon}" style="color: ${color}; font-size: 1.4rem; width: 30px; text-align: center;"></i>
                                <span style="color: ${color}; font-family: 'Montserrat', monospace; font-size: 1.2rem; font-weight: 700; letter-spacing: 2px;">${sched.time}</span>
                            </div>
                        `;
                    }).join('') : `<p style="color: #666; text-align: center;">Sem dados táticos.</p>`}
                </div>
            </div>
        </div>
    `;

    container.innerHTML = routineHtml;
}