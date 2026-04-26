'use strict';

// ============================================================
// PRODUCT DATA — mockado com base em dados Q1/26
// ============================================================

const PRODUCTS = {
  cdb: {
    issuer:         'Banco Inter',
    name:           'CDB Pós-Fixado',
    navTitle:       'CDB Banco Inter',
    rate:           14.2,
    rateDisplay:    '14,2%',
    cdi:            '97% CDI',
    maturity:       '24/04/2027',
    liquidity:      'Diária',
    liquidityOk:    true,
    protection:     'FGC até R$ 250k',
    min:            100,
    asset_id:       'cdb-banco-inter',
    asset_type:     'cdb',
    position:       1,
    is_highlighted: true,
  },
  tesouro: {
    issuer:         'Tesouro Nacional',
    name:           'Tesouro Selic 2027',
    navTitle:       'Tesouro Selic 2027',
    rate:           14.75,
    rateDisplay:    '14,75%',
    cdi:            '101% CDI',
    maturity:       '01/03/2027',
    liquidity:      'D+1',
    liquidityOk:    true,
    protection:     'Garantia do governo',
    min:            30,
    asset_id:       'tesouro-selic-2027',
    asset_type:     'tesouro_direto',
    position:       2,
    is_highlighted: false,
  },
  lci: {
    issuer:         'Banco BTG',
    name:           'LCI Pós-Fixada',
    navTitle:       'LCI Banco BTG',
    rate:           13.5,
    rateDisplay:    '13,5%',
    cdi:            '92% CDI',
    maturity:       '24/10/2026',
    liquidity:      'No vencimento',
    liquidityOk:    false,
    protection:     'FGC até R$ 250k',
    min:            500,
    asset_id:       'lci-banco-btg',
    asset_type:     'lci',
    position:       3,
    is_highlighted: false,
  },
};

const BALANCE    = 500;
const SCREEN_IDS = ['screen-1', 'screen-2', 'screen-3'];
const NAV_LABELS = ['Home', 'Investir', 'Carteira', 'Cripto', 'Perfil'];

// ============================================================
// MOCK SESSION — substitui dados reais no protótipo
// ============================================================

const USER_ID   = 'user_mock_001';
const PLAN_TYPE = 'conservador';

// ============================================================
// ANALYTICS — helper de tracking
// ============================================================

function track(event_name, properties) {
  console.log('[Analytics]', event_name, { ...properties, _timestamp: new Date().toISOString() });
}

// ============================================================
// STATE
// ============================================================

let currentIndex      = 0;
let navHistory        = [];
let selectedProduct   = PRODUCTS.cdb;
let isAppMode         = false;
let toastTimer        = null;
let inputValueOnFocus = 0;

// ============================================================
// HELPERS — formatação monetária
// ============================================================

function fmt(value) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseInput(str) {
  if (!str) return 0;
  const s = str.trim();
  if (s.includes('.') && s.includes(',')) {
    return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
  }
  if (s.includes(',')) {
    return parseFloat(s.replace(',', '.')) || 0;
  }
  return parseFloat(s) || 0;
}

// ============================================================
// NAVEGAÇÃO
// ============================================================

function getScreen(index) {
  return document.getElementById(SCREEN_IDS[index]);
}

function trackScreenView(index) {
  if (index === 0) {
    track('account_approved_screen', {
      user_id:     USER_ID,
      plan_type:   PLAN_TYPE,
      entry_point: 'kyc_approved',
    });
  } else if (index === 1) {
    track('product_suggestion_screen', {
      user_id:            USER_ID,
      plan_type:          PLAN_TYPE,
      suitability_profile: PLAN_TYPE,
      products_shown_count: 3,
      entry_point:        currentIndex === 0 ? 'account_approved' : 'investment_confirmation',
    });
  } else if (index === 2) {
    track('investment_confirmation_screen', {
      user_id:              USER_ID,
      asset_id:             selectedProduct.asset_id,
      asset_name:           selectedProduct.name,
      asset_type:           selectedProduct.asset_type,
      asset_rate:           selectedProduct.rate,
      pre_filled_amount_brl: Math.max(selectedProduct.min, 250),
      plan_type:            PLAN_TYPE,
      entry_point:          'product_suggestion',
    });
  }
}

function goTo(index, direction) {
  if (index === currentIndex) return;

  if (currentIndex === 2) hideSuccess();

  const leaving  = getScreen(currentIndex);
  const arriving = getScreen(index);

  leaving.classList.remove('screen-active');

  arriving.classList.add('screen-active');
  arriving.classList.add(direction === 'back' ? 'screen-enter-left' : 'screen-enter-right');
  arriving.addEventListener('animationend', () => {
    arriving.classList.remove('screen-enter-right', 'screen-enter-left');
  }, { once: true });

  currentIndex = index;
  syncModeSteps();
  arriving.scrollTop = 0;
}

function navigateTo(index) {
  navHistory.push(currentIndex);
  trackScreenView(index);
  goTo(index, 'forward');
}

function navigateBack() {
  if (navHistory.length === 0) return;
  const dest = navHistory[navHistory.length - 1];
  trackScreenView(dest);
  goTo(navHistory.pop(), 'back');
}

function syncModeSteps() {
  document.querySelectorAll('.mode-step').forEach((el, i) => {
    el.classList.toggle('mode-step--active', i === currentIndex);
    el.classList.toggle('mode-step--done',   i < currentIndex);
    if (i > currentIndex) el.classList.remove('mode-step--active');
  });
}

// ============================================================
// APP MODE TOGGLE
// ============================================================

function enterAppMode() {
  isAppMode = true;
  document.body.classList.add('app-mode-body');
  document.getElementById('prototype-canvas').classList.add('app-mode');
  document.getElementById('mode-bar-static').hidden = true;
  document.getElementById('mode-bar-app').hidden = false;

  navHistory   = [];
  currentIndex = 0;
  SCREEN_IDS.forEach((id, i) => {
    const el = document.getElementById(id);
    el.classList.toggle('screen-active', i === 0);
    el.classList.remove('screen-enter-right', 'screen-enter-left');
  });

  syncModeSteps();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Tela 1 torna-se visível ao entrar no Modo App
  track('account_approved_screen', {
    user_id:     USER_ID,
    plan_type:   PLAN_TYPE,
    entry_point: 'kyc_approved',
  });
}

function exitAppMode() {
  isAppMode = false;
  document.body.classList.remove('app-mode-body');
  document.getElementById('prototype-canvas').classList.remove('app-mode');
  document.getElementById('mode-bar-static').hidden = false;
  document.getElementById('mode-bar-app').hidden = true;

  SCREEN_IDS.forEach(id => {
    document.getElementById(id).classList.remove(
      'screen-active', 'screen-enter-right', 'screen-enter-left'
    );
  });

  hideSuccess();
}

// ============================================================
// TELA 3 — PREENCHIMENTO DINÂMICO DO PRODUTO
// ============================================================

function populateScreen3(product) {
  selectedProduct = product;

  document.getElementById('nav-title-3').textContent    = product.navTitle;
  document.getElementById('ps-issuer').textContent      = product.issuer;
  document.getElementById('ps-name').textContent        = product.name;
  document.getElementById('ps-rate').textContent        = product.rateDisplay;
  document.getElementById('ps-cdi').textContent         = product.cdi;
  document.getElementById('ps-maturity').textContent    = product.maturity;
  document.getElementById('ps-protection').textContent  = product.protection;

  const liqEl = document.getElementById('ps-liquidity');
  liqEl.textContent = product.liquidity;
  liqEl.classList.toggle('detail-value--success', product.liquidityOk);

  document.getElementById('input-hint').innerHTML =
    `Mínimo: R$ ${fmt(product.min)} &nbsp;·&nbsp; Saldo disponível: R$ ${fmt(BALANCE)}`;

  const defaultVal = Math.max(product.min, 250);
  const inputEl    = document.getElementById('input-valor');
  inputEl.value    = fmt(defaultVal);
  clearInputError();
  updateProjection(defaultVal);
}

// ============================================================
// PROJEÇÃO EM TEMPO REAL
// ============================================================

function updateProjection(valor) {
  const gain  = valor * (selectedProduct.rate / 100);
  const total = valor + gain;

  document.getElementById('proj-value').textContent = `R$ ${fmt(total)}`;
  document.getElementById('proj-gain').textContent  = `+R$ ${fmt(gain)}`;
  document.getElementById('proj-note').innerHTML    =
    `Sobre R$ ${fmt(valor)} investidos &nbsp;·&nbsp; Bruto antes do IR`;
}

// ============================================================
// VALIDAÇÃO DO INPUT
// ============================================================

function validateInput(valor) {
  if (valor <= 0) {
    return showInputError('Digite um valor para investir.');
  }
  if (valor < selectedProduct.min) {
    return showInputError(`Valor mínimo: R$ ${fmt(selectedProduct.min)}`);
  }
  if (valor > BALANCE) {
    return showInputError(`Saldo insuficiente. Disponível: R$ ${fmt(BALANCE)}`);
  }
  clearInputError();
  return true;
}

function showInputError(msg) {
  document.getElementById('input-error').textContent    = msg;
  document.getElementById('input-error').style.display  = 'block';
  document.getElementById('input-wrapper').classList.add('input-error');
  return false;
}

function clearInputError() {
  document.getElementById('input-error').style.display  = 'none';
  document.getElementById('input-wrapper').classList.remove('input-error');
}

// ============================================================
// TOAST
// ============================================================

function showToast(msg, duration = 2600) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('toast-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('toast-visible'), duration);
}

// ============================================================
// MODAL DE SUCESSO
// ============================================================

function showSuccess(valor) {
  document.getElementById('success-amount').textContent  = `R$ ${fmt(valor)}`;
  document.getElementById('success-product').textContent =
    `${selectedProduct.name} — ${selectedProduct.issuer}`;
  document.getElementById('success-overlay').style.display = 'flex';
}

function hideSuccess() {
  document.getElementById('success-overlay').style.display = 'none';
}

// ============================================================
// GUARDRAIL — avisa se tentar interagir no modo estático
// ============================================================

function requireAppMode(label) {
  if (!isAppMode) {
    showToast(`Clique em "Modo App" para ${label}.`);
    return false;
  }
  return true;
}

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  populateScreen3(PRODUCTS.cdb);

  // --- Mode bar ---
  // Controles do protótipo (não são interações do produto final)
  // Evento sugerido seguindo padrão {objeto}_{ação} do guia ArenaCash
  document.getElementById('btn-enter-app').addEventListener('click', () => {
    track('prototype_app_mode_enter_click', {
      user_id: USER_ID,
    });
    enterAppMode();
  });

  document.getElementById('btn-exit-app').addEventListener('click', () => {
    track('prototype_app_mode_exit_click', {
      user_id:     USER_ID,
      screen_name: ['account_approved', 'product_suggestion', 'investment_confirmation'][currentIndex],
    });
    exitAppMode();
  });

  // --- Tela 1: CTA primário — "Fazer meu primeiro investimento" ---
  document.getElementById('btn-start').addEventListener('click', () => {
    if (!requireAppMode('navegar')) return;
    track('guided_onboarding_click', {
      user_id:     USER_ID,
      plan_type:   PLAN_TYPE,
      screen_name: 'account_approved',
    });
    navigateTo(1);
  });

  // --- Tela 1: CTA terciário — "Explorar o app por conta própria" ---
  document.getElementById('btn-skip').addEventListener('click', () => {
    if (!requireAppMode('navegar')) return;
    track('self_explore_click', {
      user_id:     USER_ID,
      plan_type:   PLAN_TYPE,
      screen_name: 'account_approved',
    });
    showToast('Tudo certo — explore à vontade.');
    navigateTo(1);
  });

  // --- Tela 2: botão voltar ---
  document.getElementById('back-2').addEventListener('click', () => {
    if (!isAppMode) return;
    track('product_suggestion_back_click', {
      user_id:           USER_ID,
      screen_name:       'product_suggestion',
      destination_screen: 'account_approved',
    });
    navigateBack();
  });

  // --- Tela 2: botões "Investir" em cada card de produto ---
  const PRODUCT_KEYS = ['cdb', 'tesouro', 'lci'];
  document.querySelectorAll('[data-product]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!requireAppMode('navegar')) return;
      const key     = btn.dataset.product;
      const product = PRODUCTS[key];
      if (!product) return;
      track('product_invest_click', {
        user_id:        USER_ID,
        asset_id:       product.asset_id,
        asset_name:     product.name,
        asset_type:     product.asset_type,
        asset_rate:     product.rate,
        position_in_list: product.position,
        is_highlighted: product.is_highlighted,
        entry_point:    'product_suggestion',
      });
      populateScreen3(product);
      navigateTo(2);
    });
  });

  // --- Tela 2: bottom navigation ---
  document.querySelectorAll('.bottom-nav__item').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      track('bottom_nav_click', {
        user_id:     USER_ID,
        tab_selected: NAV_LABELS[i].toLowerCase(),
        screen_name: 'product_suggestion',
        entry_point: 'onboarding_flow',
      });
      if (i === 0) return; // Home já está ativo
      showToast(`Seção "${NAV_LABELS[i]}" não está disponível neste protótipo.`);
    });
  });

  // --- Tela 3: botão voltar ---
  document.getElementById('back-3').addEventListener('click', () => {
    if (!isAppMode) return;
    const valor = parseInput(document.getElementById('input-valor').value);
    track('investment_confirmation_back_click', {
      user_id:     USER_ID,
      screen_name: 'investment_confirmation',
      asset_id:    selectedProduct.asset_id,
      amount_brl:  valor,
    });
    navigateBack();
  });

  // --- Tela 3: input de valor ---
  const inputEl = document.getElementById('input-valor');

  inputEl.addEventListener('focus', () => {
    inputValueOnFocus = parseInput(inputEl.value);
    const v = parseInput(inputEl.value);
    inputEl.value = v > 0 ? String(v).replace('.', ',') : '';
    setTimeout(() => inputEl.select(), 0);
  });

  inputEl.addEventListener('input', () => {
    const valor = parseInput(inputEl.value);
    updateProjection(valor > 0 ? valor : 0);
    if (inputEl.value.length > 0) validateInput(valor);
    else clearInputError();
  });

  inputEl.addEventListener('blur', () => {
    const valor = parseInput(inputEl.value);
    const safe  = (valor > 0) ? valor : Math.max(selectedProduct.min, 250);
    inputEl.value = fmt(safe);
    updateProjection(safe);
    validateInput(safe);

    if (safe !== inputValueOnFocus) {
      track('investment_amount_changed', {
        user_id:          USER_ID,
        asset_id:         selectedProduct.asset_id,
        previous_amount_brl: inputValueOnFocus,
        new_amount_brl:   safe,
        is_below_minimum: safe < selectedProduct.min,
        is_above_balance: safe > BALANCE,
      });
    }
  });

  // --- Tela 3: confirmar aplicação ---
  document.getElementById('btn-confirm').addEventListener('click', () => {
    if (!requireAppMode('confirmar')) return;
    const valor = parseInput(inputEl.value);

    if (!validateInput(valor)) {
      const wrapper = document.getElementById('input-wrapper');
      wrapper.classList.add('input-shake');
      wrapper.addEventListener('animationend', () => wrapper.classList.remove('input-shake'), { once: true });

      let error_type;
      if (valor <= 0)                    error_type = 'empty';
      else if (valor < selectedProduct.min) error_type = 'below_minimum';
      else                               error_type = 'above_balance';

      track('investment_amount_error', {
        user_id:          USER_ID,
        asset_id:         selectedProduct.asset_id,
        amount_entered_brl: valor,
        error_type,
      });
      return;
    }

    track('investment_confirm_click', {
      user_id:           USER_ID,
      asset_id:          selectedProduct.asset_id,
      asset_name:        selectedProduct.name,
      asset_type:        selectedProduct.asset_type,
      asset_rate:        selectedProduct.rate,
      amount_brl:        valor,
      plan_type:         PLAN_TYPE,
      is_first_investment: true,
      entry_point:       'product_suggestion',
    });

    showSuccess(valor);

    track('investment_completed', {
      user_id:           USER_ID,
      asset_id:          selectedProduct.asset_id,
      asset_name:        selectedProduct.name,
      amount_brl:        valor,
      plan_type:         PLAN_TYPE,
      is_first_investment: true,
    });
  });

  // --- Tela 3: escolher outro produto ---
  document.getElementById('btn-choose-other').addEventListener('click', () => {
    if (!requireAppMode('navegar')) return;
    const valor = parseInput(inputEl.value);
    track('choose_other_product_click', {
      user_id:     USER_ID,
      asset_id:    selectedProduct.asset_id,
      asset_name:  selectedProduct.name,
      amount_brl:  valor,
      screen_name: 'investment_confirmation',
    });
    navigateBack();
  });

  // --- Modal de sucesso: ver carteira ---
  document.getElementById('btn-success-portfolio').addEventListener('click', () => {
    const valor = parseInput(inputEl.value);
    track('success_portfolio_click', {
      user_id:           USER_ID,
      asset_id:          selectedProduct.asset_id,
      amount_brl:        valor,
      is_first_investment: true,
    });
    hideSuccess();
    navHistory = [];
    goTo(1, 'forward');
    showToast('Você já tem investimentos ativos. Bem-vindo à ArenaCash!');
  });

  // --- Modal de sucesso: fazer outro investimento ---
  document.getElementById('btn-success-new').addEventListener('click', () => {
    const valor = parseInput(inputEl.value);
    track('success_new_investment_click', {
      user_id:           USER_ID,
      asset_id:          selectedProduct.asset_id,
      amount_brl:        valor,
      is_first_investment: true,
    });
    hideSuccess();
    navHistory = [0];
    goTo(1, 'back');
  });

});
