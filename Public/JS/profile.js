const editBtn = document.getElementById('edit-profile-btn');
const cancelBtn = document.getElementById('cancel-edit-btn');
const profileDisplay = document.getElementById('profile-display');
const profileEditForm = document.getElementById('profile-edit-form');

editBtn.addEventListener('click', () => {
  profileDisplay.style.display = 'none'; // Hide display mode
  profileEditForm.style.display = 'block'; // Show edit mode
});

cancelBtn.addEventListener('click', () => {
  profileDisplay.style.display = 'block'; // Show display mode
  profileEditForm.style.display = 'none'; // Hide edit mode
});
