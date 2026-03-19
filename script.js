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
  const fills = document.querySelectorAll('.progress-fill');
  const labels = document.querySelectorAll('[data-progress-label]');
  if (!allBoxes.length) {
    fills.forEach((fill) => {
      fill.style.width = '0%';
    });
    labels.forEach((label) => {
      label.textContent = '0 of 0 checkpoints completed';
    });
    return;
  }
  const total = allBoxes.length;
  const done = allBoxes.filter((el) => el.checked).length;
  const width = `${(done / total) * 100}%`;
  fills.forEach((fill) => {
    fill.style.width = width;
  });
  labels.forEach((label) => {
    label.textContent = `${done} of ${total} checkpoints completed`;
  });
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

const stepImages = [...document.querySelectorAll('.step-visual img')];

if (stepImages.length) {
  const lightbox = document.createElement('div');
  lightbox.className = 'image-lightbox';
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.innerHTML = `
    <div class="image-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Expanded screenshot">
      <button class="image-lightbox-close" type="button" aria-label="Close expanded image">Close</button>
      <img class="image-lightbox-image" alt="">
      <p class="image-lightbox-caption"></p>
    </div>
  `;

  const lightboxDialog = lightbox.querySelector('.image-lightbox-dialog');
  const lightboxClose = lightbox.querySelector('.image-lightbox-close');
  const lightboxImage = lightbox.querySelector('.image-lightbox-image');
  const lightboxCaption = lightbox.querySelector('.image-lightbox-caption');
  let lastFocusedImage = null;

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    lightboxImage.removeAttribute('src');
    lightboxImage.alt = '';
    lightboxCaption.textContent = '';
    if (lastFocusedImage) {
      lastFocusedImage.focus();
      lastFocusedImage = null;
    }
  };

  const openLightbox = (img) => {
    const figure = img.closest('.step-visual');
    const caption = figure?.querySelector('figcaption')?.innerText.trim() || img.alt.trim();
    lastFocusedImage = img;
    lightboxImage.src = img.currentSrc || img.src;
    lightboxImage.alt = img.alt || caption;
    lightboxCaption.textContent = caption;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    lightboxClose.focus();
  };

  document.body.appendChild(lightbox);

  stepImages.forEach((img) => {
    const figure = img.closest('.step-visual');
    const caption = figure?.querySelector('figcaption')?.innerText.trim() || img.alt.trim() || 'Open full-size image';
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `${caption}. Open full-size image.`);
    img.title = 'Click to enlarge';
    img.addEventListener('click', () => openLightbox(img));
    img.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(img);
      }
    });
  });

  lightbox.addEventListener('click', (event) => {
    if (!lightboxDialog.contains(event.target)) {
      closeLightbox();
    }
  });

  lightboxClose.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });
}
