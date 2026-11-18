
/* =========================================
   MONTAÍ - JAVASCRIPT GERAL
   Funciona nas sete páginas HTML
   ========================================= */

/* =========================================
   1. CONFIGURAÇÕES E DADOS
   ========================================= */

const TAXA_SERVICO = 3;
const TAXA_ENTREGA = 6;
const PRECO_SORVETE_PERSONALIZADO = 22;

let carrinho = carregarCarrinho();
let saboresSelecionados = [];

/* Recupera o carrinho salvo no navegador */
function carregarCarrinho() {
    try {
        const dados = JSON.parse(localStorage.getItem("montaiCarrinho"));
        return Array.isArray(dados) ? dados : [];
    } catch (erro) {
        return [];
    }
}

/* Salva o carrinho no navegador */
function salvarCarrinho() {
    localStorage.setItem("montaiCarrinho", JSON.stringify(carrinho));
}

/* Formata valores em reais */
function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

/* =========================================
   2. LOGIN - INDEX.HTML
   ========================================= */

const formLogin = document.getElementById("formLogin");

if (formLogin) {
    formLogin.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value.trim();
        const mensagem = document.getElementById("msgLogin");

        if (!email || !senha) {
            mostrarMensagemLogin("Preencha todos os campos.", "erro");
            return;
        }

        if (senha.length < 4) {
            mostrarMensagemLogin("A senha deve ter pelo menos 4 caracteres.", "erro");
            return;
        }

        localStorage.setItem("montaiUsuario", email);

        mostrarMensagemLogin("Login realizado! Redirecionando...", "sucesso");

        setTimeout(function () {
            window.location.href = "home.html";
        }, 800);
    });
}

function mostrarMensagemLogin(texto, tipo) {
    const mensagem = document.getElementById("msgLogin");

    if (!mensagem) return;

    mensagem.textContent = texto;
    mensagem.hidden = false;
    mensagem.style.color = tipo === "erro" ? "#D64545" : "#269B65";
}

/* =========================================
   3. HOME - HOME.HTML
   ========================================= */

function atualizarSaudacao() {
    const usuario = localStorage.getItem("montaiUsuario");
    const titulo = document.querySelector(".saudacao h2");

    if (usuario && titulo) {
        const nome = usuario.split("@")[0];
        const nomeFormatado = nome.charAt(0).toUpperCase() + nome.slice(1);

        titulo.textContent = `Olá, ${nomeFormatado}!`;
    }
}

atualizarSaudacao();

/* =========================================
   4. CARDÁPIO - CARDAPIO.HTML
   ========================================= */

/* Filtros por categoria */
const botoesFiltro = document.querySelectorAll(".filtro");
const cardsProduto = document.querySelectorAll(".card-produto");

botoesFiltro.forEach(function (botao) {
    botao.addEventListener("click", function () {
        const categoria = botao.dataset.filtro;

        botoesFiltro.forEach(function (item) {
            item.classList.remove("ativo");
        });

        botao.classList.add("ativo");

        cardsProduto.forEach(function (card) {
            const categoriaProduto = card.dataset.categoria;

            if (categoria === "Todos" || categoriaProduto === categoria) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        });
    });
});

/* Busca de produtos */
const campoBusca = document.getElementById("busca-produto");

if (campoBusca) {
    campoBusca.addEventListener("input", function () {
        const pesquisa = campoBusca.value.toLowerCase().trim();

        cardsProduto.forEach(function (card) {
            const nome = card.querySelector("h3")?.textContent.toLowerCase() || "";
            const descricao = card.querySelector("p")?.textContent.toLowerCase() || "";

            const corresponde = nome.includes(pesquisa) || descricao.includes(pesquisa);

            const filtroAtivo = document.querySelector(".filtro.ativo");
            const categoria = filtroAtivo?.dataset.filtro || "Todos";

            const correspondeCategoria =
                categoria === "Todos" || card.dataset.categoria === categoria;

            card.style.display =
                corresponde && correspondeCategoria ? "" : "none";
        });
    });
}

/* Lê a categoria que veio da Home pela URL */
const parametrosURL = new URLSearchParams(window.location.search);
const categoriaURL = parametrosURL.get("categoria");

if (categoriaURL) {
    const filtroCorrespondente = document.querySelector(
        `.filtro[data-filtro="${categoriaURL}"]`
    );

    if (filtroCorrespondente) {
        filtroCorrespondente.click();
    }
}

/* =========================================
   5. ADICIONAR PRODUTOS AO CARRINHO
   ========================================= */

document.querySelectorAll(".card-produto .botao-escolher").forEach(function (botao) {
    botao.addEventListener("click", function () {
        const nome = botao.dataset.produto;
        const preco = Number(botao.dataset.preco);

        adicionarAoCarrinho(nome, preco, "produto");

        const textoOriginal = botao.textContent;

        botao.textContent = "Adicionado!";
        botao.disabled = true;

        setTimeout(function () {
            botao.textContent = textoOriginal;
            botao.disabled = false;
        }, 1000);
    });
});

/* Adiciona um item ao carrinho */
function adicionarAoCarrinho(nome, preco, tipo, descricao = "") {
    const itemExistente = carrinho.find(function (item) {
        return item.nome === nome && item.tipo === tipo;
    });

    if (itemExistente) {
        itemExistente.quantidade++;
    } else {
        carrinho.push({
            id: Date.now() + Math.random(),
            nome: nome,
            preco: preco,
            quantidade: 1,
            tipo: tipo,
            descricao: descricao
        });
    }

    salvarCarrinho();
    atualizarContadorCarrinho();
    atualizarCarrinho();
}

/* =========================================
   6. MONTAR SORVETE
   MONTAR-SORVETE.HTML
   ========================================= */

const opcoesSabor = document.querySelectorAll(".opcao-sabor");
const areaSaboresEscolhidos = document.getElementById("sabores-escolhidos");

opcoesSabor.forEach(function (botao) {
    botao.addEventListener("click", function () {
        const sabor = botao.dataset.sabor;

        if (saboresSelecionados.includes(sabor)) {
            saboresSelecionados = saboresSelecionados.filter(function (item) {
                return item !== sabor;
            });

            botao.classList.remove("selecionado");
        } else {
            if (saboresSelecionados.length >= 3) {
                alert("Você pode escolher no máximo 3 sabores.");
                return;
            }

            saboresSelecionados.push(sabor);
            botao.classList.add("selecionado");
        }

        atualizarSaboresSelecionados();
    });
});

/* Atualiza a lista visual de sabores escolhidos */
function atualizarSaboresSelecionados() {
    if (!areaSaboresEscolhidos) return;

    areaSaboresEscolhidos.innerHTML = "";

    if (saboresSelecionados.length === 0) {
        areaSaboresEscolhidos.innerHTML =
            '<span class="mensagem-vazia">Nenhum sabor selecionado.</span>';
        return;
    }

    saboresSelecionados.forEach(function (sabor) {
        const elemento = document.createElement("span");
        elemento.textContent = sabor;
        areaSaboresEscolhidos.appendChild(elemento);
    });
}

/* Botão Continuar da montagem */
const botaoContinuarMontagem = document.getElementById("continuar-montagem");

if (botaoContinuarMontagem) {
    botaoContinuarMontagem.addEventListener("click", function () {
        if (saboresSelecionados.length === 0) {
            alert("Escolha pelo menos um sabor para continuar.");
            return;
        }

        const descricao = saboresSelecionados.join(" + ");
        const nome = "Sorvete personalizado";

        adicionarAoCarrinho(
            nome,
            PRECO_SORVETE_PERSONALIZADO,
            "personalizado",
            descricao
        );

        alert("Seu sorvete foi adicionado ao carrinho!");

        window.location.href = "carrinho.html";
    });
}

/* =========================================
   7. CONTADOR DO CARRINHO
   ========================================= */

function atualizarContadorCarrinho() {
    const contador = document.getElementById("contador-carrinho");

    if (!contador) return;

    const quantidadeTotal = carrinho.reduce(function (total, item) {
        return total + item.quantidade;
    }, 0);

    contador.textContent = quantidadeTotal;
}

atualizarContadorCarrinho();

/* =========================================
   8. TELA DO CARRINHO
   CARRINHO.HTML
   ========================================= */

function atualizarCarrinho() {
    const areaCarrinho = document.getElementById("itens-carrinho");

    if (!areaCarrinho) return;

    areaCarrinho.innerHTML = "";

    if (carrinho.length === 0) {
        areaCarrinho.innerHTML = `
            <div class="carrinho-vazio">
                <i class="fa-solid fa-cart-shopping"></i>
                <h3>Seu carrinho está vazio!</h3>
                <p>Que tal escolher um sorvete delicioso?</p>
                <a href="cardapio.html" class="botao-principal">
                    VER CARDÁPIO
                </a>
            </div>
        `;

        atualizarTotaisCarrinho();
        return;
    }

    carrinho.forEach(function (item) {
        const artigo = document.createElement("article");
        artigo.className = "item-carrinho";

        const imagem = item.tipo === "personalizado"
            ? "assets/img/sorvete-banner.svg"
            : "assets/img/chocolate.svg";

        const descricao = item.descricao || item.nome;

        artigo.innerHTML = `
            <img src="${imagem}" alt="Produto do carrinho">

            <div class="item-carrinho-info">
                <h3>${item.nome}</h3>
                <p>${descricao}</p>
                <strong>${formatarMoeda(item.preco * item.quantidade)}</strong>

                <div class="controle-quantidade">
                    <button type="button" data-acao="diminuir" data-id="${item.id}" aria-label="Diminuir quantidade">−</button>
                    <span>${item.quantidade}</span>
                    <button type="button" data-acao="aumentar" data-id="${item.id}" aria-label="Aumentar quantidade">+</button>
                </div>
            </div>

            <button type="button" class="remover-item" data-acao="remover" data-id="${item.id}" aria-label="Remover item">
                <i class="fa-regular fa-trash-can"></i>
            </button>
        `;

        areaCarrinho.appendChild(artigo);
    });

    atualizarTotaisCarrinho();
}

/* Ações de quantidade e remoção */
const areaItensCarrinho = document.getElementById("itens-carrinho");

if (areaItensCarrinho) {
    areaItensCarrinho.addEventListener("click", function (event) {
        const botao = event.target.closest("button[data-acao]");

        if (!botao) return;

        const id = Number(botao.dataset.id);
        const acao = botao.dataset.acao;

        const item = carrinho.find(function (produto) {
            return produto.id === id;
        });

        if (!item) return;

        if (acao === "aumentar") {
            item.quantidade++;
        }

        if (acao === "diminuir") {
            item.quantidade--;

            if (item.quantidade <= 0) {
                carrinho = carrinho.filter(function (produto) {
                    return produto.id !== id;
                });
            }
        }

        if (acao === "remover") {
            carrinho = carrinho.filter(function (produto) {
                return produto.id !== id;
            });
        }

        salvarCarrinho();
        atualizarCarrinho();
        atualizarContadorCarrinho();
    });
}

/* Calcula o subtotal */
function calcularSubtotal() {
    return carrinho.reduce(function (total, item) {
        return total + item.preco * item.quantidade;
    }, 0);
}

/* Atualiza os valores do carrinho */
function atualizarTotaisCarrinho() {
    const subtotal = calcularSubtotal();
    const total = subtotal + (subtotal > 0 ? TAXA_SERVICO : 0);

    const elementoSubtotal = document.getElementById("subtotal-carrinho");
    const elementoTaxa = document.getElementById("taxa-servico");
    const elementoTotal = document.getElementById("total-carrinho");

    if (elementoSubtotal) elementoSubtotal.textContent = formatarMoeda(subtotal);
    if (elementoTaxa) elementoTaxa.textContent = formatarMoeda(subtotal > 0 ? TAXA_SERVICO : 0);
    if (elementoTotal) elementoTotal.textContent = formatarMoeda(total);
}

atualizarCarrinho();

/* =========================================
   9. CHECKOUT
   CHECKOUT.HTML
   ========================================= */

const opcoesTipoEntrega = document.querySelectorAll(
    'input[name="tipo-entrega"]'
);

const blocoEndereco = document.getElementById("bloco-endereco");

opcoesTipoEntrega.forEach(function (opcao) {
    opcao.addEventListener("change", function () {
        atualizarCheckout();
    });
});

function obterTipoEntrega() {
    return document.querySelector(
        'input[name="tipo-entrega"]:checked'
    )?.value || "entrega";
}

/* Atualiza os valores e o endereço no checkout */
function atualizarCheckout() {
    const subtotal = calcularSubtotal();
    const tipoEntrega = obterTipoEntrega();

    const taxa = tipoEntrega === "entrega" ? TAXA_ENTREGA : 0;
    const total = subtotal + taxa;

    const elementoSubtotal = document.getElementById("subtotal-checkout");
    const elementoTaxa = document.getElementById("taxa-entrega");
    const elementoTotal = document.getElementById("total-checkout");

    if (elementoSubtotal) {
        elementoSubtotal.textContent = formatarMoeda(subtotal);
    }

    if (elementoTaxa) {
        elementoTaxa.textContent = formatarMoeda(taxa);
    }

    if (elementoTotal) {
        elementoTotal.textContent = formatarMoeda(total);
    }

    if (blocoEndereco) {
        blocoEndereco.style.display =
            tipoEntrega === "entrega" ? "" : "none";
    }

    document.querySelectorAll(".opcao-entrega").forEach(function (label) {
        const input = label.querySelector("input");
        label.classList.toggle("selecionada", input?.checked || false);
    });
}

atualizarCheckout();

/* Botões Alterar: levam o usuário aos campos de endereço ou pagamento */
document.querySelectorAll(".botao-alterar").forEach(function (botao) {
    botao.addEventListener("click", function () {
        const bloco = botao.closest(".bloco-checkout");

        if (!bloco) return;

        const campos = bloco.querySelector(".campos-endereco");

        if (campos) {
            campos.scrollIntoView({ behavior: "smooth", block: "center" });
            campos.querySelector("input")?.focus();
            return;
        }

        bloco.querySelector(".opcoes-pagamento")?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    });
});

/* =========================================
   10. FINALIZAR PEDIDO
   ========================================= */

const formCheckout = document.getElementById("form-checkout");

if (formCheckout) {
    formCheckout.addEventListener("submit", function (event) {
        event.preventDefault();

        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio. Adicione produtos antes de finalizar.");
            window.location.href = "cardapio.html";
            return;
        }

        const tipoEntrega = obterTipoEntrega();
        const pagamento = document.querySelector(
            'input[name="pagamento"]:checked'
        )?.value;

        if (!pagamento) {
            alert("Selecione uma forma de pagamento.");
            return;
        }

        if (tipoEntrega === "entrega") {
            const rua = document.getElementById("rua").value.trim();
            const bairro = document.getElementById("bairro").value.trim();
            const cidade = document.getElementById("cidade").value.trim();

            if (!rua || !bairro || !cidade) {
                alert("Preencha rua, bairro e cidade para receber seu pedido.");
                return;
            }
        }

        const subtotal = calcularSubtotal();
        const taxa = tipoEntrega === "entrega" ? TAXA_ENTREGA : 0;
        const total = subtotal + taxa;

        const pedido = {
            numero: Math.floor(1000 + Math.random() * 9000),
            itens: carrinho,
            tipoEntrega: tipoEntrega,
            pagamento: pagamento,
            subtotal: subtotal,
            taxa: taxa,
            total: total,
            data: new Date().toISOString()
        };

        localStorage.setItem("montaiPedido", JSON.stringify(pedido));

        carrinho = [];
        salvarCarrinho();

        window.location.href = "confirmacao.html";
    });
}

/* =========================================
   11. CONFIRMAÇÃO DO PEDIDO
   CONFIRMACAO.HTML
   ========================================= */

function atualizarConfirmacao() {
    const numeroPedido = document.getElementById("numero-pedido");

    if (!numeroPedido) return;

    try {
        const pedido = JSON.parse(localStorage.getItem("montaiPedido"));

        if (pedido && pedido.numero) {
            numeroPedido.textContent = "#" + pedido.numero;
        }
    } catch (erro) {
        numeroPedido.textContent = "#0001";
    }
}

atualizarConfirmacao();

/* =========================================
   12. INICIALIZAÇÃO
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
    atualizarContadorCarrinho();
    atualizarCarrinho();
    atualizarCheckout();
});

// =========================================
// CADASTRO DE USUÁRIO - MONTAÍ
// =========================================

const formCadastro = document.getElementById("formCadastro");

if (formCadastro) {

    const mensagemCadastro = document.getElementById("msgCadastro");

    formCadastro.addEventListener("submit", function (event) {

        event.preventDefault();

        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("emailCadastro").value.trim();
        const senha = document.getElementById("senhaCadastro").value;
        const confirmarSenha = document.getElementById("confirmarSenha").value;
        const termos = document.getElementById("aceitarTermos").checked;

        // Função para exibir mensagens
        function mostrarMensagemCadastro(texto, tipo) {
            mensagemCadastro.textContent = texto;
            mensagemCadastro.className = "mensagem-cadastro " + tipo;
            mensagemCadastro.hidden = false;
        }

        // Validar nome
        if (nome.length < 3) {
            mostrarMensagemCadastro(
                "Digite seu nome completo.",
                "erro"
            );
            return;
        }

        // Validar senha
        if (senha.length < 8) {
            mostrarMensagemCadastro(
                "A senha deve ter pelo menos 8 caracteres.",
                "erro"
            );
            return;
        }

        // Confirmar senha
        if (senha !== confirmarSenha) {
            mostrarMensagemCadastro(
                "As senhas não são iguais. Confira novamente.",
                "erro"
            );
            return;
        }

        // Verificar termos
        if (!termos) {
            mostrarMensagemCadastro(
                "Você precisa aceitar os termos de uso.",
                "erro"
            );
            return;
        }

        // Cadastro demonstrativo
        mostrarMensagemCadastro(
            "Cadastro realizado com sucesso! Você será direcionado ao login.",
            "sucesso"
        );

        // Voltar para login após sucesso
        setTimeout(function () {
            window.location.href = "index.html";
        }, 2000);

    });

}
