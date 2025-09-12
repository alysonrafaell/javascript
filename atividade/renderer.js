let currentFilePath = null;

const editor = document.getElementById('editor');
const btnOpen = document.getElementById('btn-open');
const btnSave = document.getElementById('btn-save');
const btnSaveAs = document.getElementById('btn-save-as');


function setStatus(message) {
  console.log(message); 
}

btnOpen.addEventListener('click', async () => {
  try {
    const result = await window.fileAPI.openFile();
    if (!result.canceled) {
      currentFilePath = result.path;
      editor.value = result.content;
      setStatus(`Arquivo aberto: ${currentFilePath}`);
    }
  } catch (err) {
    console.error('Erro ao abrir arquivo:', err);
  }
});

btnSave.addEventListener('click', async () => {
  try {
    const result = await window.fileAPI.saveFile({
      filePath: currentFilePath,
      content: editor.value
    });
    if (!result.canceled) {
      currentFilePath = result.path; 
      setStatus(`Arquivo salvo: ${currentFilePath}`);
    }
  } catch (err) {
    console.error('Erro ao salvar arquivo:', err);
  }
});

btnSaveAs.addEventListener('click', async () => {
  try {
    const result = await window.fileAPI.saveAsFile({ content: editor.value });
    if (!result.canceled) {
      currentFilePath = result.path;
      setStatus(`Arquivo salvo como: ${currentFilePath}`);
    }
  } catch (err) {
    console.error('Erro ao salvar como:', err);
  }
});
