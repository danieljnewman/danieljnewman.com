/*MOBILE NAVIGATION*/

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");

    menuToggle.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", isOpen);
  });
}


/*MOBILE SUBMENUS*/

const submenuToggles = document.querySelectorAll(".submenu-toggle");

submenuToggles.forEach(toggle => {

  toggle.addEventListener("click", () => {

    const submenu = toggle
      .closest(".nav-item-with-toggle")
      .parentElement
      .querySelector(":scope > .submenu");

    if (!submenu) return;

    const isOpen = submenu.classList.toggle("open");

    toggle.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen);

  });

});


/*LIGHTBOX*/

const lightboxLinks = document.querySelectorAll(".lightbox");
const lightbox = document.querySelector(".lightbox-view");

if (lightboxLinks.length && lightbox) {

  const lightboxImage = lightbox.querySelector("img");
  const closeButton = lightbox.querySelector(".lightbox-close");
  const previousButton = lightbox.querySelector(".lightbox-prev");
  const nextButton = lightbox.querySelector(".lightbox-next");

  let currentPhoto = 0;

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


  function closeLightbox() {
    lightbox.style.display = "none";
    lightboxImage.src = "";
  }


  lightboxLinks.forEach((link, index) => {

    link.addEventListener("click", function(e) {
      e.preventDefault();
      showPhoto(index);
    });

  });


  if (previousButton) {
    previousButton.addEventListener("click", function(e) {
      e.stopPropagation();
      showPhoto(currentPhoto - 1);
    });
  }


  if (nextButton) {
    nextButton.addEventListener("click", function(e) {
      e.stopPropagation();
      showPhoto(currentPhoto + 1);
    });
  }


  if (closeButton) {
    closeButton.addEventListener("click", function(e) {
      e.stopPropagation();
      closeLightbox();
    });
  }


  lightbox.addEventListener("click", function(e) {

    if (e.target === lightbox) {
      closeLightbox();
    }

  });


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
