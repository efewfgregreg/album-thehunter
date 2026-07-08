/**
 * Módulo de Visualização: Tratadores (Feeders) - V61.0
 * Layout: Premium HUD com categorias em blocos e cores dinâmicas de sistema.
 * Integridade: Sincronização total de animais baseada no código V57 e documentos.
 */
export function renderFeedersView(container) {
    container.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = `
        .feeders-container { 
            padding: 40px; color: #e0e0e0; animation: fadeIn 0.8s ease; 
            max-width: 1300px; margin: 0 auto; font-family: 'Montserrat', sans-serif;
        }
        
        .feeders-header { margin-bottom: 50px; border-left: 6px solid var(--primary-color); padding-left: 25px; }
        .feeders-header h2 { font-family: 'Bebas Neue', cursive; font-size: 4rem; letter-spacing: 3px; margin: 0; line-height: 1; }
        .feeders-header p { color: var(--primary-color); text-transform: uppercase; font-size: 0.9rem; font-weight: 800; letter-spacing: 2px; margin-top: 8px; opacity: 0.8; }

        .feeder-accordion { display: flex; flex-direction: column; gap: 25px; }

        .feeder-card {
            background: rgba(15, 15, 15, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
            backdrop-filter: blur(15px);
        }

        .feeder-trigger {
            padding: 30px; cursor: pointer; display: flex; align-items: center; justify-content: space-between;
            background: linear-gradient(90deg, rgba(var(--primary-rgb), 0.05), transparent);
            transition: 0.3s;
        }
        .feeder-trigger:hover { background: rgba(var(--primary-rgb), 0.1); }
        .feeder-trigger h3 { font-family: 'Bebas Neue', cursive; font-size: 2.5rem; color: #fff; margin: 0; letter-spacing: 2px; }
        .feeder-trigger i { transition: 0.5s; color: var(--primary-color); font-size: 1.5rem; }

        .feeder-card.active { border-color: var(--primary-color); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .feeder-card.active .feeder-trigger i { transform: rotate(180deg); color: #fff; }
        
        .feeder-content { max-height: 0; overflow: hidden; transition: max-height 0.6s ease; padding: 0 30px; }
        .feeder-card.active .feeder-content { max-height: 3000px; padding: 30px; }

        .bait-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 40px; }
        .bait-header { 
            font-weight: 900; font-size: 0.8rem; color: var(--bait-color); 
            text-transform: uppercase; margin-bottom: 25px; letter-spacing: 2px;
            display: flex; align-items: center; gap: 15px;
        }
        .bait-header::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, var(--bait-color), transparent); opacity: 0.3; }

        .category-group { margin-bottom: 30px; }
        .category-name { font-size: 0.7rem; color: #666; text-transform: uppercase; font-weight: 900; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
        .category-name i { font-size: 0.8rem; color: var(--bait-color); }
        
        .animal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
        .animal-node { 
            background: rgba(255,255,255,0.03); color: #aaa; font-size: 0.75rem; font-weight: 600;
            padding: 10px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);
            transition: 0.3s; text-align: center; display: flex; align-items: center; justify-content: center;
            min-height: 45px;
        }
        .animal-node:hover { color: #fff; background: var(--bait-color); transform: scale(1.05); }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    `;
    container.appendChild(style);

    const content = document.createElement('div');
    content.className = 'feeders-container';
    content.innerHTML = `
        <div class="feeders-header">
            <h2>TRATADORES</h2>
            <p>Guia Tático de Atração por Isca</p>
        </div>

        <div class="feeder-accordion">
            <div class="feeder-card">
                <div class="feeder-trigger"><h3><i class="fas fa-drum"></i> BARRIL DE ISCA</h3><i class="fas fa-chevron-down"></i></div>
                <div class="feeder-content">
                    <div class="bait-grid">
                        <div class="bait-column" style="--bait-color: var(--primary-color)">
                            <div class="bait-header">MISTURA FERMENTADA AZEDA</div>
                            <div class="category-group">
                                <span class="category-name"><i class="fas fa-paw"></i> Ursos e Suínos</span>
                                <div class="animal-grid">
                                    <div class="animal-node">Urso Negro</div><div class="animal-node">Urso Pardo</div><div class="animal-node">Urso Cinzento</div>
                                    <div class="animal-node">Caititu</div><div class="animal-node">Javali Selvagem</div><div class="animal-node">Javali Africano</div>
                                    <div class="animal-node">Porco Selvagem</div><div class="animal-node">Javali</div>
                                </div>
                            </div>
                        </div>
                        <div class="bait-column" style="--bait-color: #ff5252">
                            <div class="bait-header">RESTOS DE CARNE</div>
                            <div class="category-group">
                                <span class="category-name"><i class="fas fa-skull"></i> Carnívoros</span>
                                <div class="animal-grid">
                                    <div class="animal-node">Urso Negro</div><div class="animal-node">Urso Pardo</div><div class="animal-node">Urso Cinzento</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="feeder-card">
                <div class="feeder-trigger"><h3><i class="fas fa-box-open"></i> ALIMENTADOR DE CAIXA</h3><i class="fas fa-chevron-down"></i></div>
                <div class="feeder-content">
                    <div class="bait-grid">
                        <div class="bait-column" style="--bait-color: #ffd700">
                            <div class="bait-header">GRANULOS FORTIFICADOS</div>
                            <div class="category-group">
                                <span class="category-name"><i class="fas fa-leaf"></i> Grandes Cervídeos e Ungulados</span>
                                <div class="animal-grid">
                                    <div class="animal-node">Urso Negro</div><div class="animal-node">Urso Pardo</div><div class="animal-node">Urso Cinzento</div>
                                    <div class="animal-node">Alce</div><div class="animal-node">Rena Montanha</div><div class="animal-node">Caribu Floresta</div>
                                    <div class="animal-node">Caribu Grant</div><div class="animal-node">Cervo Canadense</div><div class="animal-node">Veado Vermelho</div>
                                    <div class="animal-node">Sambar</div><div class="animal-node">Cervo Pantano</div><div class="animal-node">Cervo Sika</div>
                                    <div class="animal-node">Veado Mula</div><div class="animal-node">V. Cauda Branca</div><div class="animal-node">V. Cauda Preta</div>
                                    <div class="animal-node">Gamo</div><div class="animal-node">Cervo de Timor</div><div class="animal-node">V. Montanhas Rochosas</div>
                                    <div class="animal-node">Veado de Roosevelt</div>
                                </div>
                            </div>
                        </div>
                        <div class="bait-column" style="--bait-color: var(--primary-color)">
                            <div class="bait-header">MIX DE FLOCOS MULTIGRÃO</div>
                            <div class="category-group">
                                <span class="category-name"><i class="fas fa-mountain"></i> Antílopes e Outros</span>
                                <div class="animal-grid">
                                    <div class="animal-node">Urso Negro</div><div class="animal-node">Urso Pardo</div><div class="animal-node">Urso Cinzento</div>
                                    <div class="animal-node">Gnu</div><div class="animal-node">Orix</div><div class="animal-node">Nilgo</div>
                                    <div class="animal-node">Cudo Menor</div><div class="animal-node">Gamo</div><div class="animal-node">Cervo Sika</div>
                                    <div class="animal-node">Veado Cauda Branca</div><div class="animal-node">Veado Cauda Preta</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="feeder-card">
                <div class="feeder-trigger"><h3><i class="fas fa-broadcast-tower"></i> ALIMENTADOR DE POSTE</h3><i class="fas fa-chevron-down"></i></div>
                <div class="feeder-content">
                    <div class="bait-grid">
                        <div class="bait-column" style="--bait-color: var(--primary-color)">
                            <div class="bait-header">MIX DE FLOCOS MULTIGRÃO</div>
                            <div class="category-group">
                                <span class="category-name"><i class="fas fa-paw"></i> Ursos, Suínos e Antílopes</span>
                                <div class="animal-grid">
                                    <div class="animal-node">Urso Negro</div><div class="animal-node">Urso Pardo</div><div class="animal-node">Urso Cinzento</div>
                                    <div class="animal-node">Caititu</div><div class="animal-node">Javali</div><div class="animal-node">Porco Selvagem</div>
                                    <div class="animal-node">Javali Selvagem</div><div class="animal-node">Javali Africano</div><div class="animal-node">Gnu</div>
                                    <div class="animal-node">Orix</div><div class="animal-node">Nilgo</div><div class="animal-node">Antílope Negro</div>
                                    <div class="animal-node">Cudo Menor</div><div class="animal-node">Antilocapra</div><div class="animal-node">Cabra de Leque</div>
                                </div>
                            </div>
                            <div class="category-group">
                                <span class="category-name"><i class="fas fa-rabbit"></i> Pequenos Animais e Cervos</span>
                                <div class="animal-grid">
                                    <div class="animal-node">Lebre Europeia</div><div class="animal-node">Coelho Europeu</div><div class="animal-node">Guaxinim</div>
                                    <div class="animal-node">Lebre Antílope</div><div class="animal-node">Lebre Peluda</div><div class="animal-node">Lebre Cauda Branca</div>
                                    <div class="animal-node">Lebre Nuca Dourada</div><div class="animal-node">Lebre Eurásia</div><div class="animal-node">Coelho Flórida</div>
                                    <div class="animal-node">Gamo</div><div class="animal-node">Cervo Sika</div><div class="animal-node">V. Cauda Branca</div><div class="animal-node">V. Cauda Preta</div>
                                </div>
                            </div>
                        </div>
                        <div class="bait-column" style="--bait-color: #ffd700">
                            <div class="bait-header">GRANULOS FORTIFICADOS</div>
                            <div class="category-group">
                                <span class="category-name"><i class="fas fa-horse"></i> Cervídeos e Pequenos Animais</span>
                                <div class="animal-grid">
                                    <div class="animal-node">Urso Negro</div><div class="animal-node">Urso Pardo</div><div class="animal-node">Urso Cinzento</div>
                                    <div class="animal-node">Alce</div><div class="animal-node">Rena Montanha</div><div class="animal-node">Caribu Floresta</div>
                                    <div class="animal-node">Caribu Grant</div><div class="animal-node">Chital</div><div class="animal-node">Sambar</div>
                                    <div class="animal-node">Veado Vermelho</div><div class="animal-node">Veado Mula</div><div class="animal-node">Cervo Sika</div>
                                    <div class="animal-node">Corça</div><div class="animal-node">Muntíaco</div><div class="animal-node">Cervo Almiscarrado</div>
                                    <div class="animal-node">Cervo Pantano</div><div class="animal-node">Cervo Porco Indiano</div><div class="animal-node">Cervo de Timor</div>
                                    <div class="animal-node">V. Cauda Branca</div><div class="animal-node">V. Cauda Preta</div><div class="animal-node">Guaxinim</div>
                                    <div class="animal-node">Lebre Europeia</div><div class="animal-node">Coelho Europeu</div><div class="animal-node">Lebre Antílope</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    container.appendChild(content);

    const cards = content.querySelectorAll('.feeder-card');
    cards.forEach(card => {
        card.querySelector('.feeder-trigger').onclick = () => {
            const isActive = card.classList.contains('active');
            cards.forEach(c => c.classList.remove('active'));
            if (!isActive) card.classList.add('active');
        };
    });
}