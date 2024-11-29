document.addEventListener("DOMContentLoaded", () => {
  // Profile Edit Functionality
  const editBtn = document.getElementById("edit-profile-btn");
  const cancelBtn = document.getElementById("cancel-edit-btn");
  const profileDisplay = document.getElementById("profile-display");
  const profileEditForm = document.getElementById("profile-edit-form");

  if (editBtn && cancelBtn) {
    editBtn.addEventListener("click", () => {
      profileDisplay.style.display = "none"; // Hide display mode
      profileEditForm.style.display = "block"; // Show edit mode
    });

    cancelBtn.addEventListener("click", () => {
      profileDisplay.style.display = "block"; // Show display mode
      profileEditForm.style.display = "none"; // Hide edit mode
    });
  }

  // Handle Edit Event Button
  const editButtons = document.querySelectorAll(".btn-edit");

  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const eventId = button.getAttribute("data-id");
      const eventTitle = button.getAttribute("data-title");
      const eventDate = button.getAttribute("data-date");
      const eventDescription = button.getAttribute("data-description");
      const eventLocation = button.getAttribute("data-location");

      // Populate modal fields
      document.getElementById("eventId").value = eventId;
      document.getElementById("eventTitle").value = eventTitle;
      document.getElementById("eventDate").value = eventDate;
      document.getElementById("eventDescription").value = eventDescription;
      document.getElementById("eventLocation").value = eventLocation;

      // Show the Edit Event Modal
      const editEventModal = new bootstrap.Modal(
        document.getElementById("editEventModal")
      );
      editEventModal.show();
    });
  });
});
