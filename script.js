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
   LOAD SHARED FOOTER
   ========================= */

async function loadFooter() {

  const footerContainer = document.querySelector("#site-footer");

  if (!footerContainer) {
    return;
  }

  try {

    const response = await fetch("/footer.html");

    if (!response.ok) {
      throw new Error("Failed to load footer");
    }

    const footerHTML = await response.text();

    footerContainer.innerHTML = footerHTML;

    const year = document.querySelector("#year");

    if (year) {
      year.textContent = new Date().getFullYear();
    }

  } catch (error) {

    console.error("Error loading footer:", error);

  }

}

/* START FOOTER */

loadFooter();


/* =========================
   HOME PORTFOLIO
   ========================= */

async function getPortfolioEvents() {

  const response =
    await fetch("/portfolio/");

  if (!response.ok) {
    throw new Error("Failed to load portfolio page");
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
    [...document.querySelectorAll("a[href]")];

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

    if (
      path.startsWith("/portfolio/") &&
      path !== "/portfolio" &&
      !path.endsWith(".html") &&
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
   GET IMAGES FROM EVENT
   ========================= */

async function getEventImages(eventPage) {

  try {

    const response =
      await fetch(eventPage);

    if (!response.ok) {
      return [];
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
      [
        ...document.querySelectorAll(
          ".lightbox"
        )
      ];

    return links
      .map(link => {

        const image =
          link.querySelector("img");

        if (!image) {
          return null;
        }

        return {

          image: new URL(
            link.href,
            window.location.origin
          ).href,

          thumbnail: new URL(
            image.src,
            window.location.origin
          ).href,

          event: eventPage

        };

      })
      .filter(Boolean);

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
   GET THUMBNAIL ORIENTATION
   ========================= */

function getThumbnailOrientation(src) {

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
   BUILD IMAGE LIST
   ========================= */

async function buildHomeImagePool() {

  const events =
    await getPortfolioEvents();


  /*
   * Load all portfolio pages
   * at the same time.
   */

  const eventResults =
    await Promise.all(
      events.map(
        event =>
          getEventImages(event)
      )
    );


  const allImages =
    eventResults.flat();


  /*
   * Work out orientation from
   * the existing thumbnails.
   */

  const checkedImages =
    await Promise.all(

      allImages.map(
        async item => {

          const orientation =
            await getThumbnailOrientation(
              item.thumbnail
            );

          if (!orientation) {
            return null;
          }

          return {
            ...item,
            orientation
          };

        }
      )

    );


  const validImages =
    checkedImages.filter(Boolean);


  console.log(
    "HOME IMAGE POOL:",
    validImages.length
  );


  return validImages;

}


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

function selectHomeImages(allImages) {

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


  /*
   * Select two portraits.
   */

  while (
    selected.filter(
      item =>
        item.orientation ===
        "portrait"
    ).length < 2 &&
    portraits.length
  ) {

    let bestIndex = 0;
    let bestCount = Infinity;


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


  /*
   * Select eight landscapes.
   */

  while (
    selected.filter(
      item =>
        item.orientation ===
        "landscape"
    ).length < 8 &&
    landscapes.length
  ) {

    let bestIndex = 0;
    let bestCount = Infinity;


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


  if (
    selected.length !== 10
  ) {

    console.warn(
      "Could not select 10 homepage images.",
      selected.length
    );

    return [];

  }


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
   * Final grid order:
   *
   * 1  = portrait
   * 2  = landscape
   * 3  = landscape
   * 4  = landscape
   * 5  = landscape
   * 6  = landscape
   * 7  = landscape
   * 8  = landscape
   * 9  = landscape
   * 10 = portrait
   */

  return [

    portraitImages[0],

    landscapeImages[0],
    landscapeImages[1],
    landscapeImages[2],
    landscapeImages[3],
    landscapeImages[4],
    landscapeImages[5],
    landscapeImages[6],
    landscapeImages[7],

    portraitImages[1]

  ];

}


/* =========================
   DISPLAY HOME IMAGES
   ========================= */

let homeImagePool = null;

async function displayHomeImages() {

  const grid =
    document.querySelector(
      "#home-grid"
    );

  if (!grid) {
    return;
  }


  try {

    /*
     * Build the image pool only once.
     */

    if (!homeImagePool) {

      grid.style.opacity =
        "0";

      homeImagePool =
        await buildHomeImagePool();

    }


    const images =
      selectHomeImages(
        homeImagePool
      );


    if (
      !images ||
      images.length !== 10
    ) {

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


            /*
             * Use the thumbnail first.
             * This means the grid appears
             * much faster.
             */

            image.src =
              item.thumbnail;

            image.alt =
              "View portfolio";

            image.loading =
              "eager";


            /*
             * Once loaded, replace the
             * thumbnail with the full image.
             */

            const fullImage =
              new Image();

            fullImage.onload =
              () => {

                image.src =
                  item.image;

              };

            fullImage.src =
              item.image;


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
      300
    );


  } catch (error) {

    console.error(
      "Error displaying homepage images:",
      error
    );

  }

}


/* =========================
   START HOME PORTFOLIO
   ========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    displayHomeImages();


    /*
     * Change the 10 photos
     * every 60 seconds.
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
     * Build homepage immediately.
     */

    displayHomeImages();


    /*
     * Start portfolio lightbox.
     */

    initialiseLightbox();


    /*
     * Select a new set of
     * 10 photos every 60 seconds.
     */

    setInterval(
      displayHomeImages,
      60000
    );

  }
);
