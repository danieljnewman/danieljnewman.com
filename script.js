const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");

    menuToggle.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", isOpen);
  });
}


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
