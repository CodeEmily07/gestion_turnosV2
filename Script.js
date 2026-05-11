const STORAGE_KEY = "gestionTurnosEstado";

const elementos = {
    pausarEntradaBtn: document.getElementById("pausarEntradaBtn"),
    reiniciarDiaBtn: document.getElementById("reiniciarDiaBtn"),
    nombreYApellidoInput: document.getElementById("nombreYApellidoInput"),
    anotarBtn: document.getElementById("anotarBtn"),
    atenderSiguienteBtn: document.getElementById("atenderSiguienteBtn"),
    visorActual: document.getElementById("visorActual"),
    turnosAnotados: document.getElementById("turnosAnotados"),
    turnosAtendidos: document.getElementById("turnosAtendidos"),
    turnosEnEspera: document.getElementById("turnosEnEspera"),
    estadoEntrada: document.getElementById("estadoEntrada"),
    listaEspera: document.getElementById("listaEspera")
};

let estado = cargarEstado();

function cargarEstado() {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (!guardado) {
        return {
            entradaPausada: false,
            cola: [],
            actual: null,
            totalAnotados: 0,
            totalAtendidos: 0
        };
    }

    try {
        return JSON.parse(guardado);
    } catch {
        return {
            entradaPausada: false,
            cola: [],
            actual: null,
            totalAnotados: 0,
            totalAtendidos: 0
        };
    }
}

function guardarEstado() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
}

function normalizarNombre(nombre) {
    return nombre
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

function render() {
    elementos.pausarEntradaBtn.textContent = estado.entradaPausada
        ? "Reanudar entrada"
        : "Pausar entrada";

    elementos.estadoEntrada.textContent = estado.entradaPausada ? "Pausada" : "Activa";
    elementos.estadoEntrada.style.color = estado.entradaPausada ? "#b91c1c" : "#047857";

    elementos.nombreYApellidoInput.disabled = estado.entradaPausada;
    elementos.anotarBtn.disabled = estado.entradaPausada;

    elementos.turnosAnotados.textContent = String(estado.totalAnotados);
    elementos.turnosAtendidos.textContent = String(estado.totalAtendidos);
    elementos.turnosEnEspera.textContent = String(estado.cola.length);

    if (estado.actual) {
        elementos.visorActual.textContent = `Atendiendo: ${estado.actual}`;
    } else {
        elementos.visorActual.textContent = "No hay turnos atendidos todavía";
    }

    elementos.listaEspera.innerHTML = "";
    if (estado.cola.length === 0) {
        const li = document.createElement("li");
        li.className = "mensaje-vacio";
        li.textContent = "No hay personas en espera.";
        elementos.listaEspera.append(li);
        return;
    }

    estado.cola.forEach((persona, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${persona}`;
        elementos.listaEspera.append(li);
    });
}

function anotarPersona() {
    if (estado.entradaPausada) {
        alert("La entrada está pausada.");
        return;
    }

    const nombreCrudo = elementos.nombreYApellidoInput.value;
    if (!nombreCrudo.trim()) {
        alert("Ingresá un nombre y apellido válido.");
        elementos.nombreYApellidoInput.focus();
        return;
    }

    const nombre = normalizarNombre(nombreCrudo);
    estado.cola.push(nombre);
    estado.totalAnotados += 1;
    elementos.nombreYApellidoInput.value = "";
    guardarEstado();
    render();
    elementos.nombreYApellidoInput.focus();
}

function atenderSiguiente() {
    if (estado.cola.length === 0) {
        alert("No hay personas en lista de espera.");
        return;
    }

    estado.actual = estado.cola.shift();
    estado.totalAtendidos += 1;
    guardarEstado();
    render();
}

function alternarEntrada() {
    estado.entradaPausada = !estado.entradaPausada;
    guardarEstado();
    render();
}

function reiniciarDia() {
    const confirmar = confirm("¿Seguro que querés reiniciar el día? Se perderán todos los turnos.");
    if (!confirmar) {
        return;
    }

    estado = {
        entradaPausada: false,
        cola: [],
        actual: null,
        totalAnotados: 0,
        totalAtendidos: 0
    };
    guardarEstado();
    render();
}

elementos.anotarBtn.addEventListener("click", anotarPersona);
elementos.atenderSiguienteBtn.addEventListener("click", atenderSiguiente);
elementos.pausarEntradaBtn.addEventListener("click", alternarEntrada);
elementos.reiniciarDiaBtn.addEventListener("click", reiniciarDia);
elementos.nombreYApellidoInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        anotarPersona();
    }
});

render();
