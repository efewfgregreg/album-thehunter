<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#181a1b">
  <title>Registro do Caçador – theHunter: Call of the Wild</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="src/css/styles.css">
</head>
<body>
  <div id="app-container"></div>
  <div id="image-viewer-modal" class="modal-overlay"></div>
  <div id="form-modal" class="modal-overlay"></div>
  <div id="custom-alert-modal" class="modal-overlay"></div>

  <!-- Remova as libs do Firebase v8 -->
  <script src="https://unpkg.com/panzoom@9.4.3/dist/panzoom.min.js"></script>

  <!-- Seu JS usa ES Modules com Firebase v10 CDN -->
  <script type="module" src="src/js/main.js" defer></script>
</body>
</html>
