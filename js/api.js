// ENDPOINT BASE
const API_URL = "https://portaria-back.onrender.com/api";

// --- LOGIN ---
async function login(email, senha) {
  try {
    console.log("Tentando login:", { email, senha });
    
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, senha })
    });

    const data = await res.json();
    console.log("Resposta do login:", data);
    
    if (!res.ok) {
      return { success: false, error: data.error || "Erro no login" };
    }

    return { 
      success: true, 
      token: data.token,
      usuario_id: data.usuario_id,
      usuario_nome: data.usuario_nome
    };
  } catch (err) {
    console.error("Erro no login:", err);
    return { success: false, error: "Erro ao conectar ao servidor" };
  }
}

// --- CADASTRAR USUÁRIO ---
async function cadastrar(nome, email, senha) {
  try {
    console.log("Tentando cadastrar:", { nome, email, senha });
    
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ nome, email, senha })
    });

    const data = await res.json();
    console.log("Resposta do cadastro:", data);

    if (!res.ok) {
      return { success: false, error: data.error || "Erro ao cadastrar" };
    }

    return { 
      success: true, 
      message: data.message,
      data: data.data 
    };
  } catch (err) {
    console.error("Erro no cadastro:", err);
    return { success: false, error: "Erro ao conectar ao servidor" };
  }
}

// --- CRIAR REGISTRO ---
async function criarRegistro(usuario_id, tipo_registro, descricao) {
  try {
    const token = localStorage.getItem("token");
    console.log("Criando registro:", { usuario_id, tipo_registro, descricao });
    
    const res = await fetch(`${API_URL}/registros`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ usuario_id, tipo_registro, descricao })
    });

    const data = await res.json();
    console.log("Resposta do registro:", data);
    
    if (!res.ok) return { success: false, error: data.error || "Erro ao criar registro" };
    return { success: true, data: data.data || data };
  } catch (err) {
    console.error("Erro ao criar registro:", err);
    return { success: false, error: "Erro ao conectar ao servidor" };
  }
}

// --- LISTAR REGISTROS ---
async function getRegistros() {
  try {
    console.log("Buscando registros...");
    
    const res = await fetch(`${API_URL}/registros`);
    const data = await res.json();
    console.log("Registros recebidos:", data);
    
    if (!res.ok) return [];
    return Array.isArray(data) ? data : (data.registros || data.data || []);
  } catch (err) {
    console.error("Erro ao buscar registros:", err);
    return [];
  }
}

// --- DELETAR REGISTRO ---
async function deletarRegistro(id) {
  try {
    const token = localStorage.getItem("token");
    console.log("Deletando registro ID:", id);
    
    const res = await fetch(`${API_URL}/registros/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }
    });

    const data = await res.json();
    console.log("Resposta da exclusão:", data);
    
    if (!res.ok) return { success: false, error: data.error || "Erro ao deletar registro" };
    return { success: true, data };
  } catch (err) {
    console.error("Erro ao deletar registro:", err);
    return { success: false, error: "Erro ao conectar ao servidor" };
  }
}