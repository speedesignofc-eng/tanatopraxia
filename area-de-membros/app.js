// Initialize Supabase Client
const supabaseUrl = 'https://xglfzlfxgzwndzgzefxr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnbGZ6bGZ4Z3p3bmR6Z3plZnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MjAyNjQsImV4cCI6MjA5NzI5NjI2NH0.ovIxA4ZjrUlAK3ykf8hiw77X_X_tj_8AZXSNek9PTjQ';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// State Management
const state = {
    user: null,
    progress: 0,
    materials: [
        {
            id: 'm_principal',
            type: 'Material Principal',
            title: '+350 Técnicas Ilustradas de Tanatopraxia',
            description: 'O material mais completo com técnicas ilustradas, fundamentos e conhecimentos essenciais da tanatopraxia.',
            banner: 'https://i.ibb.co/0j4h14Rq/image.png',
            link: 'https://drive.google.com/file/d/1kngry7Du9P9ZBVAzxuQFQ_LtX31Fe7fV/view',
            checked: false
        },
        {
            id: 'm_bonus1',
            type: 'Bônus Exclusivo',
            title: 'Atlas de Necromaquiagem Profissional Ilustrado',
            description: 'Desenvolvido para estudantes, auxiliares funerários, tanatopraxistas iniciantes e profissionais que desejam ampliar seus conhecimentos sobre a apresentação estética pós-morte.',
            banner: 'https://i.ibb.co/234CTGTC/image.png',
            link: 'https://drive.google.com/file/d/1gDAhiLOaCi2OIaUXCo87OwphNCW2aCm-/view',
            checked: false
        },
        {
            id: 'm_bonus2',
            type: 'Bônus Exclusivo',
            title: 'Protocolo Completo de Conservação Cadavérica',
            description: 'Desenvolvido para estudantes, auxiliares funerários, tanatopraxistas iniciantes e profissionais que desejam aprofundar seus conhecimentos sobre os procedimentos de conservação, preservação e preparação técnica de corpos.',
            banner: 'https://i.ibb.co/bMWc9jBt/image.png',
            link: 'https://drive.google.com/file/d/1uWI1kvZ1nGS1E4S6KY6nkXVi_S2SK_X1/view',
            checked: false
        },
        {
            id: 'm_bonus3',
            type: 'Bônus Exclusivo',
            title: '100 Casos Reais de Tanatopraxia Comentados',
            description: 'Desenvolvido para estudantes, auxiliares funerários, agentes funerários, tanatopraxistas iniciantes e profissionais experientes que desejam aprender através da análise de situações reais encontradas na rotina da área funerária.',
            banner: 'https://i.ibb.co/7xX69HBc/image.png',
            link: 'https://drive.google.com/file/d/1q1YbfbeQQ0arFsEdnUsBOuwrXYIhUpRk/view',
            checked: false
        },
        {
            id: 'm_orderbump_registros',
            type: 'Adicional Contratado',
            title: '+200 Modelos de Registros Funerários Prontos',
            description: 'O material reúne mais de 200 modelos prontos para uso, incluindo fichas de atendimento, formulários operacionais, registros de procedimentos, checklists de conferência, controles internos, documentos de identificação, registros de preparação, protocolos de acompanhamento e diversos outros modelos utilizados na rotina funerária.',
            banner: 'https://i.ibb.co/kFXQDLY/image.png',
            link: 'https://drive.google.com/file/d/1cJZBeTFJmboi0hA96j8vA0PpOhCheeii/view',
            checked: false,
            isOrderbump: true
        }
    ]
};

// Function to show toast notification
function showNotification(message, type = 'error') {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        toast.className = 'app-toast';
        document.body.appendChild(toast);
    }
    toast.className = `app-toast ${type} show`;
    toast.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
        <span>${message}</span>
    `;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4500);
}

// Get materials based on user plan
function getVisibleMaterials() {
    if (!state.user) return [];
    
    // Filtra materiais base de acordo com o plano do aluno
    let visible = [];
    if (state.user.plano === 'completo') {
        visible = state.materials.filter(m => !m.isOrderbump);
    } else {
        visible = state.materials.filter(m => m.id === 'm_principal');
    }
    
    // Adiciona os orderbumps que o aluno de fato adquiriu
    const userBumps = state.user.orderbumps || [];
    const orderbumpMaterials = state.materials.filter(m => m.isOrderbump);
    
    orderbumpMaterials.forEach(ob => {
        const purchased = userBumps.some(bump => 
            bump.toLowerCase().includes('registros funerários') || 
            bump.toLowerCase().includes('registros funerarios') ||
            bump.toLowerCase().includes('registros') ||
            bump.toLowerCase().includes('m_orderbump_registros')
        );
        if (purchased) {
            visible.push(ob);
        }
    });
    
    return visible;
}

// Check if user is logged in
async function checkAuth() {
    const savedUser = localStorage.getItem('mepro_user');
    const hash = window.location.hash;

    if (savedUser) {
        try {
            const localUser = JSON.parse(savedUser);
            
            // Show a loading state inside the app if we're on login or empty screen
            const appDiv = document.getElementById('app');
            if (appDiv && (!appDiv.innerHTML.trim() || appDiv.querySelector('.login-container'))) {
                appDiv.innerHTML = `
                    <div style="min-height: 100vh; display: flex; justify-content: center; align-items: center; background: radial-gradient(circle at top right, #134d3a 0%, var(--bg-dark) 100%); color: white; font-family: 'Outfit', sans-serif; flex-direction: column; gap: 16px;">
                        <i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; color: var(--primary-light);"></i>
                        <span style="font-size: 16px; font-weight: 500; opacity: 0.8;">Carregando sua área de membros...</span>
                    </div>
                `;
            }

            // Verify user exists and get latest details (like plan) from Supabase
            const { data: dbUser, error: dbError } = await supabaseClient
                .from('alunos')
                .select('*')
                .eq('email', localUser.email)
                .single();

            if (dbError || !dbUser) {
                // If user not found in DB, log them out
                localStorage.removeItem('mepro_user');
                state.user = null;
                window.location.hash = '#/login';
                renderLogin();
                return;
            }

            state.user = {
                email: dbUser.email,
                name: dbUser.nome,
                plano: dbUser.plano,
                orderbumps: dbUser.orderbumps || []
            };

            // Load progress from Supabase
            const { data: dbProgress, error: progError } = await supabaseClient
                .from('progresso')
                .select('material_id, checked')
                .eq('aluno_email', state.user.email);

            // Reset all checked to false
            state.materials.forEach(m => m.checked = false);

            if (!progError && dbProgress) {
                // Apply checked status from database
                dbProgress.forEach(row => {
                    const m = state.materials.find(mat => mat.id === row.material_id);
                    if (m) {
                        m.checked = row.checked;
                    }
                });
            }

            // Load certificate if already generated
            const { data: dbCert, error: certError } = await supabaseClient
                .from('certificados')
                .select('*')
                .eq('aluno_email', state.user.email)
                .maybeSingle();

            if (!certError && dbCert) {
                state.user.certificateName = dbCert.nome_certificado;
                state.user.certificateDate = dbCert.data_emissao;
            } else {
                state.user.certificateName = null;
                state.user.certificateDate = null;
            }

            calculateProgress();

            if (hash === '#/login' || hash === '') {
                window.location.hash = '#/dashboard';
            } else {
                renderDashboard();
            }
        } catch (err) {
            console.error("Auth error:", err);
            localStorage.removeItem('mepro_user');
            state.user = null;
            window.location.hash = '#/login';
            renderLogin();
        }
    } else {
        state.user = null;
        window.location.hash = '#/login';
        renderLogin();
    }
}

// Calculate progress percentage
function calculateProgress() {
    const visibleMaterials = getVisibleMaterials();
    const checkedCount = visibleMaterials.filter(m => m.checked).length;
    state.progress = visibleMaterials.length > 0 ? Math.round((checkedCount / visibleMaterials.length) * 100) : 0;
}

// ---------------------------------
// VIEWS RENDERING
// ---------------------------------

function renderLogin() {
    const appDiv = document.getElementById('app');
    appDiv.innerHTML = `
        <div class="login-container">
            <div class="login-card animated-fade">
                <div class="login-logo-container">
                    <img src="https://i.ibb.co/GQJ45Bch/image.png" class="login-logo-img" alt="Logo">
                </div>
                <p class="login-subtitle">Entre com o e-mail de compra para acessar sua área de membros</p>
                
                <form id="login-form" onsubmit="handleLogin(event)">
                    <div class="form-group">
                        <label class="form-label" for="email">E-mail de Acesso</label>
                        <div class="input-wrapper">
                            <i class="fa-solid fa-envelope input-icon"></i>
                            <input 
                                type="email" 
                                id="email" 
                                class="form-input" 
                                placeholder="exemplo@email.com" 
                                required
                            >
                        </div>
                    </div>
                    <button type="submit" class="login-btn">
                        <span>Acessar Conteúdo</span>
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </form>
            </div>
        </div>
    `;
}

function renderDashboard() {
    const appDiv = document.getElementById('app');

    // Generate materials HTML using getVisibleMaterials()
    let materialsHtml = '';
    const visibleMaterials = getVisibleMaterials();
    visibleMaterials.forEach(m => {
        materialsHtml += `
            <div class="material-card" id="card-${m.id}">
                <div class="material-banner">
                    <img src="${m.banner}" onerror="this.src='../images/m1.png'" alt="${m.title}">
                    <span class="material-badge">${m.type}</span>
                </div>
                <div class="material-content">
                    <h3 class="material-title">${m.title}</h3>
                    <p class="material-desc">${m.description}</p>
                    <div class="material-actions">
                        <a href="${m.link}" target="_blank" class="open-material-btn">
                            <i class="fa-solid fa-book-open"></i>
                            <span>Abrir Material</span>
                        </a>
                        <button 
                            class="check-circle ${m.checked ? 'checked' : ''}" 
                            onclick="toggleCheck('${m.id}')"
                            title="${m.checked ? 'Marcar como não visto' : 'Marcar como visto'}"
                        >
                            <i class="fa-solid fa-check"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    const isBasic = state.user && state.user.plano === 'basico';
    const isFinished = state.progress === 100 && !isBasic;
    const hasCertificate = state.user && !!state.user.certificateName;

    let certificateSectionHtml = '';
    if (isBasic) {
        certificateSectionHtml = `
            <div class="certificate-card locked" id="cert-card-element">
                <div class="cert-icon-wrapper" style="border-style: solid; border-color: #ff6b6b; color: #ff6b6b; background-color: rgba(255, 107, 107, 0.05);">
                    <i class="fa-solid fa-lock"></i>
                </div>
                <h3 class="cert-title">Certificado Bloqueado</h3>
                <p class="cert-desc" style="color: #ff6b6b; font-weight: 600; font-size: 14px; margin-bottom: 8px;">
                    Disponível apenas no Plano Completo
                </p>
                <p class="cert-desc" style="margin-bottom: 0;">
                    A emissão de certificado e os bônus de necromaquiagem e conservação são benefícios exclusivos do Plano Completo.
                </p>
            </div>
        `;
    } else if (hasCertificate) {
        certificateSectionHtml = `
            <div class="certificate-card unlocked" id="cert-card-element">
                <div class="cert-icon-wrapper" style="background-color: rgba(126, 217, 87, 0.1); color: var(--primary-dark); border: 2px solid var(--primary-light);">
                    <i class="fa-solid fa-award"></i>
                </div>
                <h3 class="cert-title">Certificado Emitido</h3>
                <p class="cert-desc" style="margin-bottom: 16px;">
                    Seu certificado oficial foi emitido com sucesso para:
                </p>
                <div class="cert-form" id="cert-form-container" style="display: flex;">
                    <input 
                        type="text" 
                        id="cert-name-input" 
                        class="cert-input" 
                        value="${state.user.certificateName.toUpperCase()}"
                        disabled
                        style="background-color: #e8f5e9; border-color: var(--primary-light); color: var(--primary-dark); font-weight: 600;"
                    >
                    <button class="cert-btn" onclick="generateCertificate()">
                        <i class="fa-solid fa-eye"></i>
                        <span>Visualizar Certificado</span>
                    </button>
                </div>
            </div>
        `;
    } else {
        certificateSectionHtml = `
            <div class="certificate-card ${isFinished ? 'unlocked' : 'locked'}" id="cert-card-element">
                <div class="cert-icon-wrapper">
                    <i class="fa-solid fa-award"></i>
                </div>
                <h3 class="cert-title">Certificado de Conclusão</h3>
                <p class="cert-desc" id="cert-status-desc">
                    ${isFinished
                        ? 'Parabéns! Você concluiu todos os materiais. Preencha seu nome para liberar o seu certificado.'
                        : `Conclua a leitura de todos os \${getVisibleMaterials().length} materiais (marcando os checks correspondentes) para liberar seu certificado.`}
                </p>
                
                <div class="cert-form" id="cert-form-container" style="display: ${isFinished ? 'flex' : 'none'}">
                    <input 
                        type="text" 
                        id="cert-name-input" 
                        class="cert-input" 
                        placeholder="Seu Nome Completo"
                    >
                    <button class="cert-btn" onclick="generateCertificate()">
                        <i class="fa-solid fa-file-signature"></i>
                        <span>Gerar Certificado</span>
                    </button>
                </div>
            </div>
        `;
    }

    appDiv.innerHTML = `
        <nav class="navbar">
            <div class="nav-brand">
                <i class="fa-solid fa-graduation-cap"></i>
                <div><span>+350 Técnicas</span> de Tanatopraxia</div>
            </div>
            <div class="nav-user">
                <div class="user-badge">
                    <i class="fa-solid fa-user"></i>
                    <span id="user-email-display">${state.user.email}</span>
                </div>
                <button class="logout-btn" onclick="handleLogout()" title="Sair da Conta">
                    <i class="fa-solid fa-right-from-bracket"></i>
                </button>
            </div>
        </nav>

        <div class="dashboard-container animated-fade">
            <!-- Left Panel -->
            <div class="sidebar-panel">
                <!-- Profile / Progress Card -->
                <div class="profile-card">
                    <h2 class="profile-title">Seu Aprendizado</h2>
                    <p class="profile-email">Aluno: ${state.user.name}</p>
                    
                    <div class="progress-section">
                        <div class="progress-header">
                            <span>Progresso Geral</span>
                            <span id="progress-percent">${state.progress}%</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill" id="progress-bar-fill" style="width: ${state.progress}%"></div>
                        </div>
                    </div>
                </div>

                <!-- Certificate Section -->
                ${certificateSectionHtml}
            </div>

            <!-- Right Panel: Materials Grid -->
            <div class="materials-column">
                <h2 class="materials-column-header">Seus Materiais de Estudo</h2>
                <div class="materials-grid">
                    ${materialsHtml}
                </div>
            </div>
        </div>
    `;
}

// ---------------------------------
// ACTIONS & LOGIC
// ---------------------------------

async function handleLogin(e) {
    e.preventDefault();
    const emailInput = document.getElementById('email');
    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    const loginBtn = document.querySelector('.login-btn');
    
    if (!email) return;

    // Show loading state on button
    const originalBtnContent = loginBtn ? loginBtn.innerHTML : '';
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Verificando...</span>
        `;
    }

    try {
        const { data: user, error } = await supabaseClient
            .from('alunos')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            showNotification('E-mail não cadastrado na plataforma. Verifique o endereço ou utilize o e-mail de compra.', 'error');
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalBtnContent;
            }
            return;
        }

        const userObj = {
            email: user.email,
            name: user.nome,
            plano: user.plano,
            orderbumps: user.orderbumps || []
        };

        localStorage.setItem('mepro_user', JSON.stringify(userObj));
        state.user = userObj;

        window.location.hash = '#/dashboard';
        await checkAuth();
    } catch (err) {
        console.error("Login error:", err);
        showNotification('Erro ao conectar com o servidor. Tente novamente mais tarde.', 'error');
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = originalBtnContent;
        }
    }
}

function handleLogout() {
    localStorage.removeItem('mepro_user');
    state.user = null;
    window.location.hash = '#/login';
    checkAuth();
}

async function toggleCheck(materialId) {
    if (!state.user) return;
    const material = state.materials.find(m => m.id === materialId);
    if (material) {
        // Find card button element
        const btn = document.querySelector(`#card-${materialId} .check-circle`);
        const originalChecked = material.checked;
        
        // Toggle local state
        material.checked = !material.checked;

        if (material.checked) {
            if (btn) btn.classList.add('checked');
            // Trigger Confetti Explosion!
            triggerConfetti();
        } else {
            if (btn) btn.classList.remove('checked');
        }

        // Save to Supabase
        try {
            const { error } = await supabaseClient
                .from('progresso')
                .upsert({
                    aluno_email: state.user.email,
                    material_id: materialId,
                    checked: material.checked
                });

            if (error) {
                console.error("Error saving progress:", error);
                // Revert local state on error
                material.checked = originalChecked;
                if (material.checked) {
                    if (btn) btn.classList.add('checked');
                } else {
                    if (btn) btn.classList.remove('checked');
                }
                showNotification('Erro ao salvar progresso. Verifique sua conexão.', 'error');
                return;
            }

            calculateProgress();
            updateProgressUI();
        } catch (err) {
            console.error("Progress save exception:", err);
            // Revert local state
            material.checked = originalChecked;
            if (material.checked) {
                if (btn) btn.classList.add('checked');
            } else {
                if (btn) btn.classList.remove('checked');
            }
            showNotification('Erro ao salvar progresso. Verifique sua conexão.', 'error');
        }
    }
}

function triggerConfetti() {
    confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0f3d2e', '#7ed957', '#ffffff', '#1b5e46']
    });
}

function updateProgressUI() {
    const percentSpan = document.getElementById('progress-percent');
    const barFill = document.getElementById('progress-bar-fill');
    
    if (percentSpan && barFill) {
        percentSpan.textContent = `${state.progress}%`;
        barFill.style.width = `${state.progress}%`;
    }

    const isBasic = state.user && state.user.plano === 'basico';
    
    // If it's basic, we do not unlock the certificate card
    if (isBasic) {
        return;
    }

    const hasCertificate = state.user && !!state.user.certificateName;
    if (hasCertificate) {
        return;
    }

    const certCard = document.getElementById('cert-card-element');
    const certDesc = document.getElementById('cert-status-desc');
    const certForm = document.getElementById('cert-form-container');

    if (state.progress === 100) {
        if (certCard) {
            certCard.classList.remove('locked');
            certCard.classList.add('unlocked');
        }
        if (certDesc) {
            certDesc.textContent = 'Parabéns! Você concluiu todos os materiais. Preencha seu nome para liberar o seu certificado.';
        }
        if (certForm) {
            certForm.style.display = 'flex';
        }
        // Big confetti explosion for completing everything!
        confetti({
            particleCount: 300,
            spread: 120,
            origin: { y: 0.5 }
        });
    } else {
        if (certCard) {
            certCard.classList.remove('unlocked');
            certCard.classList.add('locked');
        }
        if (certDesc) {
            certDesc.textContent = 'Conclua a leitura de todos os ' + getVisibleMaterials().length + ' materiais (marcando os checks correspondentes) para liberar seu certificado.';
        }
        if (certForm) {
            certForm.style.display = 'none';
        }
    }
}

// ---------------------------------
// CERTIFICATE GENERATION
// ---------------------------------

async function generateCertificate() {
    let studentName = "";
    
    // Check if certificate has already been generated
    const hasCertificate = state.user && !!state.user.certificateName;
    if (hasCertificate) {
        studentName = state.user.certificateName;
    } else {
        const nameInput = document.getElementById('cert-name-input');
        studentName = nameInput ? nameInput.value.trim() : "";
        if (!studentName) {
            showNotification('Por favor, digite seu nome completo para o certificado.', 'error');
            return;
        }
    }

    // Show loading state on button
    const certBtn = document.querySelector('.cert-btn');
    const originalBtnHTML = certBtn ? certBtn.innerHTML : '';
    if (certBtn && !hasCertificate) {
        certBtn.disabled = true;
        certBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Emitindo...';
    }

    // If not generated, save to Supabase first
    if (!hasCertificate) {
        try {
            const { error: insertError } = await supabaseClient
                .from('certificados')
                .insert({
                    aluno_email: state.user.email,
                    nome_certificado: studentName
                });

            if (insertError) {
                console.error("Error saving certificate:", insertError);
                if (insertError.code === '23505') { // unique violation
                    showNotification('Você já possui um certificado emitido.', 'error');
                } else {
                    showNotification('Ocorreu um erro ao emitir o certificado. Tente novamente.', 'error');
                }
                if (certBtn) {
                    certBtn.disabled = false;
                    certBtn.innerHTML = originalBtnHTML;
                }
                return;
            }

            // Store in state so we don't allow re-emitting
            state.user.certificateName = studentName;
            state.user.certificateDate = new Date().toISOString();
            
            // Re-render dashboard to show "Certificado Emitido" permanent state
            renderDashboard();
            showNotification('Certificado gerado e registrado com sucesso!', 'success');
        } catch (err) {
            console.error(err);
            showNotification('Ocorreu um erro de rede. Tente novamente.', 'error');
            if (certBtn) {
                certBtn.disabled = false;
                certBtn.innerHTML = originalBtnHTML;
            }
            return;
        }
    }

    // Now render the canvas certificate
    const canvas = document.createElement('canvas');
    canvas.width = 1414;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    const templateImg = new Image();
    templateImg.crossOrigin = 'anonymous';
    templateImg.src = 'https://i.ibb.co/0yw5p5mD/image.png';

    templateImg.onload = function () {
        ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

        // Student Name
        ctx.fillStyle = '#002D17';
        ctx.font = 'bold 40px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(studentName.toUpperCase(), canvas.width / 2, 525, 900);

        // Date of completion
        const completionDate = state.user.certificateDate ? new Date(state.user.certificateDate) : new Date();
        const day = String(completionDate.getDate()).padStart(2, '0');
        const month = String(completionDate.getMonth() + 1).padStart(2, '0');
        const year = String(completionDate.getFullYear());

        ctx.fillStyle = '#002D17';
        ctx.font = 'bold 19px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(day, 351, 808);   // over the DD blank
        ctx.fillText(month, 400, 808);   // over the MM blank
        ctx.fillText(year, 465, 808);   // over the AAAA blank

        const dataUrl = canvas.toDataURL('image/png');
        showCertificateModal(dataUrl, studentName);
        
        if (certBtn) {
            certBtn.disabled = false;
            certBtn.innerHTML = originalBtnHTML;
        }
    };

    templateImg.onerror = function () {
        // Fallback: draw without template if image fails to load
        ctx.fillStyle = '#0f3d2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#7ed957';
        ctx.lineWidth = 14;
        ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
        ctx.fillStyle = '#7ed957';
        ctx.font = 'bold 55px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CERTIFICADO DE CONCLUSÃO', canvas.width / 2, 180);
        ctx.fillStyle = '#ffffff';
        ctx.font = '22px "Inter", sans-serif';
        ctx.fillText('Certificamos que o aluno(a)', canvas.width / 2, 290);
        ctx.fillStyle = '#7ed957';
        ctx.font = 'bold 52px "Outfit", sans-serif';
        ctx.fillText(studentName.toUpperCase(), canvas.width / 2, 380);
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px "Inter", sans-serif';
        ctx.fillText('concluiu o programa +350 Técnicas Ilustradas de Tanatopraxia.', canvas.width / 2, 460);
        
        const dataUrl = canvas.toDataURL('image/png');
        showCertificateModal(dataUrl, studentName);
        
        if (certBtn) {
            certBtn.disabled = false;
            certBtn.innerHTML = originalBtnHTML;
        }
    };
}

function showCertificateModal(dataUrl, studentName) {
    // Check if modal container already exists
    let modal = document.getElementById('cert-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cert-modal';
        modal.className = 'modal-overlay animated-fade';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-card">
            <div class="modal-header">
                <div class="modal-title">
                    <i class="fa-solid fa-award"></i>
                    <span>Seu Certificado Oficial</span>
                </div>
                <button class="close-modal-btn" onclick="closeModal()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="modal-body">
                <p style="text-align: center; color: var(--text-muted); font-size: 14px;">
                    Seu certificado foi emitido. Veja a prévia abaixo. Você pode baixar como imagem ou imprimir diretamente em A4.
                </p>
                <div class="certificate-preview-container">
                    <img id="modal-cert-img" src="${dataUrl}" alt="Certificado de Conclusão">
                </div>
                <div class="modal-actions">
                    <button class="action-btn action-btn-primary" onclick="printCertificate('${dataUrl}', '${studentName}')">
                        <i class="fa-solid fa-print"></i>
                        <span>Imprimir / Salvar PDF</span>
                    </button>
                    <button class="action-btn action-btn-secondary" onclick="downloadCertificate('${dataUrl}', '${studentName}')">
                        <i class="fa-solid fa-download"></i>
                        <span>Baixar Imagem (PNG)</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('cert-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function printCertificate(dataUrl, studentName) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <title>Certificado - ${studentName}</title>
            <style>
                @page { 
                    size: A4 landscape; 
                    margin: 0; 
                }
                body { 
                    margin: 0; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh; 
                    background-color: #ffffff; 
                }
                img { 
                    width: 100%; 
                    height: 100%; 
                    object-fit: contain; 
                }
            </style>
        </head>
        <body onload="window.print(); window.close();">
            <img src="${dataUrl}">
        </body>
        </html>
    `);
    printWindow.document.close();
}

function downloadCertificate(dataUrl, studentName) {
    const link = document.createElement('a');
    link.href = dataUrl;
    // Clean student name for filename
    const cleanName = studentName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.download = `certificado_tanatopraxia_${cleanName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ---------------------------------
// INITIALIZATION & ROUTING
// ---------------------------------

// Listen for route changes
window.addEventListener('hashchange', checkAuth);

// Start App
window.addEventListener('load', () => {
    // If no hash is set, redirect to #/login
    if (!window.location.hash) {
        window.location.hash = '#/login';
    }
    checkAuth();
});
