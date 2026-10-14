const icons = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  leaf: '<path d="M20 4c-8 0-14 4-14 11a5 5 0 0 0 5 5c7 0 9-8 9-16Z"/><path d="M4 21c2-5 6-8 11-11"/>',
  weather: '<path d="M20 16.2A4.5 4.5 0 0 0 18 7.5a6 6 0 0 0-11.6 1.8A3.5 3.5 0 0 0 7 16h13Z"/><path d="m8 20 1-2m4 2 1-2m4 2 1-2"/>',
  chat: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/>',
  spark: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 14 1 2.5 2 1-2 1-1 2.5-1-2.5-2-1 2-1 1-2.5Z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.8-1l-1.6.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.8 1l1.6-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
  arrow: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  send: '<path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/>'
};

const ico = name =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.spark}</svg>`;

const pages = [
  'Dashboard',
  'Disease Detection',
  'Weather Insights',
  'AI Farming Assistant',
  'Farming Recommendations',
  'Settings'
];

let current = 'Dashboard';

const nav = document.querySelector('#nav');
nav.innerHTML = pages.map((page, i) => `
  <button data-page="${page}" class="${page === current ? 'active' : ''}">
    ${ico(['dashboard', 'leaf', 'weather', 'chat', 'spark', 'settings'][i])}
    <span>${page}</span>
  </button>
`).join('');

nav.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (button) go(button.dataset.page);
});

document.querySelector('#menu').onclick = () => {
  document.querySelector('#sidebar').classList.toggle('open');
};

function go(page) {
  current = page;
  document.querySelectorAll('.nav button').forEach(button => {
    button.classList.toggle('active', button.dataset.page === page);
  });
  document.querySelector('#crumb').textContent = page;
  document.querySelector('#sidebar').classList.remove('open');
  render();
}

function render() {
  const root = document.querySelector('#page');

  if (current === 'Dashboard') root.innerHTML = dashboard();
  else if (current === 'Disease Detection') root.innerHTML = disease();
  else if (current === 'AI Farming Assistant') root.innerHTML = assistant();
  else if (current === 'Weather Insights') root.innerHTML = weatherPage();
  else if (current === 'Farming Recommendations') root.innerHTML = recommendations();
  else root.innerHTML = settingsPage();

  bind();
}

function dashboard() {
  return `
    <div class="row">
      <div>
        <div class="eyebrow">YOUR FARMING WORKSPACE</div>
        <h1 class="heading">Your farm at a glance</h1>
        <p class="sub">Welcome back, Ravi. Here’s what’s happening on your farm today.</p>
      </div>
      <button class="btn" onclick="toast('Your farm report is a demo')">${ico('clock')} Today</button>
    </div>

    <section class="welcome">
      <div class="welcome-text">
        <div class="eyebrow">SMARTER FARMING STARTS HERE</div>
        <h2>Healthy crops begin with better insights.</h2>
        <p>Get a clearer view of your crop health and find guidance for your next growing season.</p>
        <button class="btn primary" onclick="go('Disease Detection')">Analyze your crop ${ico('arrow')}</button>
      </div>
      <img class="welcome-image" src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85" alt="Green crops in a sunlit field">
    </section>

    <div class="grid features">
      <article class="card feature" onclick="go('Disease Detection')">
        <div class="feature-icon">${ico('leaf')}</div>
        <b>Disease detection</b>
        <p>Check a leaf image for possible issues.</p>
      </article>
      <article class="card feature" onclick="go('Weather Insights')">
        <div class="feature-icon">${ico('weather')}</div>
        <b>Weather insights</b>
        <p>See local conditions at a glance.</p>
      </article>
      <article class="card feature" onclick="go('AI Farming Assistant')">
        <div class="feature-icon">${ico('chat')}</div>
        <b>Farming assistant</b>
        <p>Explore answers to farming questions.</p>
      </article>
      <article class="card feature" onclick="go('Farming Recommendations')">
        <div class="feature-icon">${ico('spark')}</div>
        <b>Recommendations</b>
        <p>Discover practical growing tips.</p>
      </article>
    </div>

    <div class="grid dashboard-lower">
      <section class="card upload-card">
        <div class="row">
          <div>
            <h3 class="section-title">Check your crop health</h3>
            <span class="section-hint">Start with a clear photo of a crop leaf</span>
          </div>
          <button class="btn" onclick="go('Disease Detection')">Open tool ${ico('arrow')}</button>
        </div>
        <div class="upload-zone" id="dash-drop">
          <input type="file" accept="image/*" aria-label="Choose crop image">
          <div class="feature-icon">${ico('upload')}</div>
          <b>Drop a leaf photo here</b>
          <p>or click to select an image</p>
          <span class="small">JPG or PNG · up to 10 MB · Demo upload only</span>
        </div>
      </section>

      <section class="card weather-card">
        <div class="row">
          <h3 class="section-title">Weather snapshot</h3>
          <span class="sample">SAMPLE DATA</span>
        </div>
        <div class="weather-main">
          <div class="sun">☀️</div>
          <div>
            <div class="temp">28° <small>Partly cloudy</small></div>
            <span class="section-hint">Example location · Guntur, AP</span>
          </div>
        </div>
        <div class="weather-metrics">
          <div><span>Humidity</span><b>64%</b></div>
          <div><span>Wind</span><b>12 km/h</b></div>
          <div><span>Rain chance</span><b>20%</b></div>
        </div>
        <div class="disclaimer" style="border:0;margin-top:12px;padding:0;color:#9b7b38">
          Illustrative values only — no live weather connection.
        </div>
      </section>
    </div>

    <section class="card activity">
      <div class="row">
        <h3 class="section-title">Recent activity</h3>
        <span class="section-hint">Your latest activity</span>
      </div>
      <div class="activity-item">
        <div class="activity-icon">${ico('leaf')}</div>
        <div class="activity-copy"><b>Leaf image added to demo</b><small>Tomato · Today, 9:42 AM</small></div>
        <span class="status">No analysis run</span>
      </div>
      <div class="activity-item">
        <div class="activity-icon">${ico('chat')}</div>
        <div class="activity-copy"><b>Opened farming assistant</b><small>Recently</small></div>
        <span class="status">Viewed</span>
      </div>
    </section>
  `;
}

function disease() {
  return `
    <div class="eyebrow">CROP HEALTH</div>
    <h1 class="heading">AI Crop Disease Detection</h1>
    <p class="sub">Add a clear leaf photo and select the crop to explore an illustrative result.</p>

    <div class="grid two-col">
      <section class="card panel">
        <div class="row">
          <div>
            <h3 class="section-title">Upload a crop image</h3>
            <span class="section-hint">Use a bright, in-focus photo of one leaf</span>
          </div>
          <span class="sample">DEMO MODE</span>
        </div>

        <div class="upload-zone drop" id="disease-drop">
          <input type="file" accept="image/*" id="disease-file" aria-label="Choose crop image">
          <div id="drop-content">
            <div class="feature-icon">${ico('upload')}</div>
            <b>Drag and drop your image here</b>
            <p>or browse files on your device</p>
            <button class="btn" type="button">Choose image</button>
            <div class="small" style="margin-top:10px">PNG or JPG · Maximum 10 MB</div>
          </div>
        </div>

        <label class="section-hint" for="crop-select">Crop type</label>
        <div class="select-row">
          <select id="crop-select">
            <option>Tomato</option>
            <option>Potato</option>
            <option>Other</option>
          </select>
          <button class="btn primary" id="analyze">Explore sample result ${ico('arrow')}</button>
        </div>
        <div class="disclaimer" style="color:#7a857b;border:0;padding:13px 0 0">
          This demo does not analyze images. Sample results are illustrative and should not guide treatment decisions.
        </div>
      </section>

      <section class="card panel">
        <div class="row">
          <div>
            <h3 class="section-title">Detection results</h3>
            <span class="section-hint">Your result will appear here</span>
          </div>
        </div>
        <div id="result" class="result-placeholder">
          <div>
            <div class="feature-icon" style="margin:0 auto 12px;width:42px;height:42px">${ico('leaf')}</div>
            <b>Ready when you are</b>
            <p>Add an image, select your crop, then explore an example result.</p>
          </div>
        </div>
      </section>
    </div>
  `;
}

function assistant() {
  return `
    <div class="eyebrow">YOUR FARMING COMPANION</div>
    <h1 class="heading">AI Farming Assistant</h1>
    <p class="sub">Ask questions about crops, soil, and everyday farming practices.</p>

    <div class="grid chat-layout">
      <section class="card chat-card">
        <div class="chat-head">
          <div class="bot-avatar">${ico('spark')}</div>
          <div>
            <b>CropIQ Assistant</b>
            <span class="online">Demo conversation · Not connected to AI</span>
          </div>
          <select class="lang" id="language" aria-label="Language">
            <option>English</option>
            <option>తెలుగు</option>
          </select>
        </div>

        <div class="messages" id="messages">
          <div class="bubble">
            Namaste, Ravi! I can help you explore general farming topics. What would you like to learn about?
            <small>CropIQ Assistant · Demo</small>
          </div>
          <div class="suggestions">
            <button>How often should I water tomatoes?</button>
            <button>Tips for preparing healthy soil</button>
            <button>When is a good time to plant?</button>
          </div>
        </div>

        <form class="chat-compose" id="chat-form">
          <input id="chat-input" placeholder="Ask a farming question…" autocomplete="off" aria-label="Your question">
          <button class="send" aria-label="Send message">${ico('send')}</button>
        </form>
      </section>

      <aside>
        <section class="card topics">
          <h3>Explore topics</h3>
          <div class="topic">${ico('leaf')} Crop care & growth</div>
          <div class="topic">${ico('spark')} Soil health</div>
          <div class="topic">${ico('weather')} Water & irrigation</div>
          <div class="topic">${ico('dashboard')} Seasonal planning</div>
        </section>
        <div class="disclaimer-side">
          <b>Demo assistant</b><br>
          Replies are local sample guidance, not AI generated. For crop disease or chemical use, consult a qualified agricultural expert or local extension service.
        </div>
      </aside>
    </div>
  `;
}

function weatherPage() {
  return `
    <div class="eyebrow">LOCAL CONDITIONS</div>
    <h1 class="heading">Weather insights</h1>
    <p class="sub">A simple weather snapshot for your planning. All values below are sample data.</p>

    <section class="card panel" style="margin-top:22px">
      <div class="row">
        <div>
          <h3 class="section-title">Farm location</h3>
          <span class="section-hint">Choose an example location</span>
        </div>
        <span class="sample">SAMPLE DATA</span>
      </div>
      <div class="select-row">
        <select id="weather-location">
          <option>Guntur, Andhra Pradesh</option>
          <option>Warangal, Telangana</option>
          <option>Nashik, Maharashtra</option>
          <option>Coimbatore, Tamil Nadu</option>
        </select>
        <button class="btn" id="refresh-weather">${ico('weather')} Refresh sample</button>
      </div>
    </section>

    <div class="grid" style="grid-template-columns:repeat(4,1fr);margin-top:16px">
      <article class="card feature"><div class="feature-icon">☀</div><b>28°C · Partly cloudy</b><p>Current example conditions</p></article>
      <article class="card feature"><div class="feature-icon">◌</div><b>64% humidity</b><p>Example relative humidity</p></article>
      <article class="card feature"><div class="feature-icon">↗</div><b>12 km/h wind</b><p>Example wind speed</p></article>
      <article class="card feature"><div class="feature-icon">☂</div><b>20% rain chance</b><p>Example chance of rain</p></article>
    </div>

    <div class="grid dashboard-lower" style="margin-top:16px">
      <section class="card panel">
        <h3 class="section-title">Next 3 days</h3>
        <div class="activity-item"><div class="activity-icon">☀</div><div class="activity-copy"><b>Today · Partly cloudy</b><small>High 29° · Low 22°</small></div><span class="status">Sample</span></div>
        <div class="activity-item"><div class="activity-icon">☁</div><div class="activity-copy"><b>Tomorrow · Cloudy</b><small>High 28° · Low 21°</small></div><span class="status">Sample</span></div>
        <div class="activity-item"><div class="activity-icon">☂</div><div class="activity-copy"><b>Wednesday · Light showers</b><small>High 27° · Low 21°</small></div><span class="status">Sample</span></div>
      </section>
      <section class="card panel">
        <h3 class="section-title">Planning note</h3>
        <p class="sub" style="margin:12px 0">Weather can change quickly. Check a trusted local forecast before irrigation, spraying, or other time-sensitive decisions.</p>
        <span class="sample">NOT LIVE FORECAST</span>
      </section>
    </div>
  `;
}

function recommendations() {
  return `
    <div class="eyebrow">PRACTICAL FARMING</div>
    <h1 class="heading">Farming recommendations</h1>
    <p class="sub">Browse general growing reminders and save the ones you want to revisit.</p>

    <div class="row" style="margin-top:22px">
      <div class="suggestions" id="rec-filters">
        <button class="active-filter" data-filter="All">All tips</button>
        <button data-filter="Crop care">Crop care</button>
        <button data-filter="Soil">Soil</button>
        <button data-filter="Water">Water</button>
      </div>
      <span class="section-hint">General examples · adapt to your farm</span>
    </div>

    <div class="grid" id="rec-list" style="grid-template-columns:repeat(3,1fr);margin-top:10px">
      ${recCard('Crop care', 'Check leaves weekly', 'Look at both sides of leaves and note changes early. A consistent observation routine can help you spot issues sooner.', 'leaf')}
      ${recCard('Water', 'Water near the soil', 'When appropriate for your crop and soil, watering near the root zone can reduce evaporation. Check soil moisture before watering.', 'weather')}
      ${recCard('Soil', 'Build soil organic matter', 'Compost and other locally suitable organic matter can support soil structure. Use well-decomposed material and local guidance.', 'spark')}
      ${recCard('Crop care', 'Keep simple field notes', 'Record planting dates, irrigation, and visible changes. Notes make it easier to compare seasons and discuss issues with an advisor.', 'dashboard')}
      ${recCard('Water', 'Match irrigation to conditions', 'Consider crop stage, soil type, and recent rain before irrigating. Avoid relying on a generic schedule alone.', 'weather')}
      ${recCard('Soil', 'Test before adjusting nutrients', 'A soil test can help guide nutrient decisions. Ask a local extension service or soil lab about sampling for your region.', 'spark')}
    </div>

    <div class="disclaimer-side" style="margin-top:17px">
      <b>General information only.</b> These tips are examples, not personalized agronomic advice. Local conditions and crop varieties matter.
    </div>
  `;
}

function recCard(category, title, body, icon) {
  return `
    <article class="card panel rec-card" data-category="${category}">
      <div class="feature-icon">${ico(icon)}</div>
      <span class="eyebrow">${category.toUpperCase()}</span>
      <h3 class="section-title" style="margin:8px 0">${title}</h3>
      <p class="sub" style="font-size:12px">${body}</p>
      <button class="btn save-tip" style="margin-top:15px">☆ Save tip</button>
    </article>
  `;
}

function settingsPage() {
  const cfg = JSON.parse(localStorage.getItem('cropiq-settings') || '{}');

  return `
    <div class="eyebrow">YOUR ACCOUNT</div>
    <h1 class="heading">Settings</h1>
    <p class="sub">Update your local demo preferences.</p>

    <section class="card panel" style="margin-top:22px;max-width:720px">
      <h3 class="section-title">Farm profile</h3>
      <p class="section-hint">These preferences are saved in this browser only.</p>

      <label class="section-hint" for="settings-name" style="display:block;margin-top:20px">Your name</label>
      <input id="settings-name" value="${escapeHtml(cfg.name || 'Ravi Kumar')}" class="settings-input">

      <label class="section-hint" for="settings-location" style="display:block;margin-top:16px">Farm location</label>
      <select id="settings-location" class="settings-input">
        <option ${cfg.location === 'Guntur, Andhra Pradesh' || !cfg.location ? 'selected' : ''}>Guntur, Andhra Pradesh</option>
        <option ${cfg.location === 'Warangal, Telangana' ? 'selected' : ''}>Warangal, Telangana</option>
        <option ${cfg.location === 'Nashik, Maharashtra' ? 'selected' : ''}>Nashik, Maharashtra</option>
        <option ${cfg.location === 'Coimbatore, Tamil Nadu' ? 'selected' : ''}>Coimbatore, Tamil Nadu</option>
      </select>

      <label class="section-hint" for="settings-language" style="display:block;margin-top:16px">Preferred language</label>
      <select id="settings-language" class="settings-input">
        <option ${cfg.language === 'English' || !cfg.language ? 'selected' : ''}>English</option>
        <option ${cfg.language === 'తెలుగు' ? 'selected' : ''}>తెలుగు</option>
      </select>

      <div class="row" style="justify-content:flex-start;margin-top:20px">
        <button class="btn primary" id="save-settings">Save preferences</button>
        <button class="btn" id="reset-settings">Reset</button>
      </div>
    </section>
  `;
}

function bind() {
  const file = document.querySelector('#disease-file');

  if (file) {
    file.addEventListener('change', () => showPreview(file.files[0]));

    document.querySelector('#analyze').onclick = () => {
      const crop = document.querySelector('#crop-select').value;
      document.querySelector('#result').className = 'result-box';
      document.querySelector('#result').innerHTML = `
        <span class="demo-label">ILLUSTRATIVE SAMPLE</span>
        <h3 style="margin-top:13px">Example: ${crop} leaf health</h3>
        <p>This is placeholder content to demonstrate how an analysis result could appear. No image was analyzed.</p>
        <div class="row"><span class="section-hint">Illustrative confidence</span><b style="font-size:11px">78%*</b></div>
        <div class="confidence"><i></i></div>
        <div class="disclaimer">*Fictional confidence value for UI demonstration only. Do not use for diagnosis or treatment.</div>
      `;
    };
  }

  const dashboardFile = document.querySelector('#dash-drop input');

  if (dashboardFile) {
    dashboardFile.onchange = () => {
      if (!dashboardFile.files[0]) return;

      go('Disease Detection');

      setTimeout(() => {
        const diseaseFile = document.querySelector('#disease-file');

        if (diseaseFile) {
          const transfer = new DataTransfer();
          transfer.items.add(dashboardFile.files[0]);
          diseaseFile.files = transfer.files;
          diseaseFile.dispatchEvent(new Event('change'));
        }
      }, 20);
    };
  }

  const form = document.querySelector('#chat-form');

  if (form) {
    form.onsubmit = event => {
      event.preventDefault();
      sendMsg();
    };

    document.querySelectorAll('#messages .suggestions button').forEach(button => {
      button.onclick = () => sendMsg(button.textContent);
    });
  }

  const weatherSelect = document.querySelector('#weather-location');

  if (weatherSelect) {
    const key = 'cropiq-weather-location';
    if (localStorage.getItem(key)) weatherSelect.value = localStorage.getItem(key);
    weatherSelect.onchange = () => localStorage.setItem(key, weatherSelect.value);
    document.querySelector('#refresh-weather').onclick = () =>
      toast('Sample weather refreshed for ' + weatherSelect.value);
  }

  const filters = document.querySelector('#rec-filters');

  if (filters) {
    filters.onclick = event => {
      const button = event.target.closest('button');
      if (!button) return;

      filters.querySelectorAll('button').forEach(item => {
        item.classList.toggle('active-filter', item === button);
      });

      document.querySelectorAll('.rec-card').forEach(card => {
        card.classList.toggle(
          'hidden',
          button.dataset.filter !== 'All' && card.dataset.category !== button.dataset.filter
        );
      });
    };

    document.querySelectorAll('.save-tip').forEach((button, index) => {
      const saved = JSON.parse(localStorage.getItem('cropiq-saved-tips') || '[]');

      if (saved.includes(index)) {
        button.classList.add('saved');
        button.textContent = '★ Saved';
      }

      button.onclick = () => {
        const list = JSON.parse(localStorage.getItem('cropiq-saved-tips') || '[]');

        if (list.includes(index)) {
          const next = list.filter(item => item !== index);
          localStorage.setItem('cropiq-saved-tips', JSON.stringify(next));
          button.classList.remove('saved');
          button.textContent = '☆ Save tip';
        } else {
          list.push(index);
          localStorage.setItem('cropiq-saved-tips', JSON.stringify(list));
          button.classList.add('saved');
          button.textContent = '★ Saved';
        }
      };
    });
  }

  const saveButton = document.querySelector('#save-settings');

  if (saveButton) {
    saveButton.onclick = () => {
      localStorage.setItem('cropiq-settings', JSON.stringify({
        name: document.querySelector('#settings-name').value,
        location: document.querySelector('#settings-location').value,
        language: document.querySelector('#settings-language').value
      }));
      toast('Preferences saved on this device');
    };
  }

  const resetButton = document.querySelector('#reset-settings');

  if (resetButton) {
    resetButton.onclick = () => {
      localStorage.removeItem('cropiq-settings');
      localStorage.removeItem('cropiq-weather-location');
      render();
      toast('Preferences reset');
    };
  }
}

function showPreview(file) {
  if (!file) return;

  const url = URL.createObjectURL(file);
  const drop = document.querySelector('#disease-drop');
  drop.classList.add('has-image');

  document.querySelector('#drop-content').innerHTML = `
    <img src="${url}" alt="Selected crop image">
    <div class="section-hint" style="margin-top:8px">${escapeHtml(file.name)} · Preview only</div>
  `;
}

function sendMsg(text) {
  const input = document.querySelector('#chat-input');
  const question = (text || input?.value || '').trim();

  if (!question) return;

  const messages = document.querySelector('#messages');
  if (!messages) return;

  messages.insertAdjacentHTML('beforeend', `
    <div class="bubble mine">${escapeHtml(question)}<small>You</small></div>
    <div class="bubble">
      I’m a local UI demo, so I can’t generate a tailored answer yet. For this topic, consider asking your local agricultural extension service for advice suited to your crop and region.
      <small>Sample response · Not AI generated</small>
    </div>
  `);

  if (input) input.value = '';
  messages.scrollTop = messages.scrollHeight;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

let toastTimer;

function toast(message) {
  const toastElement = document.querySelector('#toast');
  toastElement.innerHTML = `<div class="toast">${message}</div>`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastElement.innerHTML = '';
  }, 2500);
}

render();