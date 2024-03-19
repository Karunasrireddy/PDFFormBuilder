document.addEventListener("DOMContentLoaded", function () {
  let pdfUrl = "";
  let inputFields = {};
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let activeInputField = null;
  let pdfLoaded = false; // Track if PDF is loaded
  let currentPage = 1;
  let noOfpages = 0;
  let pdfCanvasDimensions;
  const pdfCanvas = document.createElement("canvas");
  pdfCanvas.id = "pdfCanvas";
  pdfCanvas.style.position = "relative";
  let gridItemThree = document.getElementsByClassName("grid-item-3")[0];
  gridItemThree.appendChild(pdfCanvas);
  const context = pdfCanvas.getContext("2d");

  function renderPDF(currentPage) {
    pdfjsLib
      .getDocument(pdfUrl)
      .promise.then(function (pdf) {
        console.log("****************" + pdf.numPages);
        noOfpages = pdf.numPages;
        return pdf.getPage(currentPage);
      })
      .then(function (page) {
        const viewport = page.getViewport({ scale: 1 });
        pdfCanvas.width = viewport.width;
        pdfCanvas.height = viewport.height;
        console.log("viewport.width " + typeof viewport.width);

        page
          .render({
            canvasContext: context,
            viewport: viewport,
          })
          .promise.then(function () {
            let uploadButtonDisplay = document.getElementById("uploadButton");
            uploadButtonDisplay.style.display = "none";
          })
          .then(function () {
            pdfLoaded = true;
            pdfCanvasDimensions = pdfCanvas.getBoundingClientRect();
            console.log(
              "pdfCanvasLeft " +
                pdfCanvasDimensions.left +
                " pdfCanvastop " +
                pdfCanvasDimensions.top
            );
          })
          .catch(function (error) {
            console.error("Error rendering PDF:", error);
          });
        displayPageNumber();
      });
  }

  function loadPDF(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (event) {
      pdfUrl = event.target.result;
      renderPDF(currentPage);
    };
  }

  document
    .getElementById("uploadButton")
    .addEventListener("click", function () {
      document.getElementById("fileInput").click();
    });

  document
    .getElementById("fileInput")
    .addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) {
        loadPDF(file);
      }
    });

  let selectedPartyColor = "red";
  document
    .getElementById("addFirstParty")
    .addEventListener("click", function () {
      var partyButton = document.getElementById("partyButton");
      partyButton.innerHTML =
        '<i class="bi bi-circle-fill circle party" id="partyCircle"></i>First Party';
      selectedPartyColor = "red";
    });

  document
    .getElementById("addSecondParty")
    .addEventListener("click", function () {
      var partyButton = document.getElementById("partyButton");
      partyButton.innerHTML =
        '<i class="bi bi-circle-fill circle party blue"></i> Second Party';
      selectedPartyColor = "blue";
    });

  document
    .getElementById("addThirdParty")
    .addEventListener("click", function () {
      var partyButton = document.getElementById("partyButton");
      partyButton.innerHTML =
        '<i class="bi bi-circle-fill circle party green"></i> Third Party';
      selectedPartyColor = "green";
    });
  document
    .getElementById("addFourthParty")
    .addEventListener("click", function () {
      var partyButton = document.getElementById("partyButton");
      partyButton.innerHTML =
        '<i class="bi bi-circle-fill circle party yellow"></i> Fourth Party';
      selectedPartyColor = "yellow";
    });

  pdfCanvas.addEventListener("dragover", function (event) {
    event.preventDefault();
  });

  pdfCanvas.addEventListener("drop", function (event) {
    event.preventDefault();

    // Check if PDF is loaded before allowing dragging and dropping
    if (!pdfLoaded) {
      return; // Exit the function if PDF is not loaded
    }

    const fieldType = event.dataTransfer.getData("text/plain");

    // Create new input field with the specified field type
    const inputField = createInputField(
      event.clientX,
      event.clientY,
      fieldType,
      selectedPartyColor
    );

    // Add event listeners for dragging
    inputField.addEventListener("mousedown", startDragging);

    // Store the input field in the array
    if (!inputFields[currentPage]) {
      inputFields[currentPage] = [];
    }
    inputFields[currentPage].push(inputField);

    // Append the input field to the document body
    pdfCanvas.parentNode.appendChild(inputField);
    // document.body.appendChild(inputField);
  });

  function createInputField(x, y, fieldType, color) {
    pdfCanvasDimensions = pdfCanvas.getBoundingClientRect();
    const inputContainer = document.createElement("div");
    inputContainer.style.position = "absolute";
    inputContainer.style.left = `${x}px`;
    inputContainer.style.top = `${y}px`;
    inputContainer.style.border = `1px solid ${color}`;

    // Create label to display field type
    const label = document.createElement("div");
    label.innerText = fieldType;
    label.style.background = "white";
    label.style.color = `${color}`;
    label.style.padding = "2px";
    label.style.border = `1px solid ${color}`;
    label.style.position = "absolute";
    label.style.top = "-29px"; // Adjust the position as needed
    label.style.left = "0";
    label.style.zIndex = "9999"; // Ensure it appears on top
    inputContainer.appendChild(label);

    // const circleIcon = document.createElement("i");
    // circleIcon.className = "bi bi-circle-fill";
    // circleIcon.style.color = color;
    // circleIcon.style.position = "absolute";
    // circleIcon.style.left = "28px";
    // circleIcon.style.top = "50%";
    // circleIcon.style.transform = "translateY(-50%)";
    // inputContainer.appendChild(circleIcon);

    // Create input field
    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.style.width = "160px";
    inputField.style.height = "35px";
    inputField.style.border = `1px solid ${color}`;
    inputField.style.left = `${x}px`;
    // inputField.style.left = `${x + 20}px`;
    inputField.style.top = `${y}px`;
    inputField.addEventListener("click", function(event) {
      event.preventDefault();
      inputField.innerText = fieldType;
      // const fieldType = "Date"; // You can modify this to identify the field type based on the input field clicked
      createPopup(fieldType);
  });
    inputContainer.appendChild(inputField);

    // Create close button
    const closeButton = document.createElement("button");
    closeButton.innerText = "X"; // Text for close button
    closeButton.style.fontSize = "80%";
    closeButton.style.border = "none";
    closeButton.style.color = "red";
    closeButton.style.position = "absolute";
    closeButton.style.top = "-10px";
    closeButton.style.right = "-10px";
    closeButton.style.backgroundColor = "white";
    closeButton.addEventListener("click", function () {
      inputContainer.parentNode.removeChild(inputContainer);
      // Remove the input field from the inputFields object
      const index = inputFields[currentPage].indexOf(inputContainer);
      if (index !== -1) {
        inputFields[currentPage].splice(index, 1);
      }
      // document.body.removeChild(inputContainer);
    });
    inputContainer.appendChild(closeButton);

    // Add event listeners for dragging
    inputField.addEventListener("mousedown", startDragging);

    

    pdfCanvas.parentNode.appendChild(inputContainer);

    return inputContainer;
  }

  // function createInputField(x, y) {
  //   const inputField = document.createElement("input");
  //   console.log(
  //     "pdfCanvasLeft " +
  //       pdfCanvasDimensions.left +
  //       " pdfCanvastop " +
  //       pdfCanvasDimensions.top
  //   );

  //   // console.log(" x1 "+x1+" x "+x);
  //   inputField.type = "text";
  //   inputField.style.position = "absolute";
  //   inputField.style.left = `${x}px`;
  //   inputField.style.top = `${y}px`;
  //   inputField.style.width = "110px";
  //   inputField.style.height = "30px";
  //   inputField.style.border = "1px solid black";
  //   return inputField;
  // }

  function startDragging(event) {
    isDragging = true;
    activeInputField = event.target.parentNode; // Get the parent container which is the inputContainer;

    // Calculate the offset relative to the mouse position
    offsetX = event.clientX - parseFloat(activeInputField.style.left);
    offsetY = event.clientY - parseFloat(activeInputField.style.top);

    // Add event listeners for mousemove and mouseup
    document.addEventListener("mousemove", handleDragging);
    document.addEventListener("mouseup", stopDragging);
  }

  function handleDragging(event) {
    if (!isDragging) return;

    // Update the position of the active input field being dragged
    activeInputField.style.left = `${event.clientX - offsetX}px`;
    activeInputField.style.top = `${event.clientY - offsetY}px`;
    // console.log("when mouseMove, in handle dragging, left "+activeInputField.style.left+" top "+activeInputField.style.top);
  }

  function stopDragging() {
    // let x1 = parseFloat(activeInputField.style.left) - pdfCanvasDimensions.left;
    // let y1 = parseFloat(activeInputField.style.top) - pdfCanvasDimensions.top;
    // console.log(" x1 " + x1 + " y1 " + y1);
    // let pcd = parseFloat(activeInputField.style.left);
    // console.log("pcd  " + pcd);
    // console.log("activeInputFieldX  " + x1 + "  activeInputFieldY  " + y1);
    pdfCanvasDimensions = pdfCanvas.getBoundingClientRect();
    console.log(
      "Page " +
        currentPage +
        "Pdf CoOrdinants  : X : " +
        activeInputField.style.left +
        "   Y :" +
        activeInputField.style.top
    );
    // console.log("activeInputFieldX  " + activeInputField.style.left + "  activeInputFieldY  " + activeInputField.style.top);
    isDragging = false;
    activeInputField = null;
    // Remove event listeners for mousemove and mouseup
    document.removeEventListener("mousemove", handleDragging);
    document.removeEventListener("mouseup", stopDragging);
  }

  // Previous button event listener
  document
    .getElementById("previousButton")
    .addEventListener("click", function () {
      let nxtPage = currentPage;
      if (currentPage > 1) {
        currentPage--;
        renderPDF(currentPage);
      }
      removePreviousPageInputs(nxtPage);
      addCurrentPageInputs(currentPage);
      updatePageNumber();
    });

  document.getElementById("nextButton").addEventListener("click", function () {
    let prevPage = currentPage;
    if (currentPage < noOfpages) {
      currentPage++;
      renderPDF(currentPage);
    }
    removePreviousPageInputs(prevPage);
    addCurrentPageInputs(currentPage);
    updatePageNumber();
  });

  function removePreviousPageInputs(pPage) {
    if (inputFields[pPage]) {
      for (let i = 0; i < inputFields[pPage].length; i++) {
        pdfCanvas.parentNode.removeChild(inputFields[pPage][i]);
      }
    }
  }
  function addCurrentPageInputs(cPage) {
    if (inputFields[cPage]) {
      for (let i = 0; i < inputFields[cPage].length; i++) {
        pdfCanvas.parentNode.appendChild(inputFields[cPage][i]);
        console.log("****************");
        console.log(
          "Input fields x co-ordinates in page " +
            inputFields[cPage][i].style.top
        );
        console.log(
          "Input fields y co-ordinates in page " +
            inputFields[cPage][i].style.left
        );
      }
    }
  }

  document.querySelectorAll(".buttonClass").forEach((button) => {
    button.addEventListener("dragstart", function (event) {
      const fieldType = button.dataset.type;
      // Start dragging with data transfer
      event.dataTransfer.setData("text/plain", fieldType);
    });
  });

  function displayPageNumber() {
    const pageNumberContainer = document.createElement("div");
    pageNumberContainer.id = "pageNumberContainer";
    pageNumberContainer.style.position = "absolute";
    pageNumberContainer.style.top = "40px";
    pageNumberContainer.style.left = "530px";
    pageNumberContainer.style.color = "#000";
    pageNumberContainer.style.fontSize = "14px";
    pdfCanvas.parentNode.appendChild(pageNumberContainer);
    updatePageNumber();
  }

  // Function to update page number
  function updatePageNumber() {
    const pageNumberContainer = document.getElementById("pageNumberContainer");
    pageNumberContainer.innerText = `Page ${currentPage}`;
  }

// Function to create and display a popup based on field type
function createPopup(fieldType) {
  const popupContainer = document.createElement("div");
  popupContainer.id = "popupContainer";
  popupContainer.style.position = "absolute";
  popupContainer.style.top = "50%";
  popupContainer.style.left = "50%";
  popupContainer.style.transform = "translate(-50%, -50%)";
  popupContainer.style.background = "#fff";
  popupContainer.style.padding = "20px";
  popupContainer.style.border = "1px solid #ccc";
  popupContainer.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.1)";
  
  let popupContent;
  if (fieldType === "Text") {
      popupContent = document.createElement("input");
      popupContent.type = "text";
      popupContent.placeholder = "Enter text";
  } else if (fieldType === "Signature") {
      popupContent = document.createElement("canvas");
      popupContent.width = 300;
      popupContent.height = 150;
      popupContent.style.border = "1px solid #ccc";
      popupContent.style.cursor = "crosshair";
      const context = popupContent.getContext("2d");
      let isDrawing = false;
      popupContent.addEventListener("mousedown", function (event) {
          isDrawing = true;
          const x = event.clientX - popupContent.getBoundingClientRect().left;
          const y = event.clientY - popupContent.getBoundingClientRect().top;
          context.beginPath();
          context.moveTo(x, y);
      });
      popupContent.addEventListener("mousemove", function (event) {
          if (isDrawing) {
              const x = event.clientX - popupContent.getBoundingClientRect().left;
              const y = event.clientY - popupContent.getBoundingClientRect().top;
              context.lineTo(x, y);
              context.stroke();
          }
      });
      popupContent.addEventListener("mouseup", function () {
          isDrawing = false;
      });
      popupContent.addEventListener("mouseleave", function () {
          isDrawing = false;
      });
  } else if (fieldType === "Date") {
      popupContent = document.createElement("input");
      popupContent.type = "date";
  }
  
  const submitButton = document.createElement("button");
  submitButton.innerText = "Submit";
  submitButton.addEventListener("click", function() {
      let enteredValue;
      if (fieldType === "Signature") {
          // For signature, you may want to get the image data of the canvas
          const signatureCanvas = popupContent;
          enteredValue = signatureCanvas.toDataURL(); // This gives the signature image as data URL
      } else {
          enteredValue = popupContent.value;
      }
      console.log("Entered value:", enteredValue);
      document.body.removeChild(popupContainer);
  });
  
  popupContainer.appendChild(popupContent);
  popupContainer.appendChild(submitButton);
  
  document.body.appendChild(popupContainer);
}


  // // Modify the event listener for clicking on input field
  // pdfCanvas.addEventListener("click", function (event) {
  //   event.preventDefault();

  //   // Check if PDF is loaded before allowing clicking
  //   if (!pdfLoaded) {
  //     return; // Exit the function if PDF is not loaded
  //   }

  //   // Identify the field type based on the clicked element or any other logic you have
  //   const fieldType = "Text"; // For example, you can modify this to identify the field type based on the clicked element

  //   // Create and display popup based on the field type
  //   createPopup(fieldType);
  // });
  
});
