/**
 * Boda Ana & Sergio — Lógica Principal
 * 
 * Módulos:
 * - Reproductor de música con autoplay + fallback táctil
 * - Animaciones de scroll (IntersectionObserver)
 * - Cuenta regresiva a la fecha de la boda
 * - RSVP dinámico por query params (?invitado=Nombre&pases=2)
 */

document.addEventListener("DOMContentLoaded", function() {
    
    // =========================================
    // 1. LÓGICA DE MÚSICA
    // =========================================
    const btnMusica = document.getElementById('btn-musica');
    const audioFondo = document.getElementById('musica-fondo');
    const iconoMusica = document.getElementById('icono-musica');
    const textoMusica = document.getElementById('texto-musica');
    let reproduciendo = false;

    // Íconos SVG
    const ICONO_PAUSA = '<path d="M6 4h4v16H6zM14 4h4v16h-4z"></path>';
    const ICONO_PLAY = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';

    // Sincronizar UI cuando el audio empiece a sonar
    audioFondo.addEventListener('play', () => {
        reproduciendo = true;
        btnMusica.classList.add('reproduciendo');
        textoMusica.innerText = "Pausar";
        iconoMusica.innerHTML = ICONO_PAUSA;
    });

    audioFondo.addEventListener('pause', () => {
        reproduciendo = false;
        btnMusica.classList.remove('reproduciendo');
        textoMusica.innerText = "Play";
        iconoMusica.innerHTML = ICONO_PLAY;
    });

    function alternarMusica() {
        if (reproduciendo) {
            audioFondo.pause();
        } else {
            audioFondo.play();
        }
    }

    btnMusica.addEventListener('click', function(e) {
        e.preventDefault();
        alternarMusica();
    });

    // Autoplay: intentar reproducir automáticamente,
    // si el navegador lo bloquea, iniciar con el primer toque/clic del usuario
    audioFondo.play().catch(() => {
        console.log("Autoplay bloqueado. Se iniciará con la primera interacción del usuario.");
    });

    function iniciarAudioAutomatico() {
        if (!reproduciendo) {
            audioFondo.play().catch(error => {
                console.log("No se pudo reproducir el audio:", error);
            });
        }
        document.body.removeEventListener('click', iniciarAudioAutomatico);
        document.body.removeEventListener('touchstart', iniciarAudioAutomatico);
    }

    document.body.addEventListener('click', iniciarAudioAutomatico, { once: true });
    document.body.addEventListener('touchstart', iniciarAudioAutomatico, { once: true });

    // =========================================
    // 2. ANIMACIONES FADE IN (IntersectionObserver)
    // =========================================
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(element => {
        observer.observe(element);
    });

    // =========================================
    // 3. CUENTA REGRESIVA
    // =========================================
    const fechaBoda = new Date("October 10, 2026 17:30:00").getTime();
    
    function actualizarContador() {
        const ahora = new Date().getTime();
        const distancia = fechaBoda - ahora;

        if (distancia < 0) {
            clearInterval(intervaloContador);
            document.getElementById("dias").innerHTML = "00";
            document.getElementById("horas").innerHTML = "00";
            document.getElementById("mins").innerHTML = "00";
            document.getElementById("segs").innerHTML = "00";
            return;
        }

        const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
        const segs = Math.floor((distancia % (1000 * 60)) / 1000);

        document.getElementById("dias").innerHTML = dias.toString().padStart(2, '0');
        document.getElementById("horas").innerHTML = horas.toString().padStart(2, '0');
        document.getElementById("mins").innerHTML = mins.toString().padStart(2, '0');
        document.getElementById("segs").innerHTML = segs.toString().padStart(2, '0');
    }

    actualizarContador(); // Ejecutar inmediatamente
    const intervaloContador = setInterval(actualizarContador, 1000);

    // =========================================
    // 4. RSVP DINÁMICO (Query Parameters)
    // =========================================
    const parametrosURL = new URLSearchParams(window.location.search);
    const nombreInvitado = parametrosURL.get('invitado');
    const numPases = parametrosURL.get('pases');
    
    const textoPases = document.getElementById('texto-pases');
    const btnConfirmar = document.getElementById('btn-confirmar');
    
    // ⚠️ CAMBIAR este número por el número real de WhatsApp
    const telefonoWhatsApp = "5217710000000"; 

    if (nombreInvitado && numPases) {
        textoPases.innerHTML = `¡Hola, ${nombreInvitado}! <br> Tienen <span style="font-weight:700;">${numPases} pases</span> reservados.`;
        const mensaje = `¡Hola Ana y Sergio! 🎉 Confirmo la asistencia de *${nombreInvitado}*. Usaremos nuestros ${numPases} pases para su boda el 10 de octubre. ¡Qué emoción!`;
        btnConfirmar.href = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    } else {
        textoPases.innerHTML = `¡Nos encantará verte ahí!`;
        const mensaje = `¡Hola Ana y Sergio! 🎉 Confirmo mi asistencia a su boda el 10 de octubre de 2026. ¡Qué emoción!`;
        btnConfirmar.href = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    }
});
