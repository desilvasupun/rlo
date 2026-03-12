const STORAGE_PREFIX = 'lampp-rlo-checklist:';

document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const text = button.getAttribute('data-copy');
    try {
      await navigator.clipboard.writeText(text);
      const old = button.textContent;
      button.textContent = 'Copied';
      button.classList.add('copied');
      setTimeout(() => {
        button.textContent = old;
        button.classList.remove('copied');
      }, 1400);
    } catch {
      button.textContent = 'Copy failed';
    }
  });
});

function refreshOverallProgress() {
  const allBoxes = [...document.querySelectorAll('input[data-track-checklist]')];
  if (!allBoxes.length) return;
  const total = allBoxes.length;
  const done = allBoxes.filter((el) => el.checked).length;
  const fill = document.querySelector('.progress-fill');
  const label = document.querySelector('[data-progress-label]');
  if (fill) fill.style.width = `${(done / total) * 100}%`;
  if (label) label.textContent = `${done} of ${total} checkpoints completed`;
}

document.querySelectorAll('[data-checklist-key]').forEach((list) => {
  const key = STORAGE_PREFIX + list.getAttribute('data-checklist-key');
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem(key) || '[]'); } catch { saved = []; }
  list.querySelectorAll('input[data-track-checklist]').forEach((box, idx) => {
    box.checked = Boolean(saved[idx]);
    box.addEventListener('change', () => {
      const state = [...list.querySelectorAll('input[data-track-checklist]')].map((el) => el.checked);
      localStorage.setItem(key, JSON.stringify(state));
      refreshOverallProgress();
    });
  });
});

refreshOverallProgress();