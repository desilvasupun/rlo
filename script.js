/**
 * Name: Supun De Silva
 * Athabasca ID: 3508216
 * Title: script.js
 * Date: March 29, 2026
 * Description: Shared client-side behavior for checklist tracking, self-tests, copy buttons, and screenshot lightbox support.
 * Author: Supun De Silva
 * Version: 1.1
 * Copyright: 2026 Supun De Silva
 *
 * DOCUMENTATION
 *
 * Description and Purpose
 * This script adds the interactive behavior used throughout the RLO. It handles
 * command-copy buttons, injects and evaluates module self-tests, persists
 * checklist and self-test progress in localStorage, updates the progress bars,
 * and powers the screenshot lightbox used to enlarge inline figures.
 */

const STORAGE_PREFIX = 'lampp-rlo-checklist:';
const SELF_TEST_PREFIX = 'lampp-rlo-self-test:';
const DEFAULT_SELF_TEST_INTRO = 'Answer these from memory first, then check your reasoning before moving on.';
const DEFAULT_SELF_TEST_RESULT = 'Select one answer for each question, then check your work.';

const SELF_TEST_BANK = {
  '00-introduction-planning': [
    {
      prompt: 'Which download matches the build used in this RLO?',
      choices: ['Ubuntu Desktop ISO', 'Ubuntu Server LTS 64-bit AMD64 ISO', 'A prebuilt LAMP appliance image'],
      answer: 1,
      explain: 'Module 0 is based on a clean Ubuntu Server LTS install, not the desktop edition or a prebuilt stack image.'
    },
    {
      prompt: 'Why does the module ask you to create an evidence folder before you start building?',
      choices: ['To capture screenshots and notes as you work', 'To give Apache a place to store log files', 'To store MariaDB data files later'],
      answer: 0,
      explain: 'The evidence folder is a host-side submission aid so you can capture proof as you go instead of recreating it later.'
    }
  ],
  '01-vm-ubuntu-install': [
    {
      prompt: 'Which port-forwarding rule lets the host browser reach Apache later in the RLO?',
      choices: ['Host 80 to guest 8080', 'Host 8080 to guest 80', 'Host 2222 to guest 80'],
      answer: 1,
      explain: 'The host-side browser checks use port 8080, which forwards to Apache inside the VM on port 80.'
    },
    {
      prompt: 'If the VM boots back into the installer after reboot, what should you check first?',
      choices: ['Whether the Ubuntu ISO is still attached', 'Whether Apache is enabled', 'Whether MariaDB has a password'],
      answer: 0,
      explain: 'If the installer media is still attached, the VM can boot from it again instead of the virtual disk.'
    }
  ],
  '02-hardening': [
    {
      prompt: 'Why do you run <code>sudo sshd -t</code> before restarting SSH?',
      choices: ['To validate the SSH configuration syntax', 'To open the firewall for SSH', 'To regenerate the SSH host keys'],
      answer: 0,
      explain: 'The sshd syntax check helps you catch configuration mistakes before you risk breaking remote access.'
    },
    {
      prompt: 'What must be allowed in UFW before the firewall is enabled in Module 2?',
      choices: ['Apache Full', 'OpenSSH', 'All inbound ports from the host'],
      answer: 1,
      explain: 'Allowing OpenSSH first prevents the firewall from blocking the management access you still need.'
    }
  ],
  '03-apache': [
    {
      prompt: 'Where should your custom Apache site file live before you enable it?',
      choices: ['/var/www/lampp-demo/public/lampp-demo.conf', '/etc/apache2/sites-available/lampp-demo.conf', '/etc/apache2/apache2.conf.d/lampp-demo.conf'],
      answer: 1,
      explain: 'Ubuntu keeps site definitions in sites-available and then enables them explicitly through sites-enabled.'
    },
    {
      prompt: 'The browser still shows the default Apache page. What is the most likely cause?',
      choices: ['MariaDB is not installed yet', 'The Python virtual environment was not created', 'The default site was not disabled or Apache was not restarted'],
      answer: 2,
      explain: 'If 000-default is still enabled, or Apache did not reload the new config, the server can keep serving the old default page.'
    }
  ],
  '04-mariadb': [
    {
      prompt: 'Why does the module continue to use <code>sudo mariadb</code> for local administration on Ubuntu?',
      choices: ['Ubuntu commonly uses socket-based local administration for the root account', 'The MariaDB root account is permanently disabled', 'The command automatically grants network access to the app user'],
      answer: 0,
      explain: 'On Ubuntu, local root administration is often handled through socket-based access instead of a normal password login flow.'
    },
    {
      prompt: 'What privilege does <code>lampp_user</code> receive in this RLO?',
      choices: ['ALL PRIVILEGES on every database', 'SELECT on lampp_demo.*', 'DROP and ALTER on mysql.*'],
      answer: 1,
      explain: 'The application account is intentionally limited to read access so the demo follows a least-privilege pattern.'
    }
  ],
  '05-php': [
    {
      prompt: 'Which package lets Apache execute PHP files directly?',
      choices: ['php-cli', 'php-mysql', 'libapache2-mod-php'],
      answer: 2,
      explain: 'The Apache PHP module is the part that connects the web server to the PHP runtime for browser-based execution.'
    },
    {
      prompt: 'Why should <code>phpinfo.php</code> be removed immediately after the test succeeds?',
      choices: ['It exposes detailed server configuration information', 'Apache cannot restart while it exists', 'MariaDB refuses connections until it is deleted'],
      answer: 0,
      explain: 'The phpinfo page reveals a lot of environment detail, so it is useful for validation but not safe to leave exposed.'
    }
  ],
  '06-demo-php-site': [
    {
      prompt: 'Where should the database credentials file live in this module?',
      choices: ['/var/www/lampp-demo/public/db.php', '/var/www/lampp-demo/config/db.php', '/etc/apache2/sites-enabled/db.php'],
      answer: 1,
      explain: 'The credentials file belongs outside the public document root so browsers cannot request it directly.'
    },
    {
      prompt: 'Which permission pairing matches the file-lockdown guidance in this module?',
      choices: ['777 on the project tree and 777 on db.php', '644 on every file, including db.php', '750 on the project tree and 640 on db.php'],
      answer: 2,
      explain: 'The credentials file gets tighter permissions than the rest of the project because it contains sensitive data.'
    }
  ],
  '07-python-automation': [
    {
      prompt: 'Why does the module use a Python virtual environment for the health-check project?',
      choices: ['To isolate the automation project from the system Python environment', 'To make Apache execute Python instead of PHP', 'To replace MariaDB with a Python data store'],
      answer: 0,
      explain: 'The virtual environment keeps the automation setup reproducible without changing the global Python environment.'
    },
    {
      prompt: 'Which URL does the Python script request from inside the Ubuntu VM?',
      choices: ['http://127.0.0.1/', 'http://127.0.0.1:8080/', 'http://localhost:3306/'],
      answer: 0,
      explain: 'The script runs inside the VM, so it talks to the local web server on the VM loopback address and the default HTTP port.'
    }
  ],
  '08-final-validation': [
    {
      prompt: 'If the final validation sequence fails partway through, what is the best troubleshooting approach?',
      choices: ['Ignore the failed layer and keep testing upward', 'Stop at the first failing layer and fix it before moving on', 'Delete the VM and rebuild immediately'],
      answer: 1,
      explain: 'Module 8 uses a bottom-up sequence so you can fix the first broken dependency before chasing higher-level symptoms.'
    },
    {
      prompt: 'What makes the evidence package submission-ready in Module 8?',
      choices: ['Only the final homepage screenshot is included', 'The files are uploaded in any order as long as there are many of them', 'The required evidence from Modules 0 to 7 is present, readable, and consistently named'],
      answer: 2,
      explain: 'The final module is about completeness and organization, not just collecting a large number of screenshots.'
    }
  ]
};

const MODULE_KEYS = Object.keys(SELF_TEST_BANK);

function escapeAttribute(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getCurrentModuleKey() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1] || 'index.html';
  return last.replace(/\.html$/, '');
}

function findPanelByTitle(root, title) {
  return [...root.querySelectorAll('.panel > h2:first-child')]
    .find((heading) => heading.textContent.trim() === title)
    ?.closest('.panel') || null;
}

function buildSelfTestMarkup(moduleKey, questions) {
  const cards = questions.map((question, questionIndex) => {
    const options = question.choices.map((choice, choiceIndex) => `
      <label class="self-test-option">
        <input
          type="radio"
          name="${moduleKey}-q${questionIndex + 1}"
          value="${choiceIndex}"
          data-answer="${question.answer}"
          data-explain="${escapeAttribute(question.explain)}"
        >
        <span>${choice}</span>
      </label>
    `).join('');

    return `
      <fieldset class="self-test-question" data-self-test-question>
        <legend><span class="self-test-number">${questionIndex + 1}</span><span>${question.prompt}</span></legend>
        <div class="self-test-options">${options}</div>
        <p class="self-test-feedback" data-self-test-feedback aria-live="polite"></p>
      </fieldset>
    `;
  }).join('');

  return `
    <h2 style="margin-top:0;">Self-test</h2>
    <p class="self-test-intro">${DEFAULT_SELF_TEST_INTRO}</p>
    <form class="self-test-form" novalidate>
      ${cards}
      <div class="self-test-actions">
        <button class="button primary" type="button" data-self-test-submit>Check answers</button>
        <button class="button secondary" type="button" data-self-test-reset>Reset self-test</button>
      </div>
      <p class="self-test-result small" data-self-test-result data-result-intro="${DEFAULT_SELF_TEST_RESULT}" aria-live="polite">${DEFAULT_SELF_TEST_RESULT}</p>
    </form>
  `;
}

function injectModuleSelfTest() {
  const moduleKey = getCurrentModuleKey();
  const questions = SELF_TEST_BANK[moduleKey];
  const article = document.querySelector('.module-page');
  if (!questions || !article || article.querySelector('[data-self-test-key]')) {
    return;
  }

  const anchor = findPanelByTitle(article, 'Evidence to capture')
    || findPanelByTitle(article, 'Optional further reading');
  if (!anchor) {
    return;
  }

  const section = document.createElement('section');
  section.className = 'panel self-test-panel';
  section.style.marginTop = '1rem';
  section.setAttribute('data-self-test-key', moduleKey);
  section.setAttribute('data-self-test-passed', 'false');
  section.setAttribute('data-self-test-evaluated', 'false');
  section.innerHTML = buildSelfTestMarkup(moduleKey, questions);
  anchor.before(section);
}

function readStoredState(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function getModuleKeyFromHref(href) {
  if (!href) {
    return '';
  }

  try {
    const url = new URL(href, window.location.href);
    const parts = url.pathname.split('/').filter(Boolean);
    return (parts[parts.length - 1] || '').replace(/\.html$/, '');
  } catch {
    const cleanHref = String(href).split(/[?#]/)[0];
    const parts = cleanHref.split('/').filter(Boolean);
    return (parts[parts.length - 1] || '').replace(/\.html$/, '');
  }
}

function isModuleComplete(moduleKey) {
  if (!MODULE_KEYS.includes(moduleKey)) {
    return false;
  }

  const checklistState = readStoredState(STORAGE_PREFIX + moduleKey, []);
  const selfTestState = readStoredState(SELF_TEST_PREFIX + moduleKey, { answers: [], evaluated: false, passed: false });
  const checklistComplete = Array.isArray(checklistState)
    && checklistState.length > 0
    && checklistState.every(Boolean);

  return checklistComplete && Boolean(selfTestState?.passed);
}

function syncStatusBadge(container, complete, beforeSelector = '') {
  const badge = container.querySelector('.module-status-badge');

  if (!complete) {
    badge?.remove();
    return;
  }

  const beforeNode = beforeSelector ? container.querySelector(beforeSelector) : null;

  if (badge) {
    badge.textContent = 'Completed';
    if (beforeNode && badge !== beforeNode.previousElementSibling) {
      beforeNode.before(badge);
    }
    return;
  }

  const nextBadge = document.createElement('span');
  nextBadge.className = 'module-status-badge';
  nextBadge.textContent = 'Completed';
  if (beforeNode) {
    beforeNode.before(nextBadge);
    return;
  }

  container.appendChild(nextBadge);
}

function refreshModuleCompletionUI() {
  document.querySelectorAll('.nav-list a[href]').forEach((link) => {
    const moduleKey = getModuleKeyFromHref(link.getAttribute('href'));
    const complete = isModuleComplete(moduleKey);
    link.classList.toggle('is-complete', complete);
    syncStatusBadge(link, complete);
  });

  document.querySelectorAll('.module-card').forEach((card) => {
    const headingLink = card.querySelector('h3 a[href]');
    const statusHost = card.querySelector('.module-card-top') || card;
    const moduleKey = getModuleKeyFromHref(headingLink?.getAttribute('href'));
    const complete = isModuleComplete(moduleKey);
    card.classList.toggle('is-complete', complete);
    syncStatusBadge(statusHost, complete, 'h3');
  });
}

function refreshOverallProgress() {
  const checklistBoxes = [...document.querySelectorAll('input[data-track-checklist]')];
  const selfTests = [...document.querySelectorAll('[data-self-test-key]')];
  const fills = document.querySelectorAll('.progress-fill');
  const labels = document.querySelectorAll('[data-progress-label]');
  const total = checklistBoxes.length + selfTests.length;
  const done = checklistBoxes.filter((el) => el.checked).length
    + selfTests.filter((section) => section.getAttribute('data-self-test-passed') === 'true').length;

  if (!total) {
    fills.forEach((fill) => { fill.style.width = '0%'; });
    labels.forEach((label) => { label.textContent = '0 of 0 learning checks completed'; });
    refreshModuleCompletionUI();
    return;
  }

  const width = `${(done / total) * 100}%`;
  fills.forEach((fill) => { fill.style.width = width; });
  labels.forEach((label) => { label.textContent = `${done} of ${total} learning checks completed`; });
  refreshModuleCompletionUI();
}

function clearQuestionState(question) {
  question.classList.remove('is-correct', 'is-incorrect');
  question.querySelectorAll('.self-test-option').forEach((option) => {
    option.classList.remove('is-correct-choice', 'is-incorrect-choice');
  });
  const feedback = question.querySelector('[data-self-test-feedback]');
  if (feedback) {
    feedback.textContent = '';
  }
}

function saveSelfTestState(section) {
  const state = {
    answers: [...section.querySelectorAll('[data-self-test-question]')].map((question) => {
      const selected = question.querySelector('input[type="radio"]:checked');
      return selected ? Number(selected.value) : null;
    }),
    evaluated: section.getAttribute('data-self-test-evaluated') === 'true',
    passed: section.getAttribute('data-self-test-passed') === 'true'
  };
  localStorage.setItem(SELF_TEST_PREFIX + section.getAttribute('data-self-test-key'), JSON.stringify(state));
}

function setSelfTestResult(section, text) {
  const result = section.querySelector('[data-self-test-result]');
  if (result) {
    result.textContent = text;
  }
}

function evaluateSelfTest(section, { persist = true } = {}) {
  const questions = [...section.querySelectorAll('[data-self-test-question]')];
  let correct = 0;
  let unanswered = 0;

  questions.forEach((question) => {
    clearQuestionState(question);
    const selected = question.querySelector('input[type="radio"]:checked');
    const feedback = question.querySelector('[data-self-test-feedback]');

    if (!selected) {
      unanswered += 1;
      if (feedback) {
        feedback.textContent = 'Select an answer before checking this question.';
      }
      return;
    }

    const selectedOption = selected.closest('.self-test-option');
    const correctValue = Number(selected.getAttribute('data-answer'));
    const selectedValue = Number(selected.value);
    const correctOption = question.querySelector(`input[type="radio"][value="${correctValue}"]`)?.closest('.self-test-option');
    const explain = selected.getAttribute('data-explain') || '';
    const isCorrect = selectedValue === correctValue;

    if (isCorrect) {
      correct += 1;
      question.classList.add('is-correct');
      selectedOption?.classList.add('is-correct-choice');
      if (feedback) {
        feedback.textContent = `Correct. ${explain}`;
      }
    } else {
      question.classList.add('is-incorrect');
      selectedOption?.classList.add('is-incorrect-choice');
      correctOption?.classList.add('is-correct-choice');
      if (feedback) {
        feedback.textContent = `Not quite. ${explain}`;
      }
    }
  });

  const passed = unanswered === 0 && correct === questions.length;
  section.setAttribute('data-self-test-evaluated', 'true');
  section.setAttribute('data-self-test-passed', passed ? 'true' : 'false');

  if (unanswered > 0) {
    setSelfTestResult(section, `You answered ${correct} of ${questions.length} correctly. Finish the remaining ${unanswered} question${unanswered === 1 ? '' : 's'} and check again.`);
  } else if (passed) {
    setSelfTestResult(section, `Self-test complete: all ${questions.length} answers are correct. You are ready to move on.`);
  } else {
    setSelfTestResult(section, `You answered ${correct} of ${questions.length} correctly. Review the feedback and try again.`);
  }

  if (persist) {
    saveSelfTestState(section);
  }
  refreshOverallProgress();
}

function resetSelfTest(section) {
  section.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.checked = false;
  });
  section.querySelectorAll('[data-self-test-question]').forEach(clearQuestionState);
  section.setAttribute('data-self-test-evaluated', 'false');
  section.setAttribute('data-self-test-passed', 'false');
  setSelfTestResult(section, DEFAULT_SELF_TEST_RESULT);
  localStorage.removeItem(SELF_TEST_PREFIX + section.getAttribute('data-self-test-key'));
  refreshOverallProgress();
}

function initializeSelfTests() {
  document.querySelectorAll('[data-self-test-key]').forEach((section) => {
    const key = SELF_TEST_PREFIX + section.getAttribute('data-self-test-key');
    const state = readStoredState(key, { answers: [], evaluated: false, passed: false });

    [...section.querySelectorAll('[data-self-test-question]')].forEach((question, index) => {
      const savedValue = state.answers[index];
      if (savedValue !== null && savedValue !== undefined) {
        const input = question.querySelector(`input[type="radio"][value="${savedValue}"]`);
        if (input) {
          input.checked = true;
        }
      }
    });

    section.querySelector('[data-self-test-submit]')?.addEventListener('click', () => {
      evaluateSelfTest(section);
    });

    section.querySelector('[data-self-test-reset]')?.addEventListener('click', () => {
      resetSelfTest(section);
    });

    section.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.addEventListener('change', () => {
        clearQuestionState(input.closest('[data-self-test-question]'));
        section.setAttribute('data-self-test-passed', 'false');
        if (section.getAttribute('data-self-test-evaluated') === 'true') {
          section.setAttribute('data-self-test-evaluated', 'false');
          setSelfTestResult(section, 'Answers updated. Check your work again.');
        }
        saveSelfTestState(section);
        refreshOverallProgress();
      });
    });

    if (state.evaluated) {
      evaluateSelfTest(section, { persist: false });
    }
  });
}

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

injectModuleSelfTest();

document.querySelectorAll('[data-checklist-key]').forEach((list) => {
  const key = STORAGE_PREFIX + list.getAttribute('data-checklist-key');
  const saved = readStoredState(key, []);
  list.querySelectorAll('input[data-track-checklist]').forEach((box, idx) => {
    box.checked = Boolean(saved[idx]);
    box.addEventListener('change', () => {
      const state = [...list.querySelectorAll('input[data-track-checklist]')].map((el) => el.checked);
      localStorage.setItem(key, JSON.stringify(state));
      refreshOverallProgress();
    });
  });
});

initializeSelfTests();
refreshOverallProgress();

window.addEventListener('storage', (event) => {
  if (!event.key || event.key.startsWith(STORAGE_PREFIX) || event.key.startsWith(SELF_TEST_PREFIX)) {
    refreshOverallProgress();
  }
});

const stepImages = [...document.querySelectorAll('.step-visual img')];

if (stepImages.length) {
  const lightbox = document.createElement('div');
  lightbox.className = 'image-lightbox';
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.innerHTML = `
    <div class="image-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Expanded screenshot">
      <button class="image-lightbox-close" type="button" aria-label="Close expanded image">Close</button>
      <figure class="image-lightbox-frame">
        <img class="image-lightbox-image" alt="">
        <figcaption class="image-lightbox-caption"></figcaption>
      </figure>
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
    const captionNode = figure?.querySelector('figcaption');
    const captionText = captionNode?.innerText.trim() || img.alt.trim();
    const captionHtml = captionNode?.innerHTML || img.alt.trim();
    lastFocusedImage = img;
    lightboxImage.src = img.currentSrc || img.src;
    lightboxImage.alt = img.alt || captionText;
    lightboxCaption.innerHTML = captionHtml;
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
