// funcao para formato de data dd/mm/yyyy
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Funcao para carregar dados de manutencao em tabela
async function carregarManutencoes(endpoint, tableId) {
    try {
        const response = await fetch(`http://localhost:3000/manutencoes/${endpoint}`);
        if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
        const data = await response.json();

        if (!data || !data.success || !Array.isArray(data.data)) {
            console.error('Erro: Dados inválidos da API.');
            return;
        }

        const tableBody = document.getElementById(tableId);
        tableBody.innerHTML = '';

        data.data.forEach((manutencao) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${manutencao.eb_viatura}</td>
                <td>${manutencao.marca_modelo}</td>
                <td>${manutencao.numero_os}</td>
                <td>${manutencao.om}</td>
                <td>${formatDate(manutencao.data_entrada)}</td>
                <td>${formatDate(manutencao.data_conclusao)}</td>
                <td>
                    ${
                        endpoint === 'em_andamento'
                            ? `
                                <button class="btn btn-success btn-sm" onclick="concluirManutencao(${manutencao.id})">Concluir</button>
                                <button class="btn btn-warning btn-sm" onclick="abrirModalEdicao(${JSON.stringify(
                                    manutencao
                                ).replace(/"/g, '&quot;')})">Editar</button>
                                <button class="btn btn-danger btn-sm" onclick="excluirManutencao(${manutencao.id})">Excluir</button>
                              `
                            : `
                                <button class="btn btn-warning btn-sm" onclick="abrirModalEdicao(${JSON.stringify(
                                    manutencao
                                ).replace(/"/g, '&quot;')})">Editar</button>
                                <button class="btn btn-danger btn-sm" onclick="excluirManutencao(${manutencao.id})">Excluir</button>
                              `
                    }
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error(`Erro ao carregar manutenções (${endpoint}):`, error);
    }
}

// Modal para editar manutencao 
function abrirModalEdicao(manutencao) {
    const fields = ['id', 'eb_viatura', 'marca_modelo', 'numero_os', 'om', 'data_entrada', 'data_conclusao'];
    fields.forEach(field => {
        const element = document.getElementById(`edit${field.charAt(0).toUpperCase() + field.slice(1)}`);
        if (element) {
            element.value = manutencao[field] || '';
        }
    });

    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    editModal.show();
}

// modal para edicao
document.getElementById('editManutencaoForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = document.getElementById('editId').value;
    const manutencaoAtualizada = {
        eb_viatura: document.getElementById('editEbViatura').value,
        marca_modelo: document.getElementById('editMarcaModelo').value,
        numero_os: document.getElementById('editNumeroOs').value,
        om: document.getElementById('editOm').value,
        data_entrada: document.getElementById('editDataEntrada').value,
        data_conclusao: document.getElementById('editDataConclusao').value,
    };

    try {
        const response = await fetch(`http://localhost:3000/manutencoes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(manutencaoAtualizada),
        });
        const data = await response.json();

        if (data.success) {
            alert('Manutenção atualizada com sucesso!');
            location.reload();
        } else {
            alert('Erro ao atualizar manutenção.');
        }
    } catch (error) {
        console.error('Erro ao atualizar manutenção:', error);
    }
});

// modal para nova manutencao
document.getElementById('novaManutencaoForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const manutencao = {
        eb_viatura: document.getElementById('eb_viatura').value,
        marca_modelo: document.getElementById('marca_modelo').value,
        numero_os: document.getElementById('numero_os').value,
        om: document.getElementById('om').value,
        data_entrada: document.getElementById('data_entrada').value,
    };

    try {
        const response = await fetch('http://localhost:3000/manutencoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(manutencao),
        });
        const data = await response.json();

        if (data.success) {
            alert('Manutenção adicionada com sucesso!');
            carregarManutencoes('em_andamento', 'manutencoesEmAndamento');
            carregarManutencoes('concluidas', 'manutencoesConcluidas');
            event.target.reset();
        } else {
            alert(`Erro ao adicionar manutenção: ${data.message || data.error}`);
        }
    } catch (error) {
        console.error('Erro ao adicionar manutenção:', error);
    }
});

// funcao para excluir
async function excluirManutencao(id) {
    try {
        const response = await fetch(`http://localhost:3000/manutencoes/${id}`, { method: 'DELETE' });
        const data = await response.json();

        if (data.success) {
            alert('Manutenção excluída com sucesso!');
            carregarManutencoes('em_andamento', 'manutencoesEmAndamento');
            carregarManutencoes('concluidas', 'manutencoesConcluidas');
        } else {
            alert('Erro ao excluir manutenção.');
        }
    } catch (error) {
        console.error('Erro ao excluir manutenção:', error);
    }
}

// funcao para concluir
async function concluirManutencao(id) {
    try {
        const response = await fetch(`http://localhost:3000/manutencoes/concluir/${id}`, { method: 'PUT' });
        const data = await response.json();

        if (data.success) {
            alert('Manutenção concluída com sucesso!');
            carregarManutencoes('em_andamento', 'manutencoesEmAndamento');
            carregarManutencoes('concluidas', 'manutencoesConcluidas');
        } else {
            alert('Erro ao concluir manutenção.');
        }
    } catch (error) {
        console.error('Erro ao concluir manutenção:', error);
    }
}

// funcao para carregar manutencao
document.addEventListener('DOMContentLoaded', () => {
    carregarManutencoes('em_andamento', 'manutencoesEmAndamento');
    carregarManutencoes('concluidas', 'manutencoesConcluidas');
});