// --- CÓDIGO FINAL PARA A FUNCIONALIDADE DE TELA CHEIA ---

// Funções que abrem e fecham a imagem
function openModal(imageUrl) {
    const modal = document.getElementById('fullscreen-modal');
    const modalImg = document.getElementById('modal-image');
    
    if (modal && modalImg) {
        modalImg.src = imageUrl;
        modal.style.display = "flex";
        window.addEventListener('keydown', closeModalOnEscape);
    }
}

function closeModal() {
    const modal = document.getElementById('fullscreen-modal');
    if (modal) {
        modal.style.display = "none";
        window.removeEventListener('keydown', closeModalOnEscape);
    }
}

function closeModalOnEscape(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
}

// Reconfigura o evento 'DOMContentLoaded' para incluir a lógica do modal
document.addEventListener('DOMContentLoaded', () => {
    mainContent = document.querySelector('.main-content');
    const navButtons = document.querySelectorAll('.nav-button');

    function setActiveTab(tabKey) {
        navButtons.forEach(b => b.classList.toggle('active', b.dataset.target === tabKey));
        renderMainView(tabKey);
    }

    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            setActiveTab(e.currentTarget.dataset.target);
        });
    });
    
    const initialTab = 'pelagens'; // Mudei para 'pelagens' para facilitar o teste
    navButtons.forEach(b => b.classList.toggle('active', b.dataset.target === initialTab));
    renderMainView(initialTab);

    // Lógica para fazer os botões de fechar do modal funcionarem
    const modal = document.getElementById('fullscreen-modal');
    const closeBtn = document.querySelector('.modal-close');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
});