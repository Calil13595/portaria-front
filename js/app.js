// js/app.js
// A variável API_BASE_URL é acessada via window.API_BASE_URL (definida globalmente em auth.js)

document.addEventListener('DOMContentLoaded', () => {
    
    const token = localStorage.getItem('jwt_token');

    // Lógica Comum de Proteção (Redireciona se não houver token)
    if (window.location.pathname.endsWith('registros.html') || window.location.pathname.endsWith('cadastro.html')) {
        if (!token) {
            alert('Você precisa estar logado para acessar esta página.');
            window.location.href = 'index.html';
            return;
        }

        // Exibe o nome do usuário na tela de listagem
        const userName = localStorage.getItem('user_name') || 'Porteiro';
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay) {
            userNameDisplay.textContent = userName;
        }
    }
    
    // Variável de Display Global (Mensagens)
    const messageDisplay = document.getElementById('message') || document.getElementById('formMessage');

    // Lógica para a tela de registros.html (Listagem)
    const registrosTableBody = document.querySelector('#registrosTable tbody');
    if (registrosTableBody) {
        // Passa a instância do body da tabela para as funções de leitura
        loadRegistros(messageDisplay, registrosTableBody); // RF04 - Carrega os dados na inicialização
        
        // CORREÇÃO do Botão de Atualizar: Garantido o Listener
        const loadDataButton = document.getElementById('loadDataButton');
        if (loadDataButton) {
            loadDataButton.addEventListener('click', () => loadRegistros(messageDisplay, registrosTableBody));
        }
    }

    // Lógica para a tela de cadastro.html (Formulário)
    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        // RF03 (Create)
        registroForm.addEventListener('submit', (event) => handleFormSubmit(event, messageDisplay)); 
    }
});


// RF04: Busca a lista de registros da API protegida
async function loadRegistros(messageDisplay, registrosTableBody) {
    registrosTableBody.innerHTML = '<tr><td colspan="6">Carregando registros...</td></tr>';
    
    const token = localStorage.getItem('jwt_token');
    if (!token) { return; }

    try {
        // Usa a URL do Render
        const response = await fetch(`${window.API_BASE_URL}/registros`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });

        if (response.status === 401) {
            messageDisplay.textContent = 'Sessão expirada. Faça login novamente.';
            window.logout(); 
            return;
        }

        const data = await response.json();

        if (response.ok) {
            displayRegistros(data, registrosTableBody);
        } else {
            messageDisplay.textContent = data.error || 'Erro ao buscar dados.';
            registrosTableBody.innerHTML = '<tr><td colspan="6">Nenhum registro encontrado.</td></tr>';
        }

    } catch (error) {
        console.error('Erro ao buscar registros:', error);
        messageDisplay.textContent = 'Falha de conexão com o servidor da API. Verifique se o Back-end está ativo.';
        registrosTableBody.innerHTML = '<tr><td colspan="6">Falha na conexão.</td></tr>';
    }
}

// Renderiza os dados na tabela (RF04)
function displayRegistros(registros, registrosTableBody) {
    registrosTableBody.innerHTML = ''; // Limpa a tabela
    
    if (registros.length === 0) {
        registrosTableBody.innerHTML = '<tr><td colspan="6">Nenhum registro ativo.</td></tr>';
        return;
    }

    registros.forEach(reg => {
        const row = registrosTableBody.insertRow();
        const entrada = new Date(reg.horario_entrada).toLocaleString();
        const saida = reg.horario_saida 
                      ? new Date(reg.horario_saida).toLocaleString() 
                      : `<span class="status-ativo">Em Pátio</span>`;
        
        row.innerHTML = `
            <td data-label="Visitante">${reg.nome_visitante}</td>
            <td data-label="Destino">${reg.apartamento_destino}</td>
            <td data-label="Entrada">${entrada}</td>
            <td data-label="Saída">${saida}</td>
            <td data-label="Porteiro ID">${reg.porteiro_id.substring(0, 8)}...</td>
            <td data-label="Ações" class="action-buttons">
                ${!reg.horario_saida ? 
                    // Chamada Global para a ação de Saída
                    `<button class="btn-action" onclick="window.registrarSaida('${reg.id}')">Saída</button>` 
                    : `<button class="btn-action btn-disabled" disabled>Fechado</button>`
                }
                <!-- Chamada Global para a ação de Excluir -->
                <button class="btn-danger" onclick="window.deleteRegistro('${reg.id}')">Excluir</button>
            </td>
        `;
    });
}

// RF03 (Update): Registra a saída do visitante
window.registrarSaida = async (id) => {
    if (!confirm('Deseja registrar a saída deste visitante agora?')) return;
    
    const token = localStorage.getItem('jwt_token');

    try {
        // Usa a URL do Render
        const response = await fetch(`${window.API_BASE_URL}/registros/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ horario_saida: new Date().toISOString() })
        });
        
        if (response.ok) {
            alert('Saída registrada com sucesso!');
            // Atualiza a lista
            loadRegistros(document.getElementById('message'), document.querySelector('#registrosTable tbody')); 
        } else {
            alert('Erro ao registrar saída.');
        }
    } catch (e) {
        alert('Falha na comunicação com o servidor.');
    }
}

// RF03 (Delete): Exclui o registro
window.deleteRegistro = async (id) => {
    if (!confirm('ATENÇÃO: Deseja realmente excluir este registro? Esta ação é irreversível.')) return;
    
    const token = localStorage.getItem('jwt_token');

    try {
        // Usa a URL do Render
        const response = await fetch(`${window.API_BASE_URL}/registros/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            alert('Registro excluído!');
            // Atualiza a lista
            loadRegistros(document.getElementById('message'), document.querySelector('#registrosTable tbody')); 
        } else {
            alert('Erro ao excluir registro.');
        }
    } catch (e) {
        alert('Falha na comunicação com o servidor.');
    }
}

// RF03 (Create): Lógica para enviar o formulário de criação
async function handleFormSubmit(event, messageDisplay) {
    event.preventDefault();

    const nome_visitante = document.getElementById('nome_visitante').value;
    const documento = document.getElementById('documento').value;
    const apartamento_destino = document.getElementById('apartamento_destino').value;
    const observacao = document.getElementById('observacao').value;
    
    const url = `${window.API_BASE_URL}/registros`; // Usa a URL do Render
    const token = localStorage.getItem('jwt_token');

    const bodyData = {
        nome_visitante,
        documento,
        apartamento_destino,
        observacao,
    };
    
    messageDisplay.textContent = 'Registrando...';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(bodyData)
        });

        const data = await response.json();

        if (response.ok) {
            messageDisplay.textContent = 'Sucesso! Registro criado.';
            alert('Entrada registrada com sucesso!');
            window.location.href = 'registros.html'; // Volta para a lista
        } else {
            messageDisplay.textContent = data.error || 'Falha ao salvar o registro.';
        }

    } catch (error) {
        messageDisplay.textContent = 'Erro de comunicação com o servidor.';
    }
}