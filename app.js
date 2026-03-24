(function () {
    const modal = document.getElementById("pdf-modal");
    const docViewer = document.getElementById("pdf-viewer");
    const docTitle = document.getElementById("doc-title");
    const pdfContainer = document.querySelector(".pdf-container");

    let scrollY = 0;
    let loadToken = 0;
    let loadTimeoutId = null;

    function normalizeGoogleDocUrl(url) {
        if (!url) return "";

        if (url.includes("/preview")) {
            return url;
        }

        // Convierte enlaces /edit a /preview para una carga mas limpia.
        if (url.includes("/document/d/") && url.includes("/edit")) {
            return url.replace(/\/edit.*$/, "/preview");
        }

        return url;
    }

    function lockBodyScroll() {
        scrollY = window.scrollY || window.pageYOffset || 0;
        document.body.style.position = "fixed";
        document.body.style.top = "-" + scrollY + "px";
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";
    }

    function unlockBodyScroll() {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
    }

    function setLoadingState() {
        modal.classList.remove("ready", "has-error");
        pdfContainer.classList.add("loading");
    }

    function setReadyState() {
        modal.classList.add("ready");
        modal.classList.remove("has-error");
        pdfContainer.classList.remove("loading");
    }

    function setErrorState() {
        modal.classList.remove("ready");
        modal.classList.add("has-error");
        pdfContainer.classList.add("loading");
    }

    function clearPendingLoad() {
        if (loadTimeoutId) {
            clearTimeout(loadTimeoutId);
            loadTimeoutId = null;
        }
    }

    window.abrirDoc = function abrirDoc(titulo, enlaceGoogleDoc) {
        if (!enlaceGoogleDoc || enlaceGoogleDoc.includes("PonerLinkDeGoogleDoc")) {
            alert("Este documento aun no esta configurado. Por favor, contacta al administrador.");
            return;
        }

        const currentToken = ++loadToken;
        const cleanUrl = normalizeGoogleDocUrl(enlaceGoogleDoc);

        docTitle.textContent = titulo || "Partitura";
        setLoadingState();
        modal.classList.add("active");
        lockBodyScroll();

        clearPendingLoad();

        docViewer.onload = function () {
            if (currentToken !== loadToken) return;
            clearPendingLoad();
            setReadyState();
        };

        // Vacia primero para evitar el parpadeo de la partitura anterior.
        docViewer.src = "about:blank";

        requestAnimationFrame(function () {
            if (currentToken !== loadToken) return;
            docViewer.src = cleanUrl;
        });

        loadTimeoutId = setTimeout(function () {
            if (currentToken !== loadToken) return;
            setErrorState();
        }, 15000);
    };

    window.cerrarDoc = function cerrarDoc() {
        loadToken += 1;
        clearPendingLoad();
        docViewer.onload = null;
        docViewer.src = "about:blank";
        modal.classList.remove("active", "ready", "has-error");
        pdfContainer.classList.remove("loading");
        unlockBodyScroll();
    };

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && modal.classList.contains("active")) {
            window.cerrarDoc();
        }
    });

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            window.cerrarDoc();
        }
    });

    document.addEventListener("DOMContentLoaded", function () {
        const tarjetas = document.querySelectorAll(".score-card");

        tarjetas.forEach(function (tarjeta) {
            tarjeta.style.opacity = "0";
            tarjeta.style.transform = "translateY(30px)";
            tarjeta.style.transition = "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        });

        const observador = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada, index) {
                if (!entrada.isIntersecting) return;

                setTimeout(function () {
                    entrada.target.style.opacity = "1";
                    entrada.target.style.transform = "translateY(0)";
                }, index * 50);

                observador.unobserve(entrada.target);
            });
        }, { threshold: 0.1 });

        tarjetas.forEach(function (tarjeta) {
            observador.observe(tarjeta);
        });
    });
})();
