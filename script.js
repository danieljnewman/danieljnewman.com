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


      if (
        linkPage ===
        currentPage
      ) {

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

async function getPortfolioEvents() {

  const response =
    await fetch("/portfolio/");


  if (!response.ok) {

    throw new Error(
      "Failed to load portfolio page"
    );

  }


  const html =
    await response.text();


  const parser =
    new DOMParser();


  const portfolioDocument =
    parser.parseFromString(
      html,
      "text/html"
    );


  const links = [
    ...portfolioDocument.querySelectorAll(
      "a[href]"
    )
  ];


  const events = [];


  links.forEach(link => {

    const url =
      new URL(
        link.href,
        window.location.origin
      );


    const path =
      url.pathname.replace(
        /\/$/,
        ""
      );


    /*
     * Only include links inside
     * the portfolio section.
     */

    if (
      path.startsWith(
        "/portfolio/"
      ) &&
      path !== "/portfolio" &&
      !events.includes(path)
    ) {

      events.push(path);

    }

  });


  console.log(
    "Portfolio events found:",
    events
  );


  return events;

}


/* =========================
   GET IMAGES FROM EVENTS
   ========================= */

async function getEventImages(
  eventPage
) {

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


    const eventDocument =
      parser.parseFromString(
        html,
        "text/html"
      );


    const links =
      [
        ...eventDocument.querySelectorAll(
          ".lightbox"
        )
      ];


    const images =
      links
        .map(link => {

          const image =
            link.querySelector("img");


          if (!image) {
            return null;
          }


          return {

            image:
              new URL(
                link.href,
                window.location.origin
              ).href,

            thumbnail:
              new URL(
                image.src,
                window.location.origin
              ).href,

            event:
              eventPage

          };

        })
        .filter(Boolean);


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

function getImageOrientation(
  src
) {

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

        images.map(
          async item => {

            const orientation =
              await getImageOrientation(
                item.image
              );


            if (!orientation) {
              return null;
            }


            return {

              ...item,

              orientation:
                orientation

            };

          }
        )

      );


    allImages.push(
      ...checkedImages.filter(
        Boolean
      )
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
        item.orientation ===
        "portrait"
    ).length
  );


  console.log(
    "LANDSCAPES:",
    allImages.filter(
      item =>
        item.orientation ===
        "landscape"
    ).length
  );


  return allImages;

}


/* =========================
   SHUFFLE
   ========================= */

function shuffle(array) {

  const shuffled =
    [...array];


  for (
    let i =
      shuffled.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() *
        (i + 1)
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

/*
 * Homepage layout:
 *
 * 1 = portrait
 * 2 = landscape
 * 3 = landscape
 * 4 = landscape
 * 5 = landscape
 * 6 = landscape
 * 7 = portrait
 *
 * Total:
 * 2 portraits
 * 5 landscapes
 */

async function getHomeImages() {

  const allImages =
    await buildPortfolioImages();


  const portraits =
    shuffle(
      allImages.filter(
        item =>
          item.orientation ===
          "portrait"
      )
    );


  const landscapes =
    shuffle(
      allImages.filter(
        item =>
          item.orientation ===
          "landscape"
      )
    );


  const selected = [];

  const usedImages =
    new Set();

  const eventCounts = {};


  /* =========================
     SELECT TWO PORTRAITS
     ========================= */

  while (
    selected.filter(
      item =>
        item.orientation ===
        "portrait"
    ).length < 2 &&
    portraits.length
  ) {

    let bestIndex = 0;

    let bestCount =
      Infinity;


    portraits.forEach(
      (item, index) => {

        if (
          usedImages.has(
            item.image
          )
        ) {

          return;

        }


        const count =
          eventCounts[
            item.event
          ] || 0;


        if (
          count < bestCount
        ) {

          bestCount =
            count;

          bestIndex =
            index;

        }

      }
    );


    const item =
      portraits.splice(
        bestIndex,
        1
      )[0];


    if (!item) {
      return;
    }


    selected.push(item);

    usedImages.add(
      item.image
    );


    eventCounts[
      item.event
    ] =
      (
        eventCounts[
          item.event
        ] || 0
      ) + 1;

  }


  /* =========================
     SELECT FIVE LANDSCAPES
     ========================= */

  while (
    selected.filter(
      item =>
        item.orientation ===
        "landscape"
    ).length < 5 &&
    landscapes.length
  ) {

    let bestIndex = 0;

    let bestCount =
      Infinity;


    landscapes.forEach(
      (item, index) => {

        if (
          usedImages.has(
            item.image
          )
        ) {

          return;

        }


        const count =
          eventCounts[
            item.event
          ] || 0;


        if (
          count < bestCount
        ) {

          bestCount =
            count;

          bestIndex =
            index;

        }

      }
    );


    const item =
      landscapes.splice(
        bestIndex,
        1
      )[0];


    if (!item) {
      return;
    }


    selected.push(item);

    usedImages.add(
      item.image
    );


    eventCounts[
      item.event
    ] =
      (
        eventCounts[
          item.event
        ] || 0
      ) + 1;

  }


  /* =========================
     CHECK SELECTION
     ========================= */

  if (
    selected.length !== 7
  ) {

    console.warn(
      "Could not select 7 homepage images.",
      selected.length
    );


    return [];

  }


  /* =========================
     SEPARATE ORIENTATIONS
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


  /* =========================
     FINAL ORDER
     ========================= */

  const homeImages = [

    /* 1 — top left */
    portraitImages[0],

    /* 2 — bottom left */
    landscapeImages[0],

    /* 3 — top middle */
    landscapeImages[1],

    /* 4 — middle middle */
    landscapeImages[2],

    /* 5 — bottom middle */
    landscapeImages[3],

    /* 6 — top right */
    landscapeImages[4],

    /* 7 — bottom right */
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


  try {

    const images =
      await getHomeImages();


    if (
      !images ||
      images.length !== 7
    ) {

      console.warn(
        "Homepage images were not loaded."
      );

      return;

    }


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

            const link =
              document.createElement(
                "a"
              );


            link.href =
              item.event;


            const image =
              document.createElement(
                "img"
              );


            image.src =
              item.image;


            image.alt =
              "View portfolio";


            image.loading =
              "lazy";


            link.appendChild(
              image
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


  } catch (error) {

    console.error(
      "Error displaying homepage images:",
      error
    );

  }

}


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
   START
   ========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    /*
     * Build the homepage
     * immediately.
     */

    displayHomeImages();


    /*
     * Start portfolio lightbox.
     */

    initialiseLightbox();


    /*
     * Select a new set of
     * 7 photos every 60 seconds.
     */

    setInterval(
      displayHomeImages,
      60000
    );

  }
);
