    // // Hash de la contraseña "123" (SHA-256)
    // const PASSWORD_HASH = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";

    // // Hashear texto con SHA-256
    // async function sha256(message) {
    //   const msgBuffer = new TextEncoder().encode(message);
    //   const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    //   const hashArray = Array.from(new Uint8Array(hashBuffer));
    //   return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    // }

    // async function validarPassword() {
    //   const pass = document.getElementById("input-pass").value;
    //   const hash = await sha256(pass);

    //   if (hash === PASSWORD_HASH) {
    //     // Animación suave y quita overlay
    //     document.getElementById("auth-msg").style.display = "none";
    //     document.getElementById("auth-overlay").style.opacity = "0";
    //     setTimeout(() => document.getElementById("auth-overlay").remove(), 300);
    //   } else {
    //     const msg = document.getElementById("auth-msg");
    //     msg.style.display = "block";
    //     msg.textContent = "Contraseña incorrecta ❌";
    //   }
    // }

    // // Permitir presionar Enter
    // document.addEventListener("keydown", e => {
    //   if (e.key === "Enter") validarPassword();
    // });