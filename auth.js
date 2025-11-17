// Hash de la contraseña (SHA-256)
const PASSWORD_HASH = "a994696540befd55c96017a162c7ae2685f2010a7fd3224c0ada25241913933b";

// Duración del login en milisegundos (3 horas)
const LOGIN_DURATION = 3 * 60 * 60 * 1000;

// Hashea texto con SHA-256
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Verifica si el usuario ya está logueado
function usuarioAutenticado() {
    const loginTime = localStorage.getItem("login_time");
    if (!loginTime) return false;

    const diferencia = Date.now() - Number(loginTime);
    return diferencia < LOGIN_DURATION;
}

// Guardar login
function registrarLogin() {
    localStorage.setItem("login_time", Date.now());
}

// Validar password
async function validarPassword() {
    const pass = document.getElementById("input-pass").value;
    const hash = await sha256(pass);

    if (hash === PASSWORD_HASH) {
        registrarLogin();

        // Animación
        document.getElementById("auth-msg").style.display = "none";
        document.getElementById("auth-overlay").style.opacity = "0";

        setTimeout(() => {
            document.getElementById("auth-overlay").remove();
        }, 300);

    } else {
        const msg = document.getElementById("auth-msg");
        msg.style.display = "block";
        msg.textContent = "Contraseña incorrecta ❌";
    }
}

// Enter para aceptar
document.addEventListener("keydown", e => {
    if (e.key === "Enter") validarPassword();
});

// Mostrar u ocultar overlay al cargar
window.onload = () => {
    if (!usuarioAutenticado()) {
        document.getElementById("auth-overlay").style.display = "flex";
    }
};
