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

      const parent =
        toggle.closest(".nav-item-with-toggle");

      if (!parent) {
        return;
      }

      const submenu =
        parent.parentElement.querySelector(
          ":scope > .submenu"
        );

      if (!submenu) {
        return;
      }

      const isOpen =
        submenu.classList.toggle("open");

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
   HOME PORTFOLIO
   ========================= */

async function getPortfolioEvents() {

  const response = await fetch("/portfolio/");

  if (!response.ok) {
    throw new Error("Failed to load portfolio page");
  }

  const html = await response.text();

  const parser = new DOMParser();

  const document = parser.parseFromString(
    html,
    "text/html"
  );

  const links = [
    ...document.querySelectorAll("a[href]")
  ];

  const events = [];

  links.forEach(link => {

    const url = new URL(
      link.href,
      window.location.origin
    );

    const path = url.pathname.replace(/\/$/, "");

    if (
      path.startsWith("/portfolio/") &&
      path !== "/portfolio" &&
      !events.includes(path)
    ) {

      events.push(path);

    }

  });

  console.log("Portfolio events found:", events);

  return events;

}


/* =========================
   GET IMAGES FROM EVENTS
   ========================= */

async function getEventImages(eventPage) {

  try {

    const response =
      await fetch(eventPage);

    if (!response.ok) {
      throw new Error(
        `Failed to load ${eventPage}`
      );
    }

    const html =
      await response.text();

    const parser =
      new DOMParser();

    const document =
      parser.parseFromString(
        html,
        "text/html"
      );

    const links =
      [...document.querySelectorAll(".lightbox")];

    const images =
      links.map(link => {

        const image =
          link.querySelector("img");

        if (!image) {
          return null;
        }

        return {
          image: link.href,
          thumbnail: image.src,
          event: eventPage
        };

      }).filter(Boolean);

    console.log(
      eventPage,
      "images found:",
      images.length
    );

    return images;

  } catch (error) {

    console.error(
      "Error loading event:",
      eventPage,
      error
    );

    return [];

  }

}


/* =========================
   GET IMAGE ORIENTATION
   ========================= */

function getImageOrientation(src) {

  return new Promise(resolve => {

    const image =
      new Image();

    image.onload = () => {

      if (
        image.naturalHeight >
        image.naturalWidth
      ) {

        resolve("portrait");

      } else {

        resolve("landscape");

      }

    };

    image.onerror = () => {

      resolve(null);

    };

    image.src = src;

  });

}


/* =========================
   BUILD ALL PORTFOLIO IMAGES
   ========================= */

async function buildPortfolioImages() {

  const events =
    await getPortfolioEvents();

  const allImages = [];

  for (const event of events) {

    const images =
      await getEventImages(event);

    const checkedImages =
      await Promise.all(

        images.map(async item => {

          const orientation =
            await getImageOrientation(
              item.image
            );

          if (!orientation) {
            return null;
          }

          return {
            ...item,
            orientation: orientation
          };

        })

      );

    allImages.push(
      ...checkedImages.filter(Boolean)
    );

  }

  console.log(
    "TOTAL VALID IMAGES:",
    allImages.length
  );

  console.log(
    "PORTRAITS:",
    allImages.filter(
      item =>
        item.orientation === "portrait"
    ).length
  );

  console.log(
    "LANDSCAPES:",
    allImages.filter(
      item =>
        item.orientation === "landscape"
    ).length
  );

  return allImages;

}

/* =========================
   SHUFFLE
   ========================= */

function shuffle(array) {

  const shuffled = [...array];

  for (
    let i = shuffled.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [
      shuffled[i],
      shuffled[j]
    ] = [
      shuffled[j],
      shuffled[i]
    ];

  }

  return shuffled;

}


/* =========================
   SELECT HOME IMAGES
   ========================= */

async function getHomeImages() {

  const allImages =
    await buildPortfolioImages();

  const portraits =
    shuffle(
      allImages.filter(
        item =>
          item.orientation === "portrait"
      )
    );

  const landscapes =
    shuffle(
      allImages.filter(
        item =>
          item.orientation === "landscape"
      )
    );

  const selected = [];

  const usedImages =
    new Set();

  const eventCounts = {};


  /* =========================
     SELECT TWO PORTRAITS
     ========================= */

  for (const item of portraits) {

    if (selected.length >= 2) {
      break;
    }

    if (usedImages.has(item.image)) {
      continue;
    }

    const count =
      eventCounts[item.event] || 0;

    const lowestPortraitCount =
      Math.min(
        ...Object.values(eventCounts),
        0
      );

    if (
      count > lowestPortraitCount &&
      Object.keys(eventCounts).length > 1
    ) {
      continue;
    }

    selected.push(item);

    usedImages.add(item.image);

    eventCounts[item.event] =
      count + 1;

  }


  /* =========================
     SELECT SIX LANDSCAPES
     ========================= */

  for (const item of landscapes) {

    if (selected.length >= 8) {
      break;
    }

    if (usedImages.has(item.image)) {
      continue;
    }

    const count =
      eventCounts[item.event] || 0;

    const lowestEventCount =
      Math.min(
        ...Object.values(eventCounts),
        0
      );

    if (
      count > lowestEventCount &&
      Object.keys(eventCounts).length > 1
    ) {
      continue;
    }

    selected.push(item);

    usedImages.add(item.image);

    eventCounts[item.event] =
      count + 1;

  }


  /* =========================
     CHECK SELECTION
     ========================= */

  if (selected.length < 8) {

    console.warn(
      "Not enough suitable images for homepage."
    );

    return [];

  }


  /* =========================
     SEPARATE ORIENTATIONS
     ========================= */

  const portraitImages =
    selected.filter(
      item =>
        item.orientation === "portrait"
    );

  const landscapeImages =
    selected.filter(
      item =>
        item.orientation === "landscape"
    );


  /* =========================
     FINAL ORDER
     ========================= */

  const homeImages = [

    portraitImages[0],

    landscapeImages[0],
    landscapeImages[1],
    landscapeImages[2],
    landscapeImages[3],
    landscapeImages[4],
    landscapeImages[5],

    portraitImages[1]

  ];


  console.log(
    "HOME IMAGES SELECTED:",
    homeImages
  );

  console.log(
    "EVENT COUNTS:",
    eventCounts
  );

  return homeImages;

}

/* =========================
   LIGHTBOX
   ========================= */

function initialiseLightbox() {

  const lightboxLinks =
    document.querySelectorAll(".lightbox");

  const lightbox =
    document.querySelector(".lightbox-view");

  if (
    !lightboxLinks.length ||
    !lightbox
  ) {
    return;
  }

  const lightboxImage =
    lightbox.querySelector("img");

  const closeButton =
    lightbox.querySelector(
      ".lightbox-close"
    );

  const previousButton =
    lightbox.querySelector(
      ".lightbox-prev"
    );

  const nextButton =
    lightbox.querySelector(
      ".lightbox-next"
    );

  let currentPhoto = 0;


  /* =========================
     SHOW PHOTO
     ========================= */

  function showPhoto(index) {

    if (index < 0) {
      index =
        lightboxLinks.length - 1;
    }

    if (
      index >=
      lightboxLinks.length
    ) {
      index = 0;
    }

    currentPhoto = index;

    const link =
      lightboxLinks[currentPhoto];

    const image =
      link.querySelector("img");

    lightboxImage.src =
      link.href;

    lightboxImage.alt =
      image.alt;

    lightbox.style.display =
      "flex";

  }


  /* =========================
     CLOSE LIGHTBOX
     ========================= */

  function closeLightbox() {

    lightbox.style.display =
      "none";

    lightboxImage.src = "";

  }


  /* =========================
     PHOTO CLICK
     ========================= */

  lightboxLinks.forEach(
    (link, index) => {

      link.addEventListener(
        "click",
        function(e) {

          e.preventDefault();

          showPhoto(index);

        }
      );

    }
  );


  /* =========================
     PREVIOUS BUTTON
     ========================= */

  if (previousButton) {

    previousButton.addEventListener(
      "click",
      function(e) {

        e.stopPropagation();

        showPhoto(
          currentPhoto - 1
        );

      }
    );

  }


  /* =========================
     NEXT BUTTON
     ========================= */

  if (nextButton) {

    nextButton.addEventListener(
      "click",
      function(e) {

        e.stopPropagation();

        showPhoto(
          currentPhoto + 1
        );

      }
    );

  }


  /* =========================
     CLOSE BUTTON
     ========================= */

  if (closeButton) {

    closeButton.addEventListener(
      "click",
      function(e) {

        e.stopPropagation();

        closeLightbox();

      }
    );

  }


  /* =========================
     CLICK OUTSIDE IMAGE
     ========================= */

  lightbox.addEventListener(
    "click",
    function(e) {

      if (e.target === lightbox) {

        closeLightbox();

      }

    }
  );


  /* =========================
     KEYBOARD CONTROLS
     ========================= */

  document.addEventListener(
    "keydown",
    function(e) {

      if (
        lightbox.style.display !==
        "flex"
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {

        showPhoto(
          currentPhoto - 1
        );

      }

      if (e.key === "ArrowRight") {

        showPhoto(
          currentPhoto + 1
        );

      }

      if (e.key === "Escape") {

        closeLightbox();

      }

    }
  );

}


/* =========================
   START LIGHTBOX
   ========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initialiseLightbox();

  }
);

console.log("STARTING HOME IMAGE TEST");

document.addEventListener("DOMContentLoaded", async () => {

  console.log("HOME DOM READY");

  try {

    const images = await getHomeImages();

    console.log(
      "HOME IMAGES:",
      images
    );

  } catch (error) {

    console.error(
      "HOME IMAGE ERROR:",
      error
    );

  }

});

console.log("NEW SCRIPT.JS LOADED");
