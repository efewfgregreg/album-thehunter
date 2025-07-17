// src/js/modalManager.js

// Gerenciamento de Modais Personalizados

const imageViewerModal = document.getElementById('image-viewer-modal');
const formModal = document.getElementById('form-modal');
const customAlertModal = document.getElementById('custom-alert-modal');

const customAlertTitle = document.getElementById('custom-alert-title');
const customAlertMessage = document.getElementById('custom-alert-message');
const customAlertCancelBtn = document.getElementById('custom-alert-cancel-btn');
const customAlertConfirmBtn = document.getElementById('custom-alert-confirm-btn');

// Mostrar Imagem em Tela Cheia
function openImageViewer(imageSrc) {
    imageViewerModal.innerHTML = `<span class="modal-close">&times;</span><img src="${imageSrc}" style="max-width:90%;max-height:90%">`;
    imageViewerModal.style.display = 'flex';
    imageViewerModal.querySelector('.modal-close').onclick = closeImageViewer;
}

function closeImageViewer() {
    imageViewerModal.style.display = 'none';
}

// Alerta Personalizado
function openCustomAlert(title, message, onConfirm, onCancel) {
    customAlertTitle.textContent = title;
    customAlertMessage.textContent = message;
    customAlertModal.style.display = 'flex';

    customAlertConfirmBtn.onclick = () => {
        customAlertModal.style.display = 'none';
        if (onConfirm) onConfirm();
    };

    customAlertCancelBtn.onclick = () => {
        customAlertModal.style.display = 'none';
        if (onCancel) onCancel();
    };
}

function closeCustomAlert() {
    customAlertModal.style.display = 'none';
}

// Formulário Modal (personalizar conforme necessário)
function openFormModal(htmlContent) {
    formModal.innerHTML = htmlContent;
    formModal.style.display = 'flex';
}

function closeFormModal() {
    formModal.style.display = 'none';
}

export { openImageViewer, openCustomAlert, openFormModal, closeFormModal };
