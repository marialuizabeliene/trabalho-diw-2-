const API_URL = "http://localhost:3000/itens";


async function buscarItens() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Erro ao carregar itens");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}


async function carregarItensNaPagina(containerId, mostrarFavoritos = false) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  const itens = await buscarItens();
  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  let itensExibir = itens;
  if (mostrarFavoritos) {
    itensExibir = itens.filter(i => favoritos.includes(i.id));
  }
  if(itensExibir.length === 0){
    container.innerHTML = `<p class="text-center">Nenhum item para mostrar.</p>`;
    return;
  }
  itensExibir.forEach(item => {
    const card = document.createElement("div");
    card.className = "col";
    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${item.imagem}" class="card-img-top" alt="${item.nome}" />
        <div class="card-body">
          <h5 class="card-title fw-bold">${item.nome}</h5>
          <p class="card-text">${item.descricao}</p>
          <a href="detalhe.html?id=${item.id}" class="btn btn-saiba-mais">Saiba Mais</a>
          <button class="btn btn-danger btn-remove-fav mt-2" data-id="${item.id}">Remover Favorito</button>
        </div>
      </div>`;
    container.appendChild(card);
  });

 
  document.querySelectorAll(".btn-remove-fav").forEach(btn => {
    btn.addEventListener("click", () => {
      removerFavorito(parseInt(btn.dataset.id));
      carregarItensNaPagina(containerId, mostrarFavoritos);
    });
  });
}


function adicionarFavorito(id) {
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  if (!favoritos.includes(id)) {
    favoritos.push(id);
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  }
}


function removerFavorito(id) {
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  favoritos = favoritos.filter(favId => favId !== id);
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
}


function obterIdUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}


async function carregarDetalhes() {
  const id = obterIdUrl();
  if (!id) {
    alert("ID do item não especificado");
    window.location.href = "index.html";
    return;
  }
  const itens = await buscarItens();
  const item = itens.find(i => i.id === parseInt(id));
  if (!item) {
    alert("Item não encontrado");
    window.location.href = "index.html";
    return;
  }
  document.getElementById("eventoImagem").src = item.imagem;
  document.getElementById("eventoImagem").alt = item.nome;
  document.getElementById("eventoTitulo").textContent = item.nome;
  document.getElementById("eventoDescricao").textContent = item.descricao;

  const btnFav = document.getElementById("btnFavoritar");
  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  if (favoritos.includes(item.id)) {
    btnFav.textContent = "Remover dos Favoritos";
  } else {
    btnFav.textContent = "Adicionar aos Favoritos";
  }
  btnFav.onclick = () => {
    if (favoritos.includes(item.id)) {
      removerFavorito(item.id);
      btnFav.textContent = "Adicionar aos Favoritos";
    } else {
      adicionarFavorito(item.id);
      btnFav.textContent = "Remover dos Favoritos";
    }
  };
}


async function cadastrarItem(event) {
  event.preventDefault();
  const nome = document.getElementById("itemName").value.trim();
  const descricao = document.getElementById("itemDescription").value.trim();
  const imagem = document.getElementById("itemImage").value.trim();

  if (!nome || !descricao || !imagem) {
    alert("Preencha todos os campos");
    return;
  }

  const novoItem = { nome, descricao, imagem };
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(novoItem)
    });
    if (!res.ok) throw new Error("Erro ao cadastrar item");
    alert("Item cadastrado com sucesso!");
    window.location.href = "index.html";
  } catch (error) {
    alert("Erro ao cadastrar item");
    console.error(error);
  }
}


function initCadastro() {
  const form = document.getElementById("cadastroForm");
  if (form) {
    form.addEventListener("submit", cadastrarItem);
  }
}


async function carregarGrafico() {
  const itens = await buscarItens();
  const nomes = itens.map(i => i.nome);
  const quantidades = nomes.map(() => Math.floor(Math.random() * 100) + 1); 

  const ctx = document.getElementById("graficoEventos");
  if (!ctx) return;
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: nomes,
      datasets: [{
        label: "Quantidade de Participantes",
        data: quantidades,
        backgroundColor: "rgba(13, 110, 253, 0.7)",
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}


function atualizarMenu() {
  const logado = !!localStorage.getItem("usuarioLogado");
  document.getElementById("loginLink").style.display = logado ? "none" : "block";
  document.getElementById("logoutLink").style.display = logado ? "block" : "none";
  document.getElementById("favoritosLink").style.display = logado ? "block" : "none";
  document.getElementById("cadastroLink").style.display = logado ? "block" : "none";
}


function logout() {
  localStorage.removeItem("usuarioLogado");
  atualizarMenu();
  window.location.href = "index.html";
}

document.getElementById("logoutLink")?.addEventListener("click", e => {
  e.preventDefault();
  logout();
});


function initIndex() {
  carregarItensNaPagina("eventosContainer");
  carregarGrafico();
  atualizarMenu();
}


function initFavoritos() {
  carregarItensNaPagina("favoritosContainer", true);
  atualizarMenu();
}


function initDetalhe() {
  carregarDetalhes();
  atualizarMenu();
}

initCadastro();
