const storageKey = 'adhdMomentumPlanner';
const defaultState = {
  fields: {},
  tasks: [],
  theme: 'sunrise',
  font: 'inter',
  compact: false,
};

let state = loadState();
let breathTimer;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return saved ? { ...defaultState, ...saved } : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function initTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.panel');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function initFields() {
  document.querySelectorAll('[data-save]').forEach((el) => {
    const key = el.dataset.save;
    el.value = state.fields[key] || '';
    el.addEventListener('input', () => {
      state.fields[key] = el.value;
      saveState();
    });
  });

  document.querySelectorAll('#priorityList li').forEach((item, idx) => {
    const cb = item.querySelector('input[type="checkbox"]');
    const txt = item.querySelector('input[type="text"]');
    const checkedKey = `priorityChecked${idx}`;
    const textKey = `priorityText${idx}`;

    cb.checked = Boolean(state.fields[checkedKey]);
    txt.value = state.fields[textKey] || '';

    cb.addEventListener('change', () => {
      state.fields[checkedKey] = cb.checked;
      saveState();
    });
    txt.addEventListener('input', () => {
      state.fields[textKey] = txt.value;
      saveState();
    });
  });
}

function renderTasks() {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';

  state.tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = `task-item ${task.priority}`;
    li.innerHTML = `
      <div>
        <strong>${task.text}</strong>
        <div class="task-meta">${task.priority.toUpperCase()} • ${task.category}</div>
      </div>
      <button class="ghost-btn" data-remove="${index}">Done</button>
    `;
    taskList.appendChild(li);
  });

  taskList.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.tasks.splice(Number(btn.dataset.remove), 1);
      saveState();
      renderTasks();
    });
  });
}

function initTasks() {
  const form = document.getElementById('taskForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('taskText').value.trim();
    if (!text) return;

    state.tasks.push({
      text,
      priority: document.getElementById('taskPriority').value,
      category: document.getElementById('taskCategory').value,
    });

    form.reset();
    saveState();
    renderTasks();
  });

  renderTasks();
}

function initTimeBlocks() {
  const grid = document.getElementById('blockGrid');
  const slots = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  slots.forEach((slot) => {
    const row = document.createElement('div');
    row.className = 'block-row';
    row.innerHTML = `<strong>${slot}</strong><input type="text" data-save="block${slot}" placeholder="Focus task or break" />`;
    grid.appendChild(row);
  });
}

function initBreathingTimer() {
  const btn = document.getElementById('startBreath');
  const readout = document.getElementById('breathReadout');

  btn.addEventListener('click', () => {
    const mins = Number(document.getElementById('breathMinutes').value);
    if (!mins || mins < 1) return;

    let seconds = mins * 60;
    clearInterval(breathTimer);
    readout.textContent = `Session started: ${mins} minute(s)`;

    breathTimer = setInterval(() => {
      seconds -= 1;
      const mm = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0');
      const ss = (seconds % 60).toString().padStart(2, '0');
      readout.textContent = `Breathe... ${mm}:${ss}`;

      if (seconds <= 0) {
        clearInterval(breathTimer);
        readout.textContent = 'Great job. Take a sip of water and continue.';
      }
    }, 1000);
  });
}

function applyCustomization() {
  document.body.classList.remove('forest', 'midnight', 'lexend', 'compact');
  if (state.theme !== 'sunrise') document.body.classList.add(state.theme);
  if (state.font === 'lexend') document.body.classList.add('lexend');
  if (state.compact) document.body.classList.add('compact');

  document.getElementById('themePicker').value = state.theme;
  document.getElementById('fontPicker').value = state.font;
  document.getElementById('compactMode').checked = state.compact;
}

function initCustomization() {
  document.getElementById('themePicker').addEventListener('change', (e) => {
    state.theme = e.target.value;
    applyCustomization();
    saveState();
  });

  document.getElementById('fontPicker').addEventListener('change', (e) => {
    state.font = e.target.value;
    applyCustomization();
    saveState();
  });

  document.getElementById('compactMode').addEventListener('change', (e) => {
    state.compact = e.target.checked;
    applyCustomization();
    saveState();
  });
}

function initReset() {
  document.getElementById('resetPlanner').addEventListener('click', () => {
    localStorage.removeItem(storageKey);
    state = { ...defaultState };
    window.location.reload();
  });
}

initTabs();
initTimeBlocks();
initFields();
initTasks();
initBreathingTimer();
initCustomization();
applyCustomization();
initReset();
