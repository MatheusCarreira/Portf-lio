const STORAGE_KEY = 'portfolioProjects-v1';

const sampleProjects = [
    {
        name: 'API de Filmes',
        description: 'Uma API REST para buscar filmes, filtrar por genero e mostrar detalhes de cada titulo.',
        tech: ['Node.js', 'Express', 'MongoDB'],
        category: 'API',
        loc: 420,
        github: 'https://github.com/MatheusCarreira/api-filmes',
        status: 'concluído',
    },
    {
        name: 'Classificador de Imagens',
        description: 'Um projeto de ML que identifica categorias de imagens usando redes neurais e TensorFlow.',
        tech: ['Python', 'TensorFlow', 'Pandas'],
        category: 'ML',
        loc: 1080,
        github: 'https://github.com/MatheusCarreira/classificador-imagens',
        status: 'em andamento',
    },

];

const refs = {
    navButtons: [...document.querySelectorAll('.nav-btn')],
    projectsGrid: document.getElementById('projects-grid'),
    heroStats: document.getElementById('hero-stats'),
    modalBackdrop: document.getElementById('modal-backdrop'),
    modalClose: document.getElementById('modal-close'),
    modalTag: document.getElementById('modal-tag'),
    modalTitle: document.getElementById('modal-title'),
    modalDesc: document.getElementById('modal-desc'),
    modalTech: document.getElementById('modal-tech'),
    modalLoc: document.getElementById('modal-loc'),
    modalStatus: document.getElementById('modal-status'),
    modalGithub: document.getElementById('modal-github'),
    fabOpen: document.getElementById('fab-open'),
    formBackdrop: document.getElementById('form-backdrop'),
    formClose: document.getElementById('form-close'),
    formCancel: document.getElementById('form-cancel'),
    formSave: document.getElementById('form-save'),
    formTitle: document.querySelector('.form-title'),
    inputName: document.getElementById('f-name'),
    inputDesc: document.getElementById('f-desc'),
    inputTech: document.getElementById('f-tech'),
    inputCategory: document.getElementById('f-cat'),
    inputLoc: document.getElementById('f-loc'),
    inputGithub: document.getElementById('f-github'),
    inputStatus: document.getElementById('f-status'),
    formFeedback: document.getElementById('form-feedback'),
};

let projects = [];
let currentFilter = 'all';

function loadProjects() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        projects = sampleProjects.slice();
        saveProjects();
        return;
    }

    try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
            projects = parsed;
        } else {
            projects = sampleProjects.slice();
        }
    } catch {
        projects = sampleProjects.slice();
    }
}

function saveProjects() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function normalizeStatusKey(status) {
    return status
        .toString()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .trim();
}

function formatStatusLabel(status) {
    const normalized = normalizeStatusKey(status);
    const statusClass = {
        'concluido': 'status-concluido',
        'em andamento': 'status-andamento',
        pausado: 'status-pausado',
    }[normalized] || 'status-pausado';

    return `<span class="card-status-dot ${statusClass}"></span>${status}`;
}

function updateStats() {
    const totalProjects = projects.length;
    const totalLOC = projects.reduce((sum, project) => sum + Number(project.loc || 0), 0);
    const uniqueTech = new Set(projects.flatMap((project) => project.tech)).size;

    refs.heroStats.innerHTML = '';
    const stats = [
        { label: 'Projetos', value: totalProjects },
        { label: 'Tecnologias', value: uniqueTech },
        { label: 'Linhas de codigo', value: totalLOC },
    ];

    stats.forEach((item) => {
        const block = document.createElement('div');
        block.className = 'stat-block';
        block.innerHTML = `
            <span class="stat-num">${item.value}</span>
            <span class="stat-label">${item.label}</span>
        `;
        refs.heroStats.appendChild(block);
    });
}

function renderProjects(filter = 'all') {
    refs.projectsGrid.innerHTML = '';
    const filtered = projects.filter((project) => filter === 'all' || project.category === filter);

    if (filtered.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.style.color = 'var(--white-60)';
        emptyMessage.textContent = 'Nenhum projeto encontrado para essa categoria.';
        refs.projectsGrid.appendChild(emptyMessage);
        return;
    }

    const arrowSymbol = String.fromCharCode(8594);

    filtered.forEach((project) => {
        const card = document.createElement('article');
        card.className = 'project-card';
        card.innerHTML = `
            <div class="card-header">
                <span class="card-tag tag-${project.category}">${project.category}</span>
                <span class="card-loc">${project.loc} LOC</span>
            </div>
            <h3 class="card-name">${project.name}</h3>
            <p class="card-desc">${project.description}</p>
            <div class="card-footer">
                <div class="card-tech-pills">
                    ${project.tech.map((tech) => `<span class="tech-pill">${tech}</span>`).join('')}
                </div>
                <span class="card-arrow" aria-hidden="true">${arrowSymbol}</span>
            </div>
        `;

        card.addEventListener('click', () => openModal(project));
        refs.projectsGrid.appendChild(card);
    });
}

function openModal(project) {
    refs.modalTag.textContent = project.category;
    refs.modalTag.className = `modal-tag tag-${project.category}`;
    refs.modalTitle.textContent = project.name;
    refs.modalDesc.textContent = project.description;
    refs.modalTech.innerHTML = project.tech
        .map((tech) => `<span class="tech-pill">${tech}</span>`)
        .join('');
    refs.modalLoc.textContent = `${project.loc} LOC`;
    refs.modalStatus.innerHTML = formatStatusLabel(project.status);
    refs.modalGithub.textContent = 'Ver no GitHub';
    refs.modalGithub.href = project.github;
    refs.modalGithub.target = '_blank';

    refs.modalBackdrop.classList.add('open');
}

function closeModal() {
    refs.modalBackdrop.classList.remove('open');
}

function openForm() {
    clearForm();
    refs.formBackdrop.classList.add('open');
}

function closeForm() {
    refs.formBackdrop.classList.remove('open');
    refs.formFeedback.textContent = '';
    refs.formFeedback.classList.remove('error');
}

function clearForm() {
    refs.formTitle.textContent = 'Novo Projeto';
    refs.formSave.textContent = 'Salvar Projeto';
    refs.inputName.value = '';
    refs.inputDesc.value = '';
    refs.inputTech.value = '';
    refs.inputCategory.value = 'API';
    refs.inputLoc.value = '';
    refs.inputGithub.value = '';
    refs.inputStatus.value = 'concluído';
    refs.formFeedback.textContent = '';
    refs.formFeedback.classList.remove('error');
}

function validateProjectData(data) {
    if (!data.name.trim()) return 'O nome do projeto é obrigatório.';
    if (!data.description.trim()) return 'A descrição é obrigatória.';
    if (data.tech.length === 0) return 'Adicione pelo menos uma tecnologia.';
    if (!data.loc.toString().trim() || Number(data.loc) < 0) return 'Informe um número válido de linhas de código.';
    if (!data.github.trim()) return 'A URL do GitHub é obrigatória.';
    if (!data.github.startsWith('http')) return 'A URL do GitHub deve começar com http ou https.';
    return null;
}

function saveProject() {
    const project = {
        name: refs.inputName.value.trim(),
        description: refs.inputDesc.value.trim(),
        tech: refs.inputTech.value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        category: refs.inputCategory.value,
        loc: Number(refs.inputLoc.value) || 0,
        github: refs.inputGithub.value.trim(),
        status: refs.inputStatus.value,
    };

    const errorMessage = validateProjectData(project);
    if (errorMessage) {
        refs.formFeedback.textContent = errorMessage;
        refs.formFeedback.classList.add('error');
        return;
    }

    projects.unshift(project);

    saveProjects();
    updateStats();
    renderProjects(currentFilter);
    refs.formFeedback.textContent = 'Projeto salvo com sucesso!';
    refs.formFeedback.classList.remove('error');

    setTimeout(() => {
        closeForm();
    }, 600);
}

function setActiveFilter(button) {
    refs.navButtons.forEach((navButton) => navButton.classList.remove('active'));
    button.classList.add('active');
    currentFilter = button.dataset.filter;
    renderProjects(currentFilter);
}

function bindEvents() {
    refs.navButtons.forEach((button) => {
        button.addEventListener('click', () => setActiveFilter(button));
    });

    refs.modalClose.addEventListener('click', closeModal);
    refs.modalBackdrop.addEventListener('click', (event) => {
        if (event.target === refs.modalBackdrop) {
            closeModal();
        }
    });
    refs.fabOpen.addEventListener('click', openForm);
    refs.formClose.addEventListener('click', closeForm);
    refs.formCancel.addEventListener('click', closeForm);
    refs.formBackdrop.addEventListener('click', (event) => {
        if (event.target === refs.formBackdrop) {
            closeForm();
        }
    });
    refs.formSave.addEventListener('click', saveProject);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal();
            closeForm();
        }
    });
}

function init() {
    loadProjects();
    bindEvents();
    updateStats();
    renderProjects();
}

init();
