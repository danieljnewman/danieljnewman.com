/* =========================
   LOAD SHARED HEADER
   ========================= */

async function loadHeader() {

  const headerContainer = document.querySelector("#site-header");

  if (!headerContainer) {
    return;
  }

  try {

    const response = await fetch("/header.html");

    if (!response.ok) {
      throw new Error("Failed to load header");
    }

    const headerHTML = await response.text();

    headerContainer.innerHTML = headerHTML;

    initialiseNavigation();

  } catch (error) {

    console.error("Error loading header:", error);

  }

}


/* =========================
   MOBILE NAVIGATION
   ========================= */

function initialiseNavigation() {

  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("nav");

  if (menuToggle && nav) {

    menuToggle.addEventListener("click", () => {

      const isOpen = nav.classList.toggle("open");

      menuToggle.classList.toggle("open", isOpen);
      menuToggle.setAttribute("aria-expanded", isOpen);

    });

  }


  /* =========================
     MOBILE SUBMENUS
     ========================= */

  const submenuToggles =
    document.querySelectorAll(".submenu-toggle");

  submenuToggles.forEach(toggle => {

    toggle.addEventListener("click", () => {

      const parent = toggle.closest(".nav-item-with-toggle");

      if (!parent) {
        return;
      }

      const submenu = parent.parentElement.querySelector(
        ":scope > .submenu"
      );

      if (!submenu) {
        return;
      }

      const isOpen = submenu.classList.toggle("open");

      toggle.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen);

    });

  });


  /* =========================
     ACTIVE PAGE
     ========================= */

  const currentPage =
    window.location.pathname.replace(/\/$/, "");

  document.querySelectorAll("nav a").forEach(link => {

    const linkPage =
      new URL(link.href, window.location.origin)
        .pathname
        .replace(/\/$/, "");

    if (linkPage === currentPage) {
      link.classList.add("active");
    }

  });

}


/* =========================
   START HEADER
   ========================= */

loadHeader();


/* =========================
   LIGHTBOX
   ========================= */

const lightboxLinks = document.querySelectorAll(".lightbox");
const lightbox = document.querySelector(".lightbox-view");

if (lightboxLinks.length && lightbox) {

  const lightboxImage = lightbox.querySelector("img");
  const closeButton = lightbox.querySelector(".lightbox-close");
  const previousButton = lightbox.querySelector(".lightbox-prev");
  const nextButton = lightbox.querySelector(".lightbox-next");

  let currentPhoto = 0;


  /* =========================
     SHOW PHOTO
     ========================= */

  function showPhoto(index) {

    if (index < 0) {
      index = lightboxLinks.length - 1;
    }

    if (index >= lightboxLinks.length) {
      index = 0;
    }

    currentPhoto = index;

    const link = lightboxLinks[currentPhoto];
    const image = link.querySelector("img");

    lightboxImage.src = link.href;
    lightboxImage.alt = image.alt;

    lightbox.style.display = "flex";

  }


  /* =========================
     CLOSE LIGHTBOX
     ========================= */

  function closeLightbox() {

    lightbox.style.display = "none";
    lightboxImage.src = "";

  }


  /* =========================
     PHOTO CLICK
     ========================= */

  lightboxLinks.forEach((link, index) => {

    link.addEventListener("click", function(e) {

      e.preventDefault();

      showPhoto(index);

    });

  });


  /* =========================
     PREVIOUS BUTTON
     ========================= */

  if (previousButton) {

    previousButton.addEventListener("click", function(e) {

      e.stopPropagation();

      showPhoto(currentPhoto - 1);

    });

  }


  /* =========================
     NEXT BUTTON
     ========================= */

  if (nextButton) {

    nextButton.addEventListener("click", function(e) {

      e.stopPropagation();

      showPhoto(currentPhoto + 1);

    });

  }


  /* =========================
     CLOSE BUTTON
     ========================= */

  if (closeButton) {

    closeButton.addEventListener("click", function(e) {

      e.stopPropagation();

      closeLightbox();

    });

  }


  /* =========================
     CLICK OUTSIDE IMAGE
     ========================= */

  lightbox.addEventListener("click", function(e) {

    if (e.target === lightbox) {

      closeLightbox();

    }

  });


  /* =========================
     KEYBOARD CONTROLS
     ========================= */

  document.addEventListener("keydown", function(e) {

    if (lightbox.style.display !== "flex") {
      return;
    }

    if (e.key === "ArrowLeft") {

      showPhoto(currentPhoto - 1);

    }

    if (e.key === "ArrowRight") {

      showPhoto(currentPhoto + 1);

    }

    if (e.key === "Escape") {

      closeLightbox();

    }

  });

}   MOBILE NAVIGATION
   ========================= */

function initialiseNavigation() {

  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("nav");

  if (menuToggle && nav) {

    menuToggle.addEventListener("click", () => {

      const isOpen = nav.classList.toggle("open");

      menuToggle.classList.toggle("open", isOpen);
      menuToggle.setAttribute("aria-expanded", isOpen);

    });

  }


  /* =========================
     MOBILE SUBMENUS
     ========================= */

  const submenuToggles =
    document.querySelectorAll(".submenu-toggle");

  submenuToggles.forEach(toggle => {

    toggle.addEventListener("click", () => {

      const parent = toggle.closest(".nav-item-with-toggle");

      if (!parent) {
        return;
      }

      const submenu = parent.parentElement.querySelector(
        ":scope > .submenu"
      );

      if (!submenu) {
        return;
      }

      const isOpen = submenu.classList.toggle("open");

      toggle.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen);

    });

  });

}


/* =========================
   START HEADER
   ========================= */

loadHeader();



/* ACTIVE PAGE */

const currentPage = window.location.pathname.replace(/\/$/, '');

document.querySelectorAll('nav a').forEach(link => {
  const linkPage = new URL(link.href).pathname.replace(/\/$/, '');

  if (linkPage === currentPage) {
    link.classList.add('active');
  }
});


/* =========================
   LIGHTBOX
   ========================= */

const lightboxLinks = document.querySelectorAll(".lightbox");
const lightbox = document.querySelector(".lightbox-view");

if (lightboxLinks.length && lightbox) {

  const lightboxImage = lightbox.querySelector("img");
  const closeButton = lightbox.querySelector(".lightbox-close");
  const previousButton = lightbox.querySelector(".lightbox-prev");
  const nextButton = lightbox.querySelector(".lightbox-next");

  let currentPhoto = 0;


  /* =========================
     SHOW PHOTO
     ========================= */

  function showPhoto(index) {

    if (index < 0) {
      index = lightboxLinks.length - 1;
    }

    if (index >= lightboxLinks.length) {
      index = 0;
    }

    currentPhoto = index;

    const link = lightboxLinks[currentPhoto];
    const image = link.querySelector("img");

    lightboxImage.src = link.href;
    lightboxImage.alt = image.alt;

    lightbox.style.display = "flex";

  }


  /* =========================
     CLOSE LIGHTBOX
     ========================= */

  function closeLightbox() {

    lightbox.style.display = "none";
    lightboxImage.src = "";

  }


  /* =========================
     PHOTO CLICK
     ========================= */

  lightboxLinks.forEach((link, index) => {

    link.addEventListener("click", function(e) {

      e.preventDefault();

      showPhoto(index);

    });

  });


  /* =========================
     PREVIOUS BUTTON
     ========================= */

  if (previousButton) {

    previousButton.addEventListener("click", function(e) {

      e.stopPropagation();

      showPhoto(currentPhoto - 1);

    });

  }


  /* =========================
     NEXT BUTTON
     ========================= */

  if (nextButton) {

    nextButton.addEventListener("click", function(e) {

      e.stopPropagation();

      showPhoto(currentPhoto + 1);

    });

  }


  /* =========================
     CLOSE BUTTON
     ========================= */

  if (closeButton) {

    closeButton.addEventListener("click", function(e) {

      e.stopPropagation();

      closeLightbox();

    });

  }


  /* =========================
     CLICK OUTSIDE IMAGE
     ========================= */

  lightbox.addEventListener("click", function(e) {

    if (e.target === lightbox) {

      closeLightbox();

    }

  });


  /* =========================
     KEYBOARD CONTROLS
     ========================= */

  document.addEventListener("keydown", function(e) {

    if (lightbox.style.display !== "flex") {
      return;
    }

    if (e.key === "ArrowLeft") {

      showPhoto(currentPhoto - 1);

    }

    if (e.key === "ArrowRight") {

      showPhoto(currentPhoto + 1);

    }

    if (e.key === "Escape") {

      closeLightbox();

    }

  });

}
