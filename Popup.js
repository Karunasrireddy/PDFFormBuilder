document.getElementById('openPopup').addEventListener('click', function() {
    document.getElementById('popupContainer').style.display = 'block';
  });
  
  document.getElementById('closePopup').addEventListener('click', function() {
    document.getElementById('popupContainer').style.display = 'none';
  });
  
  document.addEventListener('click', function(event) {
    var popupContainer = document.getElementById('popupContainer');
    var popup = document.querySelector('.popup');
  
    if (event.target === popupContainer) {
      popupContainer.style.display = 'none';
    }
  });

  document.getElementById('createButton').addEventListener('click', function() {
    var documentName = document.getElementById('documentName');
    // var errorMessage = document.getElementById('errorMessage');
    if (documentName !== '') {
        // If the document name is not empty, navigate to the other page
        window.location.href = 'Upload.html';
    }
    // else{
    //   // errorMessage.textContent="Please Enter The Document Name"
    // alert("Please Enter The Document Name");
    // }
    // No alert or action needed if the document name is not entered
});
