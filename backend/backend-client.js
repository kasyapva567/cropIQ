/* Optional Flask API integration for the standalone CropIQ page. */
(() => {
  async function api(path, options = {}) {
    const response = await fetch(`/api${path}`, options);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(body.error?.message || 'The server could not complete this request.');
      error.code = body.error?.code;
      error.status = response.status;
      throw error;
    }
    return body;
  }

  const safe = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);

  function savedTipButtons() {
    document.querySelectorAll('.save-tip').forEach(button => {
      const card = button.closest('.rec-card');
      const id = card?.dataset.id || card?.querySelector('h3')?.textContent || '';
      const saved = JSON.parse(localStorage.getItem('cropiq-saved-tips') || '[]');
      button.classList.toggle('saved', saved.includes(id));
      button.textContent = saved.includes(id) ? '★ Saved' : '☆ Save tip';
      button.onclick = () => {
        const current = JSON.parse(localStorage.getItem('cropiq-saved-tips') || '[]');
        const next = current.includes(id) ? current.filter(item => item !== id) : [...current, id];
        localStorage.setItem('cropiq-saved-tips', JSON.stringify(next));
        button.classList.toggle('saved', next.includes(id));
        button.textContent = next.includes(id) ? '★ Saved' : '☆ Save tip';
      };
    });
  }

  async function updateWeather() {
    const select = document.querySelector('#weather-location');
    if (!select) return;
    try {
      const data = await api(`/weather?location=${encodeURIComponent(select.value)}`);
      const c = data.current;
      const target = document.querySelector('#weather-current');
      if (target) target.innerHTML = [
        ['☀', `${c.temperature_c}°C · ${c.condition}`, 'Current example conditions'],
        ['◌', `${c.humidity_percent}% humidity`, 'Example relative humidity'],
        ['↗', `${c.wind_kmh} km/h wind`, 'Example wind speed'],
        ['☂', `${c.rain_chance_percent}% rain chance`, 'Example chance of rain']
      ].map(([icon, title, note]) => `<article class="card feature"><div class="feature-icon">${icon}</div><b>${safe(title)}</b><p>${note}</p></article>`).join('');
      const forecast = document.querySelector('#weather-forecast');
      if (forecast) forecast.innerHTML = data.forecast.map(day => `<div class="activity-item"><div class="activity-icon">☀</div><div class="activity-copy"><b>${safe(day.day)} · ${safe(day.condition)}</b><small>High ${day.high_c}° · Low ${day.low_c}°</small></div><span class="status">Sample</span></div>`).join('');
    } catch (error) {
      console.warn('Weather API unavailable:', error.message);
    }
  }

  async function updateRecommendations(category = 'All') {
    const target = document.querySelector('#rec-list');
    if (!target) return;
    try {
      const data = await api(`/recommendations?category=${encodeURIComponent(category)}`);
      target.innerHTML = data.items.map(item => `<article class="card panel rec-card" data-id="${safe(item.id)}" data-category="${safe(item.category)}"><div class="feature-icon">${item.category === 'Water' ? '☼' : item.category === 'Soil' ? '✦' : '♧'}</div><span class="eyebrow">${safe(item.category.toUpperCase())}</span><h3 class="section-title" style="margin:8px 0">${safe(item.title)}</h3><p class="sub" style="font-size:12px">${safe(item.body)}</p><button class="btn save-tip" style="margin-top:15px">☆ Save tip</button></article>`).join('');
      savedTipButtons();
    } catch (error) {
      console.warn('Recommendations API unavailable:', error.message);
    }
  }

  function showDiseaseError(message, code = 'request_failed') {
    const result = document.querySelector('#result');
    if (!result) return;
    result.className = 'result-box';
    result.innerHTML = `<span class="demo-label">${code === 'model_not_configured' ? 'MODEL NOT CONFIGURED' : 'REQUEST FAILED'}</span><p>${safe(message)}</p><div class="disclaimer">No diagnosis was produced. A trained crop disease model must be connected before analysis is available.</div>`;
  }

  async function analyze() {
    const file = document.querySelector('#disease-file')?.files?.[0];
    const button = document.querySelector('#analyze');
    if (!file) return showDiseaseError('Select an image first.', 'image_required');
    const form = new FormData();
    form.append('image', file);
    form.append('crop', document.querySelector('#crop-select')?.value || 'Other');
    button.disabled = true;
    button.textContent = 'Sending image…';
    try {
      await api('/disease/analyze', { method: 'POST', body: form });
      showDiseaseError('The backend did not return an analysis result.', 'request_failed');
    } catch (error) {
      showDiseaseError(error.message, error.code);
    } finally {
      button.disabled = false;
      button.textContent = 'Analyze image';
    }
  }

  async function sendToBackend(text) {
    const input = document.querySelector('#chat-input');
    const question = (text || input?.value || '').trim();
    const messages = document.querySelector('#messages');
    if (!question || !messages) return;
    messages.insertAdjacentHTML('beforeend', `<div class="bubble mine">${safe(question)}<small>You</small></div>`);
    if (input) input.value = '';
    try {
      const data = await api('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, language: document.querySelector('#language')?.value || 'English' })
      });
      messages.insertAdjacentHTML('beforeend', `<div class="bubble">${safe(data.reply)}<small>Local demo response · Not AI generated</small></div>`);
    } catch (error) {
      messages.insertAdjacentHTML('beforeend', `<div class="bubble">Could not reach the Flask backend. Start it with the instructions in backend/README.md.<small>Connection error</small></div>`);
    }
    messages.scrollTop = messages.scrollHeight;
  }

  async function loadSettings() {
    try {
      const data = await api('/settings');
      document.querySelector('#settings-name').value = data.name;
      document.querySelector('#settings-location').value = data.location;
      document.querySelector('#settings-language').value = data.language;
    } catch (error) {
      console.warn('Settings API unavailable:', error.message);
    }
  }

  function bindBackendHandlers() {
    const analyzeButton = document.querySelector('#analyze');
    if (analyzeButton) analyzeButton.onclick = analyze;

    const form = document.querySelector('#chat-form');
    if (form) form.onsubmit = event => { event.preventDefault(); sendToBackend(); };
    document.querySelectorAll('#messages .suggestions button').forEach(button => {
      button.onclick = () => sendToBackend(button.textContent);
    });

    const weather = document.querySelector('#weather-location');
    if (weather) {
      const remembered = localStorage.getItem('cropiq-weather-location');
      if (remembered) weather.value = remembered;
      weather.onchange = () => { localStorage.setItem('cropiq-weather-location', weather.value); updateWeather(); };
      const refresh = document.querySelector('#refresh-weather');
      if (refresh) refresh.onclick = async () => { await updateWeather(); toast('Sample weather refreshed for ' + weather.value); };
      updateWeather();
    }

    const filters = document.querySelector('#rec-filters');
    if (filters) filters.onclick = event => {
      const button = event.target.closest('button');
      if (!button) return;
      filters.querySelectorAll('button').forEach(item => item.classList.toggle('active-filter', item === button));
      updateRecommendations(button.dataset.filter);
    };

    const save = document.querySelector('#save-settings');
    if (save) save.onclick = async () => {
      const settings = {
        name: document.querySelector('#settings-name').value.trim(),
        location: document.querySelector('#settings-location').value,
        language: document.querySelector('#settings-language').value
      };
      try {
        await api('/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
        localStorage.setItem('cropiq-settings', JSON.stringify(settings));
        localStorage.setItem('cropiq-weather-location', settings.location);
        toast('Preferences saved to the backend');
      } catch (error) { toast(error.message); }
    };

    const reset = document.querySelector('#reset-settings');
    if (reset) reset.onclick = async () => {
      try { await api('/settings', { method: 'DELETE' }); } catch (error) { console.warn(error.message); }
      localStorage.removeItem('cropiq-settings');
      localStorage.removeItem('cropiq-weather-location');
      render();
      toast('Preferences reset');
    };

    const recommendations = document.querySelector('#rec-list');
    if (recommendations) savedTipButtons();
  }

  const previousRender = window.render;
  window.render = function () {
    previousRender();
    bindBackendHandlers();
    if (document.querySelector('#rec-list')) updateRecommendations();
    if (document.querySelector('#settings-name')) loadSettings();
  };

  bindBackendHandlers();
  if (document.querySelector('#rec-list')) updateRecommendations();
  if (document.querySelector('#settings-name')) loadSettings();
})();
