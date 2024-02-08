document.getElementById('nav-profile').addEventListener('click', function(event) {
  event.preventDefault(); // Prevent the default action
  $('#profileModal').modal('show'); // Show the modal window
});