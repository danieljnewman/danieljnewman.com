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
   HOME PORTFOLIO GRID
   ========================= */

const homePortfolio = [

  {
    event: "st-patricks-festival-2026",
    page: "/portfolio/st-patricks-festival-2026/",
    images: [
      "/images/portfolio/st-patricks-festival-2026/SPF_001.webp",
      "/images/portfolio/st-patricks-festival-2026/SPF_002.webp",
      "/images/portfolio/st-patricks-festival-2026/SPF_003.webp",
      "/images/portfolio/st-patricks-festival-2026/SPF_004.webp"
    ]
  },

  {
    event: "as-one-in-the-park-2026",
    page: "/portfolio/as-one-in-the-park-2026/",
    images: [
      "/images/portfolio/as-one-in-the-park-2026/AOITP_2026_001.webp",
      "/images/portfolio/as-one-in-the-park-2026/AOITP_2026_002.webp",
      "/images/portfolio/as-one-in-the-park-2026/AOITP_2026_003.webp",
      "/images/portfolio/as-one-in-the-park-2026/AOITP_2026_004.webp"
    ]
  }

  // Add more events here

];


/* =========================
   SHUFFLE ARRAY
   ========================= */

function shuffle(array) {

  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] =
      [shuffled[j], shuffled[i]];

  }

  return shuffled;
}


/* =========================
   SELECT SIX IMAGES
   ========================= */

function getRandomHomeImages() {

  const selected = [];
  const eventCounts = {};

  const events = shuffle(homePortfolio);

  /*
   * First choose one image from each event.
   * This gives us variety where possible.
   */

  for (const event of events) {

    if (selected.length >= 6) {
      break;
    }

    if (!event.images.length) {
      continue;
    }

    const image =
      event.images[
        Math.floor(Math.random() * event.images.length)
      ];

    selected.push({
      image: image,
      page: event.page,
      event: event.event
    });

    eventCounts[event.event] = 1;

  }


  /*
   * If we have fewer than six images,
   * fill the remaining spaces.
   * Maximum two images per event.
   */

  const remaining = [];

  for (const event of events) {

    for (const image of event.images) {

      remaining.push({
        image: image,
        page: event.page,
        event: event.event
      });

    }

  }

  const shuffledRemaining = shuffle(remaining);


  for (const item of shuffledRemaining) {

    if (selected.length >= 6) {
      break;
    }

    const count = eventCounts[item.event] || 0;

    if (count >= 2) {
      continue;
    }

    if (
      selected.some(
        selectedItem => selectedItem.image === item.image
      )
    ) {
      continue;
    }

    selected.push(item);

    eventCounts[item.event] = count + 1;

  }


  return shuffle(selected);

}


/* =========================
   DISPLAY IMAGES
   ========================= */

function displayHomeImages() {

  const grid = document.querySelector("#home-grid");

  if (!grid) {
    return;
  }

  const images = getRandomHomeImages();

  /*
   * Fade out
   */

  grid.style.opacity = "0";


  setTimeout(() => {

    grid.innerHTML = "";


    images.forEach(item => {

      const link = document.createElement("a");

      link.href = item.page;


      const img = document.createElement("img");

      img.src = item.image;
      img.alt = "View portfolio";
      img.loading = "lazy";


      link.appendChild(img);
      grid.appendChild(link);

    });


    /*
     * Fade back in
     */

    grid.style.opacity = "1";

  }, 800);

}


/* =========================
   START HOMEPAGE GRID
   ========================= */

document.addEventListener("DOMContentLoaded", () => {

  displayHomeImages();

  /*
   * Change photos every 60 seconds
   */

  setInterval(displayHomeImages, 60000);

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
