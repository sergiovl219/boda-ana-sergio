/**
 * Boda Ana & Sergio — Lógica Principal
 * 
 * Módulos:
 * - Reproductor de música con autoplay + fallback táctil
 * - Animaciones de scroll (IntersectionObserver)
 * - Cuenta regresiva a la fecha de la boda
 * - RSVP dinámico por query params (?invitado=Nombre&pases=2)
 */

document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // 1. LÓGICA DE MÚSICA
    // =========================================
    const btnMusica = document.getElementById('btn-musica');
    const audioFondo = document.getElementById('musica-fondo');
    const iconoMusica = document.getElementById('icono-musica');
    const textoMusica = document.getElementById('texto-musica');
    let reproduciendo = true;

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

    btnMusica.addEventListener('click', function (e) {
        e.preventDefault();
        alternarMusica();
    });

    // Autoplay: al abrir la invitación desde el splash
    const splashOverlay = document.getElementById('splash-bienvenida');
    const btnAbrir = document.getElementById('btn-abrir-invitacion');

    function abrirInvitacion() {
        // Reproducir música (permitido porque es gesto del usuario)
        audioFondo.play().catch(error => {
            console.log("No se pudo reproducir el audio:", error);
        });

        // Animar y ocultar el splash
        splashOverlay.classList.add('splash-oculto');
        document.body.style.overflow = ''; // Restaurar el scroll al abrir
        splashOverlay.addEventListener('transitionend', () => {
            splashOverlay.style.display = 'none';
        });
    }

    btnAbrir.addEventListener('click', abrirInvitacion);
    btnAbrir.addEventListener('touchend', function (e) {
        e.preventDefault();
        abrirInvitacion();
    });

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
    // 4. RSVP DINÁMICO (Query Parameters con Base JSON)
    // =========================================
    const parametrosURL = new URLSearchParams(window.location.search);
    const idInvitado = parametrosURL.get('id');

    const textoPases = document.getElementById('texto-pases');
    const btnConfirmar = document.getElementById('btn-confirmar');
    const tituloInvitado = document.getElementById('titulo-invitado');
    const textoInvitado = document.getElementById('texto-invitado');

    // Números de WhatsApp: Ana 7711279279, Sergio 7712386266
    const TELEFONO_ANA = "5217711279279";
    const TELEFONO_SERGIO = "5217712386266";
    let telefonoWhatsApp = TELEFONO_SERGIO; // Por defecto Sergio

    function configurarMensajeGenerico() {
        textoPases.innerHTML = `¡Nos encantará verte ahí!`;
        const mensaje = `¡Hola! 🎉 Confirmo mi asistencia a la boda el 10 de octubre de 2026. ¡Qué emoción!`;
        btnConfirmar.href = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    }

    if (idInvitado) {
        fetch('/invitados.json')
            .then(response => {
                if (!response.ok) throw new Error("Error al obtener la lista de invitados");
                return response.json();
            })
            .then(invitados => {
                const info = invitados[idInvitado];
                if (info) {
                    // Determinar a quién se le envía la confirmación
                    if (info.contrayente && info.contrayente.toLowerCase() === 'ana') {
                        telefonoWhatsApp = TELEFONO_ANA;
                    } else {
                        telefonoWhatsApp = TELEFONO_SERGIO;
                    }

                    // Ajustar género/plural del bloque "Estás Invitado"
                    if (info.tipo === 'm') {
                        if (tituloInvitado) tituloInvitado.innerText = "Estás invitada";
                        if (textoInvitado) textoInvitado.innerText = "Nos encantaría que seas parte de este momento tan especial para nosotros.";
                    } else if (info.tipo === 'f') {
                        if (tituloInvitado) tituloInvitado.innerText = "Están invitados";
                        if (textoInvitado) textoInvitado.innerText = "Nos encantaría que fueran parte de este momento tan especial para nosotros.";
                    } else {
                        if (tituloInvitado) tituloInvitado.innerText = "Estás invitado";
                        if (textoInvitado) textoInvitado.innerText = "Nos encantaría que seas parte de este momento tan especial para nosotros.";
                    }

                    // Personalizar el texto y enlace
                    let textoLugares = "";
                    let mensaje = "";
                    
                    if (info.pases === 1) {
                        textoLugares = `Hemos reservado <strong>1 lugar</strong> para ti.`;
                        mensaje = `¡Hola! Soy *${info.nombre}*. Muchas gracias por la invitación. Confirmo mi asistencia con mucho gusto, utilizaré mi pase para acompañarlos y celebrar su unión.`;
                    } else {
                        if (info.tipo === 'f') {
                            textoLugares = `Hemos reservado <strong>${info.pases} lugares</strong> para ustedes.`;
                            mensaje = `¡Hola! Somos *${info.nombre}*. Muchas gracias por la invitación. Confirmamos nuestra asistencia con mucho gusto, utilizaremos nuestros ${info.pases} pases para acompañarlos y celebrar su unión.`;
                        } else {
                            textoLugares = `Hemos reservado <strong>${info.pases} lugares</strong> para ti.`;
                            mensaje = `¡Hola! Soy *${info.nombre}*. Muchas gracias por la invitación. Confirmo mi asistencia con mucho gusto, utilizaré mis ${info.pases} pases para acompañarlos y celebrar su unión.`;
                        }
                    }
                    textoPases.innerHTML = `
                        <span class="saludo">¡Hola, <span class="nombre">${info.nombre}</span>!</span>
                        <span class="texto-lugares">${textoLugares}</span>
                    `;

                    btnConfirmar.href = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`;
                } else {
                    configurarMensajeGenerico();
                }
            })
            .catch(error => {
                console.error("Error cargando los datos de personalización:", error);
                configurarMensajeGenerico();
            });
    } else {
        configurarMensajeGenerico();
    }
});
