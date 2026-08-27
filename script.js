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


  document.querySelectorAll(
    "nav a"
  ).forEach(
    link => {

      const linkPage =
        new URL(
          link.href,
          window.location.origin
        ).pathname
          .replace(/\/$/, "");


      if (linkPage === currentPage) {

        link.classList.add(
          "active"
        );

      }

    }
  );

}


/* =========================
   START HEADER
   ========================= */

loadHeader();



/* =========================
   HOME PORTFOLIO
   ========================= */


/*
 * Find all portfolio event pages
 * from the main portfolio page.
 */

async function getPortfolioEvents() {

  try {

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


    const page =
      parser.parseFromString(
        html,
        "text/html"
      );


    const links =
      [...page.querySelectorAll(
        "a[href]"
      )];


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
       * Only include individual
       * portfolio event pages.
       */

      if (
        path.startsWith(
          "/portfolio/"
        ) &&
        path !== "/portfolio" &&
        !events.some(
          event =>
            event.page === path + "/"
        )
      ) {

        events.push({

          page:
            path + "/"

        });

      }

    });


    return events;


  } catch (error) {

    console.error(
      "Error loading portfolio events:",
      error
    );

    return [];

  }

}


/* =========================
   GET IMAGES FROM EVENT PAGE
   ========================= */

async function getEventImages(event) {

  try {

    const response =
      await fetch(event.page);

    if (!response.ok) {
      return [];
    }


    const html =
      await response.text();


    const parser =
      new DOMParser();


    const page =
      parser.parseFromString(
        html,
        "text/html"
      );


    /*
     * Portfolio gallery images
     * use .lightbox links.
     */

    const links =
      [
        ...page.querySelectorAll(
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

          image:
            link.href,

          page:
            event.page,

          event:
            event.page

        };

      })
      .filter(Boolean);


  } catch (error) {

    console.error(
      "Error loading event:",
      event.page,
      error
    );

    return [];

  }

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
   GET IMAGE ORIENTATION
   ========================= */

function getImageOrientation(src) {

  return new Promise(
    resolve => {

      const img =
        new Image();


      img.onload = () => {

        if (
          img.naturalHeight >
          img.naturalWidth
        ) {

          resolve("portrait");

        } else {

          resolve("landscape");

        }

      };


      img.onerror = () => {

        resolve(null);

      };


      img.src = src;

    }
  );

}


/* =========================
   BUILD ALL PORTFOLIO IMAGES
   ========================= */

async function buildPortfolioImages() {

  const events =
    await getPortfolioEvents();


  const allImages = [];


  for (const event of events) {

    const eventImages =
      await getEventImages(event);


    for (
      const item of eventImages
    ) {

      const orientation =
        await getImageOrientation(
          item.image
        );


      if (!orientation) {
        continue;
      }


      allImages.push({

        image:
          item.image,

        page:
          item.page,

        event:
          item.event,

        orientation:
          orientation

      });

    }

  }


  return allImages;

}


/* =========================
   SELECT HOME IMAGES
   ========================= */

async function getHomeImages() {

  const allImages =
    await buildPortfolioImages();


  if (!allImages.length) {

    console.warn(
      "No portfolio images found."
    );

    return [];

  }


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


  /*
   * Keep track of how many
   * images come from each event.
   */

  const eventCounts = {};


  /*
   * Add a portrait.
   */

  for (
    const item of portraits
  ) {

    if (
      !usedImages.has(
        item.image
      )
    ) {

      selected.push(item);

      usedImages.add(
        item.image
      );

      eventCounts[item.event] =
        1;

      break;

    }

  }


  /*
   * Add a second portrait.
   */

  for (
    const item of portraits
  ) {

    if (
      usedImages.has(
        item.image
      )
    ) {
      continue;
    }


    if (
      (eventCounts[item.event] || 0)
      >= 2
    ) {
      continue;
    }


    selected.push(item);

    usedImages.add(
      item.image
    );


    eventCounts[item.event] =
      (eventCounts[item.event] || 0)
      + 1;


    break;

  }


  /*
   * Add six landscapes.
   */

  for (
    const item of landscapes
  ) {

    if (
      selected.length >= 8
    ) {
      break;
    }


    if (
      usedImages.has(
        item.image
      )
    ) {
      continue;
    }


    if (
      (eventCounts[item.event] || 0)
      >= 2
    ) {
      continue;
    }


    selected.push(item);

    usedImages.add(
      item.image
    );


    eventCounts[item.event] =
      (eventCounts[item.event] || 0)
      + 1;

  }


  /*
   * Separate orientations.
   */

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
   * Homepage order:
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


  try {

    const images =
      await getHomeImages();


    if (!images.length) {

      console.warn(
        "No homepage images available."
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


  } catch (error) {

    console.error(
      "Error loading homepage portfolio:",
      error
    );


    grid.style.opacity =
      "1";

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
     * Change images every
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


    if (!image) {
      return;
    }


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
        e.target === lightbox
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
        e.key === "ArrowLeft"
      ) {

        showPhoto(
          currentPhoto - 1
        );

      }


      if (
        e.key === "ArrowRight"
      ) {

        showPhoto(
          currentPhoto + 1
        );

      }


      if (
        e.key === "Escape"
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
