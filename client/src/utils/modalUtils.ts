function openModal(modal: HTMLDivElement, overlay: HTMLDivElement) {
  if (!modal) return;
  modal.classList.add("active");
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal(modal: HTMLDivElement, overlay: HTMLDivElement) {
  if (!modal) return;

  const form = modal.querySelector<HTMLFormElement>(".modal-body");
  if (form) form.reset();

  const err = modal.querySelector<HTMLParagraphElement>(".error");
  if (err) err.classList.remove("active");

  modal.classList.remove("active");
  overlay.classList.remove("active");
  document.body.style.overflow = "";
}

function setupModalOpen(button: HTMLButtonElement, overlay: HTMLDivElement) {
  button.addEventListener("mouseup", () => {
    const modal = document.querySelector<HTMLDivElement>(button.dataset.modalTarget!);

    if (!modal) {
      throw new Error("Open modal button is missing a modal target");
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

function setupOverlayClose(overlay: HTMLDivElement) {
  overlay.addEventListener("mouseup", () => {
    const modal = document.querySelector<HTMLDivElement>(".modal.active");

    if (!modal) return;

    closeModal(modal, overlay)
  });
}

export function setupModals() {
  const openModalButtons = document.querySelectorAll<HTMLButtonElement>("[data-modal-target]");
  const closeModalButtons = document.querySelectorAll<HTMLButtonElement>("[data-close-button]");
  const overlay = document.querySelector<HTMLDivElement>("#overlay");

  if (!overlay) {
    throw new Error("Page has not loaded yet");
  }

  openModalButtons.forEach(button => setupModalOpen(button, overlay));
  closeModalButtons.forEach(button => setupModalClose(button, overlay));

  setupOverlayClose(overlay);
}

export function updateEditModal(title: string, description?: string) {
  const editTitle = document.querySelector<HTMLTextAreaElement>("#edit-modal .modal-title");
  const editDesciption = document.querySelector<HTMLTextAreaElement>("#edit-modal .modal-description");

  if (!editTitle || !editDesciption) {
    throw new Error("Edit modal has not loaded yet");
  }

  editTitle.textContent = title;

  if (description) editDesciption.textContent = description;
}

export function setupActionBtns() {
  const action = document.querySelector<HTMLDivElement>(".action");
  const overlay = document.querySelector<HTMLDivElement>("#overlay");

  if (!action || !overlay) {
    throw new Error("Board has not loaded yet");
  }

  action.addEventListener("mouseup", (event) => {
    if (event.button !== 0) return;

    try {
      const eventTarget = event.target as HTMLElement;
      const button = eventTarget.closest<HTMLButtonElement>("[data-modal-target]");

      if (!button) return;

      const modal = document.querySelector<HTMLDivElement>(button.dataset.modalTarget!);

      if (!modal) {
        throw new Error("No modal target found");
      }

      openModal(modal, overlay)
    }
    catch (e) {
      console.error(e);
    }
  });
}
