/**
 * OhmKit Layout Manager
 * Handles responsive navigation injection, page shell, and shared features.
 */

const LayoutManager = {
  /**
   * Layout Initialization
   */
  init(config) {
    const { title, activeId, rootPath = '' } = config;
    this.config = config;
    this.rootPath = rootPath;
    this.activeId = activeId;

    // Inject Favicon and SEO tags dynamically
    this.injectHeadTags();

    // Create container if not exists
    let container = document.querySelector('.app-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'app-container';
      document.body.prepend(container);
    }

    // Ensure main-content exists (for pages that don't have it in HTML)
    let main = container.querySelector('.main-content');
    if (!main) {
      main = document.createElement('main');
      main.className = 'main-content';
      container.appendChild(main);
    }

    // Render Sidebar
    const navItems = this.getNavLinks();
    const iconPath = `${this.rootPath}img/iconfdg.png`;
    
    container.insertAdjacentHTML('afterbegin', `
      <aside class="sidebar">
        <div class="sidebar-logo">
          <div class="logo-box">
            <img src="${iconPath}" alt="Logo" class="sidebar-logo-img">
            <span class="logo-glow"></span>
          </div>
          <span class="logo-text">OHMKIT</span>
        </div>
        <nav class="sidebar-nav">
          ${navItems}
        </nav>
      </aside>
    `);

    // Render Header
    const isTool = !!config.tool;
    const headerIcon = config.icon || (isTool ? '' : '🏠');
    
    main.insertAdjacentHTML('afterbegin', `
      <header class="app-header">
        <div class="header-left">
          ${isTool ? `
            <button class="back-btn" onclick="history.back()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
          ` : `
            <div class="category-icon">${headerIcon}</div>
          `}
          <h1 class="header-title">${title}</h1>
        </div>
        <div class="header-actions" id="header-actions">
          <!-- Dynamic actions injected here -->
        </div>
      </header>
    `);

    // Render Bottom Nav (Mobile)
    const bottomNavItems = this.getBottomNavLinks();
    container.insertAdjacentHTML('beforeend', `
      <nav class="bottom-nav">
        ${bottomNavItems}
      </nav>
    `);

    // Initialize Favorites if tool info is provided and not disabled
    if (config.tool && !config.noFavorite) {
      this.initFavoriteAction(config.tool);
    }
  },

  /**
   * Navigation Helpers
   */
  getNavLinks() {
    const links = [
      { id: 'home', label: 'Home', icon: '🏠', url: 'MainScreen/Home/main_screen.html' },
      { id: 'calculators', label: 'Calculators', icon: '🧮', url: 'MainScreen/calculator/calculator.html' },
      { id: 'converters', label: 'Converters', icon: '🔄', url: 'MainScreen/Converter/converter.html' },
      { id: 'circuits', label: 'Circuits', icon: '🔌', url: 'MainScreen/Circuit/circuit.html' },
      { id: 'references', label: 'References', icon: '📚', url: 'MainScreen/Reference/references.html' },
    ];

    return links.map(link => `
      <a href="${this.rootPath}${link.url}" class="nav-link ${this.activeId === link.id ? 'active' : ''}">
        <span class="nav-icon">${link.icon}</span>
        <span>${link.label}</span>
      </a>
    `).join('');
  },

  getBottomNavLinks() {
    const links = [
      { id: 'home', label: 'Home', icon: '🏠', url: 'MainScreen/Home/main_screen.html' },
      { id: 'calculators', label: 'Calcs', icon: '🧮', url: 'MainScreen/calculator/calculator.html' },
      { id: 'converters', label: 'Conv', icon: '🔄', url: 'MainScreen/Converter/converter.html' },
      { id: 'circuits', label: 'Circuits', icon: '🔌', url: 'MainScreen/Circuit/circuit.html' },
      { id: 'references', label: 'Refs', icon: '📚', url: 'MainScreen/Reference/references.html' },
    ];

    return links.map(link => `
      <a href="${this.rootPath}${link.url}" class="bottom-link ${this.activeId === link.id ? 'active' : ''}">
        <span class="bottom-icon">${link.icon}</span>
        <span>${link.label}</span>
      </a>
    `).join('');
  },

  /**
   * Favorite Management
   */
  initFavoriteAction(tool) {
    const actions = document.getElementById('header-actions');
    if (!actions) return;

    const updateIcon = () => {
      const isFav = this.isFavorite(tool.id);
      const btn = document.getElementById('fav-btn');
      if (btn) {
        btn.innerHTML = isFav ? 
          `<svg viewBox="0 0 24 24" fill="var(--primary)" stroke="var(--primary)" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>` :
          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
        btn.classList.toggle('is-active', isFav);
      }
    };

    actions.innerHTML = `
      <button id="fav-btn" class="action-btn" title="Toggle Favorite">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </button>
    `;

    const btn = document.getElementById('fav-btn');
    btn.addEventListener('click', () => {
      this.toggleFavorite(tool);
      updateIcon();
    });

    updateIcon();
  },

  getFavorites() {
    try {
      return JSON.parse(localStorage.getItem('ohmkit_favorites') || '[]');
    } catch (e) {
      return [];
    }
  },

  isFavorite(id) {
    return this.getFavorites().some(f => f.id === id);
  },

  toggleFavorite(tool) {
    let favs = this.getFavorites();
    const index = favs.findIndex(f => f.id === tool.id);
    if (index > -1) {
      favs.splice(index, 1);
    } else {
      favs.push(tool);
    }
    localStorage.setItem('ohmkit_favorites', JSON.stringify(favs));
    window.dispatchEvent(new CustomEvent('favorites-updated'));
  },

  /**
   * Inject Head Tags (Favicon, SEO)
   */
  injectHeadTags() {
    const head = document.head;
    const iconPath = `${this.rootPath}img/iconfdg.png`;

    // Favicon
    if (!document.querySelector('link[rel="icon"]')) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = iconPath;
      head.appendChild(link);
    }

    // Apple Touch Icon
    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      const link = document.createElement('link');
      link.rel = 'apple-touch-icon';
      link.href = iconPath;
      head.appendChild(link);
    }

    // OG Image (Basic fallback for JS-enabled crawlers)
    if (!document.querySelector('meta[property="og:image"]')) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image');
      meta.content = iconPath;
      head.appendChild(meta);
    }
  }
};
