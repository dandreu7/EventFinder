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

  // Handle Cancel Reservation Button
  const cancelForms = document.querySelectorAll(".cancel-rsvp-form");

  cancelForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const eventId = form.getAttribute("data-event-id"); // Get event ID from data attribute

      fetch(form.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId: eventId }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.rsvpConfirmed === false) {
            // If RSVP was canceled, remove the event from the DOM
            const eventItem = document.getElementById("event-" + eventId);
            if (eventItem) {
              eventItem.remove();
            }
          } else {
            alert("Failed to cancel RSVP. Please try again.");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("An error occurred while canceling RSVP. Please try again.");
        });
    });
  });
});

async function deleteEvent(eventId) {
  if (confirm("Are you sure you want to delete this event?")) {
    try {
      const response = await fetch(`/events/${eventId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Event deleted successfully!");
        window.location.href = "/users/profile";
      } else {
        const errorText = await response.text();
        alert("Error: " + errorText);
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("An unexpected error occurred.");
    }
  }
}
