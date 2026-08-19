function openModal(modal: HTMLDivElement, overlay: HTMLDivElement) {
  if (!modal) return;
  modal.classList.add("active");
  overlay.classList.add("active");
}

function closeModal(modal: HTMLDivElement, overlay: HTMLDivElement) {
  if (!modal) return;
  modal.classList.remove("active");
  overlay.classList.remove("active");
}

function setupModalOpen(button: HTMLButtonElement, overlay: HTMLDivElement) {
  button.addEventListener("mouseup", () => {
    const modal = document.querySelector<HTMLDivElement>(button.dataset.modalTarget!);

    if (!modal) {
      throw new Error("Open modal button is missing a target");
    }

    openModal(modal, overlay);
  });
}

function setupModalClose(button: HTMLButtonElement, overlay: HTMLDivElement) {
  button.addEventListener("mouseup", () => {
    const modal = button.closest<HTMLDivElement>(".modal");

    if (!modal) {
      throw new Error("Close modal button is not the child of a modal class");
    }

    closeModal(modal, overlay);
  });
}

export function setupModals() {
  const openModalButtons = document.querySelectorAll<HTMLButtonElement>("[data-modal-target]");
  const closeModalButtons = document.querySelectorAll<HTMLButtonElement>("[data-close-button]");
  const overlay = document.querySelector<HTMLDivElement>("#overlay");

  openModalButtons.forEach(button => setupModalOpen(button, overlay!));
  closeModalButtons.forEach(button => setupModalClose(button, overlay!));
}
