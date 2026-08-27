/* =========================
   LOAD SHARED HEADER
   ========================= */

async function loadHeader() {

  const headerContainer =
    document.querySelector("#site-header");

  if (!headerContainer) {
    return;
  }

  try {

    const response =
      await fetch("/header.html");

    if (!response.ok) {
      throw new Error("Failed to load header");
    }

    const headerHTML =
      await response.text();

    headerContainer.innerHTML =
      headerHTML;

    initialiseNavigation();

  } catch (error) {

    console.error(
      "Error loading header:",
      error
    );

  }

}


/* =========================
   MOBILE NAVIGATION
   ========================= */

function initialiseNavigation() {

  const menuToggle =
    document.querySelector(".menu-toggle");

  const nav =
    document.querySelector("nav");


  if (menuToggle && nav) {

    menuToggle.addEventListener(
      "click",
      () => {

        const isOpen =
          nav.classList.toggle("open");

        menuToggle.classList.toggle(
          "open",
          isOpen
        );

        menuToggle.setAttribute(
          "aria-expanded",
          isOpen
        );

      }
    );

  }


  /* =========================
     MOBILE SUBMENUS
     ========================= */

  const submenuToggles =
    document.querySelectorAll(
      ".submenu-toggle"
    );


  submenuToggles.forEach(
    toggle => {

      toggle.addEventListener(
        "click",
        () => {

          const parent =
            toggle.closest(
              ".nav-item-with-toggle"
            );

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
            submenu.classList.toggle(
              "open"
            );


          toggle.classList.toggle(
            "open",
            isOpen
          );


          toggle.setAttribute(
            "aria-expanded",
            isOpen
          );

        }
      );

    }
  );


  /* =========================
     ACTIVE PAGE
     ========================= */

  const currentPage =
    window.location.pathname
      .replace(/\/$/, "");


  document
    .querySelectorAll("nav a")
    .forEach(link => {

      const linkPage =
        new URL(
          link.href,
          window.location.origin
        )
        .pathname
        .replace(/\/$/, "");


      if (linkPage === currentPage) {

        link.classList.add(
          "active"
        );

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

const homePortfolio = [

  {
    event: "big-day-out-2026",
    page: "/portfolio/big-day-out-2026/",
    prefix: "BDO_2026_",
    count: 208
  },

  {
    event: "as-one-in-the-park-2026",
    page: "/portfolio/as-one-in-the-park-2026/",
    prefix: "AOITP_2026_",
    count: 346
  },

  {
    event: "st-patricks-festival-2026",
    page: "/portfolio/st-patricks-festival-2026/",
    prefix: "SPF_2026_",
    count: 204
  }

  // Add more portfolio events here

];


/* =========================
   SHUFFLE
   ========================= */

function shuffle(array) {

  const shuffled =
    [...array];


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
    ] =
    [
      shuffled[j],
      shuffled[i]
    ];

  }


  return shuffled;

}


/* =========================
   GET IMAGE ORIENTATION
   ========================= */

function getImageOrientation(src) {

  return new Promise(
    resolve => {

      const img =
        new Image();


      img.onload =
        () => {

          if (
            img.naturalHeight >
            img.naturalWidth
          ) {

            resolve(
              "portrait"
            );

          } else {

            resolve(
              "landscape"
            );

          }

        };


      img.onerror =
        () => {

          resolve(null);

        };


      img.src =
        src;

    }
  );

}


/* =========================
   BUILD IMAGE LIST
   ========================= */

async function buildImageList() {

  const images = [];


  for (
    const event
    of homePortfolio
  ) {

    for (
      let i = 1;
      i <= event.count;
      i++
    ) {

      const number =
        String(i)
          .padStart(3, "0");


      const image =
        `/images/portfolio/${event.event}/${event.prefix}${number}.webp`;


      const orientation =
        await getImageOrientation(
          image
        );


      /*
       * Missing image numbers are
       * simply skipped.
       */

      if (!orientation) {
        continue;
      }


      images.push({

        image: image,

        page: event.page,

        event: event.event,

        orientation: orientation

      });

    }

  }


  return images;

}


/* =========================
   SELECT HOME IMAGES
   ========================= */

async function getHomeImages() {

  const allImages =
    await buildImageList();


  /*
   * Shuffle all available photos.
   */

  const shuffled =
    shuffle(allImages);


  const portraits =
    shuffled.filter(
      item =>
        item.orientation ===
        "portrait"
    );


  const landscapes =
    shuffled.filter(
      item =>
        item.orientation ===
        "landscape"
    );


  const selected = [];

  const eventCounts = {};


  /* =========================
     SELECT PORTRAITS
     ========================= */

  for (
    const item
    of portraits
  ) {

    if (
      selected.filter(
        photo =>
          photo.orientation ===
          "portrait"
      ).length >= 2
    ) {

      break;

    }


    const count =
      eventCounts[item.event] || 0;


    if (count >= 2) {
      continue;
    }


    selected.push(item);


    eventCounts[item.event] =
      count + 1;

  }


  /* =========================
     SELECT LANDSCAPES
     ========================= */

  for (
    const item
    of landscapes
  ) {

    if (
      selected.filter(
        photo =>
          photo.orientation ===
          "landscape"
      ).length >= 6
    ) {

      break;

    }


    if (
      selected.some(
        photo =>
          photo.image ===
          item.image
      )
    ) {

      continue;

    }


    const count =
      eventCounts[item.event] || 0;


    if (count >= 2) {
      continue;
    }


    selected.push(item);


    eventCounts[item.event] =
      count + 1;

  }


  /* =========================
     SEPARATE PHOTOS
     ========================= */

  const portraitImages =
    selected.filter(
      item =>
        item.orientation ===
        "portrait"
    );


  const landscapeImages =
    selected.filter(
      item =>
        item.orientation ===
        "landscape"
    );


  /*
   * Eight grid positions:
   *
   * 1 = portrait
   * 2 = landscape
   * 3 = landscape
   * 4 = landscape
   * 5 = landscape
   * 6 = landscape
   * 7 = landscape
   * 8 = portrait
   */

  return [

    portraitImages[0],

    landscapeImages[0],

    landscapeImages[1],

    landscapeImages[2],

    landscapeImages[3],

    landscapeImages[4],

    landscapeImages[5],

    portraitImages[1]

  ];

}


/* =========================
   DISPLAY HOME IMAGES
   ========================= */

async function displayHomeImages() {

  const grid =
    document.querySelector(
      "#home-grid"
    );


  if (!grid) {
    return;
  }


  const images =
    await getHomeImages();


  /*
   * Fade out.
   */

  grid.style.opacity =
    "0";


  setTimeout(
    () => {

      grid.innerHTML =
        "";


      images.forEach(
        item => {

          if (!item) {
            return;
          }


          const link =
            document.createElement(
              "a"
            );


          link.href =
            item.page;


          const img =
            document.createElement(
              "img"
            );


          img.src =
            item.image;


          img.alt =
            "View portfolio";


          img.loading =
            "lazy";


          link.appendChild(
            img
          );


          grid.appendChild(
            link
          );

        }
      );


      /*
       * Fade in.
       */

      grid.style.opacity =
        "1";

    },
    800
  );

}


/* =========================
   START HOME GRID
   ========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    displayHomeImages();


    /*
     * Change photos every
     * 60 seconds.
     */

    setInterval(
      displayHomeImages,
      60000
    );

  }
);


/* =========================
   LIGHTBOX
   ========================= */

function initialiseLightbox() {

  const lightboxLinks =
    document.querySelectorAll(
      ".lightbox"
    );


  const lightbox =
    document.querySelector(
      ".lightbox-view"
    );


  if (
    !lightboxLinks.length ||
    !lightbox
  ) {

    return;

  }


  const lightboxImage =
    lightbox.querySelector(
      "img"
    );


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


    currentPhoto =
      index;


    const link =
      lightboxLinks[
        currentPhoto
      ];


    const image =
      link.querySelector(
        "img"
      );


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


    lightboxImage.src =
      "";

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
     PREVIOUS
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
     NEXT
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

      if (
        e.target ===
        lightbox
      ) {

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


      if (
        e.key ===
        "ArrowLeft"
      ) {

        showPhoto(
          currentPhoto - 1
        );

      }


      if (
        e.key ===
        "ArrowRight"
      ) {

        showPhoto(
          currentPhoto + 1
        );

      }


      if (
        e.key ===
        "Escape"
      ) {

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
```
