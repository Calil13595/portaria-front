// js/auth.js
// IMPORTANTE: Mude esta URL para o endereço do seu deploy no Render!
window.API_BASE_URL = 'https://portaria-back.onrender.com/api'; 

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutButton = document.getElementById('logoutButton');
    const token = localStorage.getItem('jwt_token');

    // Inicialização da Tela de Login (index.html)
    if (loginForm) {
        if (token) {
            window.location.href = 'registros.html';
            return;
        }
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Inicialização da Tela de Cadastro de Porteiro (cadastro_porteiro.html)
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Inicialização da Tela de Registros/Cadastro (Para Logout)
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
});

// ------------------------------------
// RF01 - Lógica de Cadastro de Porteiro
// ------------------------------------
async function handleRegister(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    
    const messageElement = document.getElementById('registerMessage');
    messageElement.textContent = 'Registrando...';

    try {
        const response = await fetch(`${window.API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            messageElement.className = 'info-message';
            messageElement.textContent = 'Cadastro realizado com sucesso! Redirecionando para login...';
            setTimeout(() => {
                window.location.href = 'index.html'; 
            }, 2000);
        } else {
            messageElement.className = 'error-message';
            messageElement.textContent = data.error || 'Erro ao realizar cadastro. Tente outro e-mail.';
        }

    } catch (error) {
        messageElement.className = 'error-message';
        messageElement.textContent = 'Erro de conexão com o servidor. Verifique o console.';
    }
}

// ------------------------------------
// RF02 - Lógica de Login
// ------------------------------------
async function handleLogin(event) {
    event.preventDefault(); 
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    
    const messageElement = document.getElementById('message');
    messageElement.textContent = 'Autenticando...';

    try {
        const response = await fetch(`${window.API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            // Salva o token JWT e o nome do usuário no armazenamento local
            localStorage.setItem('jwt_token', data.token); 
            localStorage.setItem('user_name', data.user.nome); 
            window.location.href = 'registros.html'; 
        } else {
            messageElement.textContent = data.error || 'Erro ao realizar login. Verifique as credenciais.';
        }

    } catch (error) {
        messageElement.textContent = 'Erro de conexão com o servidor.';
    }
}

// Lógica de Logout
function logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_name');
    window.location.href = 'index.html'; 
}

// Exporta a função para que outros módulos (como app.js) possam usá-la
window.logout = logout;