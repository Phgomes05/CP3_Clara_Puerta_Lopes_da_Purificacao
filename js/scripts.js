/* CP3 — Interatividade, validação e persistência local */
"use strict";

const STORAGE_THEME = "portfolio-clara-theme";
const STORAGE_MESSAGES = "portfolio-clara-messages";

function readStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.warn("Não foi possível ler os dados locais:", error);
        return fallback;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error("Não foi possível salvar os dados:", error);
        return false;
    }
}

/* Tema claro/escuro persistente */
function setupTheme() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle";
    button.setAttribute("aria-pressed", "false");
    button.textContent = "Ativar tema escuro";
    button.setAttribute("aria-label", "Alternar entre tema claro e escuro");
    const nav = document.querySelector("nav");
    if (!nav) return;
    nav.append(button);

    const savedTheme = localStorage.getItem(STORAGE_THEME);
    if (savedTheme === "dark") document.body.classList.add("dark-theme");
    updateThemeButton();

    button.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");
        const isDark = document.body.classList.contains("dark-theme");
        try { localStorage.setItem(STORAGE_THEME, isDark ? "dark" : "light"); }
        catch (error) { console.warn("Preferência de tema não salva.", error); }
        updateThemeButton();
    });

    function updateThemeButton() {
        const isDark = document.body.classList.contains("dark-theme");
        button.textContent = isDark ? "Ativar tema claro" : "Ativar tema escuro";
        button.setAttribute("aria-pressed", String(isDark));
    }
}

/* Formulário: validação customizada e lista persistida no navegador */
function setupContactForm() {
    const form = document.querySelector("#form-contato");
    if (!form) return;

    const feedback = document.querySelector("#form-feedback");
    const list = document.querySelector("#lista-mensagens");
    const messages = readStorage(STORAGE_MESSAGES, []);

    function renderMessages() {
        list.replaceChildren();
        if (!messages.length) {
            const empty = document.createElement("li");
            empty.textContent = "Nenhuma mensagem registrada neste navegador.";
            list.append(empty);
            return;
        }

        messages.forEach((message) => {
            const item = document.createElement("li");
            const heading = document.createElement("strong");
            heading.textContent = `${message.nome} — ${message.assunto}`;
            const detail = document.createElement("p");
            detail.textContent = `${message.email} | ${message.data}`;
            const content = document.createElement("p");
            content.textContent = message.mensagem;
            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "btn-secondary remove-message";
            remove.textContent = "Excluir";
            remove.setAttribute("aria-label", `Excluir mensagem de ${message.nome}`);
            remove.addEventListener("click", () => {
                const index = messages.findIndex((entry) => entry.id === message.id);
                if (index !== -1) messages.splice(index, 1);
                writeStorage(STORAGE_MESSAGES, messages);
                renderMessages();
                feedback.textContent = "Mensagem excluída do armazenamento local.";
                feedback.className = "form-feedback success";
            });
            item.append(heading, detail, content, remove);
            list.append(item);
        });
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        feedback.textContent = "";
        feedback.className = "form-feedback";

        if (!form.checkValidity()) {
            form.reportValidity();
            feedback.textContent = "Confira os campos obrigatórios e corrija os dados destacados.";
            feedback.classList.add("error");
            const invalid = form.querySelector(":invalid");
            if (invalid) invalid.focus();
            return;
        }

        const data = Object.fromEntries(new FormData(form).entries());
        const entry = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            nome: data.nome.trim(),
            email: data.email.trim(),
            data: data.data,
            assunto: form.querySelector("#assunto option:checked").textContent,
            mensagem: data.mensagem.trim()
        };

        messages.unshift(entry);
        if (!writeStorage(STORAGE_MESSAGES, messages)) {
            messages.shift();
            feedback.textContent = "O navegador não permitiu salvar. Verifique as configurações de armazenamento.";
            feedback.classList.add("error");
            return;
        }

        form.reset();
        renderMessages();
        feedback.textContent = "Mensagem registrada com sucesso neste navegador!";
        feedback.classList.add("success");
    });

    renderMessages();
}

/* Desenho no Canvas da página de gráficos */
function setupCanvas() {
    const canvas = document.querySelector("#desenho");
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#eaf5ef";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#006437";
    context.font = "bold 24px Arial";
    context.fillText("Meu desenvolvimento em tecnologia", 24, 42);

    const bars = [
        { label: "HTML", value: 85 },
        { label: "CSS", value: 75 },
        { label: "JavaScript", value: 60 },
        { label: "Lógica", value: 70 }
    ];
    bars.forEach((bar, index) => {
        const y = 72 + index * 43;
        context.fillStyle = "#17352a";
        context.font = "14px Arial";
        context.fillText(bar.label, 24, y + 17);
        context.fillStyle = "#cfe4d8";
        context.fillRect(130, y, 370, 22);
        context.fillStyle = index % 2 ? "#d4af37" : "#00864a";
        context.fillRect(130, y, 3.7 * bar.value, 22);
        context.fillStyle = "#17352a";
        context.fillText(`${bar.value}%`, 510, y + 17);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupTheme();
    setupContactForm();
    setupCanvas();
});
