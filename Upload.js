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
  let fieldType;
  let submitterId = 1;
  let submitterName = "firstParty";
  let inputFieldCounter = 0;
  let fieldObject;
  let fields = [];
  let submitters = [];
  let closeButton;

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
        '<i class="bi bi-circle-fill circle party" id="partyCircle"></i>Employee';
      selectedPartyColor = "red";
      submitterId = 1;
      submitterName = "firstParty";
    });

  document
    .getElementById("addSecondParty")
    .addEventListener("click", function () {
      var partyButton = document.getElementById("partyButton");
      partyButton.innerHTML =
        '<i class="bi bi-circle-fill circle party blue"></i> Employer';
      selectedPartyColor = "blue";
      submitterId = 2;
      submitterName = "secondParty";
    });

  document
    .getElementById("addThirdParty")
    .addEventListener("click", function () {
      var partyButton = document.getElementById("partyButton");
      partyButton.innerHTML =
        '<i class="bi bi-circle-fill circle party green"></i> Agency';
      selectedPartyColor = "green";
      submitterId = 3;
      submitterName = "thirdParty";
    });
  document
    .getElementById("addFourthParty")
    .addEventListener("click", function () {
      var partyButton = document.getElementById("partyButton");
      partyButton.innerHTML =
        '<i class="bi bi-circle-fill circle party yellow"></i> Client';
      selectedPartyColor = "yellow";
      submitterId = 4;
      submitterName = "fourthParty";
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

    fieldType = event.dataTransfer.getData("text/plain");

    // Create new input field with the specified field type
    const inputField = createInputField(
      event.clientX,
      event.clientY,
      fieldType,
      selectedPartyColor
    );

    fieldObject = {
      id: inputField.id,
      required: false,
      type: fieldType,
      submitter_uuid: submitterId,
      areas: [
        {
          page: currentPage,
          x: inputField.style.top,
          y: inputField.style.left,
          w: inputField.querySelector("input").style.width,
          h: inputField.querySelector("input").style.height,
        },
      ],
    };

    fields.push(fieldObject);
    let submitter_present = false; // Initialize submitter_present to false

    submitterObject = {
      submitter_Id: submitterId,
      submitter_Name: submitterName,
    };

    if (submitters.length === 0) {
      submitters.push(submitterObject);
    } else {
      for (let i = 0; i < submitters.length; i++) {
        // Correct loop condition
        if (submitterObject.submitter_Id === submitters[i].submitter_Id) {
          submitter_present = true;
          break; // No need to continue looping if the submitter is already present
        }
      }
      if (!submitter_present) {
        submitters.push(submitterObject);
      }
    }

    // Add event listeners for dragging
    inputField.addEventListener("mousedown", startDragging);

    // Store the input field in the array
    if (!inputFields[currentPage]) {
      inputFields[currentPage] = [];
    }
    inputFields[currentPage].push(inputField);

    // Append the input field to the document body
    pdfCanvas.parentNode.appendChild(inputField);
  });

  function createInputField(x, y, fieldType, color) {
    let inputFieldId = `inputField-${inputFieldCounter++}`;
    pdfCanvasDimensions = pdfCanvas.getBoundingClientRect();
    const inputContainer = document.createElement("div");
    inputContainer.style.position = "absolute";
    inputContainer.id = inputFieldId;
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

    // Create input field
    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.style.width = "160px";
    inputField.style.height = "35px";
    inputField.style.border = `1px solid ${color}`;
    inputField.style.left = `${x}px`;
    // inputField.style.left = `${x + 20}px`;
    inputField.style.top = `${y}px`;
    inputField.addEventListener("click", function (event) {
      event.preventDefault();
      inputField.innerText = fieldType;
      // const fieldType = "Date"; // You can modify this to identify the field type based on the input field clicked
      createPopup(fieldType, inputField);
    });
    inputContainer.appendChild(inputField);

    // Create close button
    closeButton = document.createElement("button");
    closeButton.innerText = "X"; // Text for close button
    closeButton.style.fontSize = "80%";
    closeButton.style.border = "none";
    closeButton.style.color = "red";
    closeButton.style.position = "absolute";
    closeButton.style.top = "-10px";
    closeButton.style.right = "-10px";
    closeButton.style.backgroundColor = "white";
    closeButton.addEventListener("click", function (e) {
      inputContainer.parentNode.removeChild(inputContainer);
      // Remove the input field from the inputFields object
      const index = inputFields[currentPage].indexOf(inputContainer);
      if (index !== -1) {
        inputFields[currentPage].splice(index, 1);
      }

      let submittersCount = 0;
      let dmySubmitterId ;
      let dmySubmitter ={};
      for (const field of fields) {
        if (field.id === e.target.parentNode.id) {
          fields.splice(fields.indexOf(field), 1);
          dmySubmitterId = field.submitter_uuid;
          break;
        }
      }
      for(const field of fields){
        if(dmySubmitterId === field.submitter_uuid){
          submittersCount++;
        }
      }
      for(let i = 0;i<submitters.length;i++){
        if(submitters[i].submitter_Id === dmySubmitterId){
          dmySubmitter = submitters[i];
          break;
        }
      }
      if(submittersCount === 0){
        submitters.splice(submitters.indexOf(dmySubmitter),1);
      }
      
      console.log("submittersCount " + submittersCount);
    });
    inputContainer.appendChild(closeButton);

    // Add event listeners for dragging
    inputField.addEventListener("mousedown", startDragging);

    pdfCanvas.parentNode.appendChild(inputContainer);

    return inputContainer;
  }

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
    for (const field of fields) {
      if (activeInputField.id === field.id) {
        field.areas[0].x = activeInputField.style.left;
        field.areas[0].y = activeInputField.style.top;
        break;
      }
    }
  }

  function stopDragging() {
    pdfCanvasDimensions = pdfCanvas.getBoundingClientRect();
    console.log(
      "Page " +
        currentPage +
        "Pdf CoOrdinants  : X : " +
        activeInputField.style.left +
        "   Y :" +
        activeInputField.style.top
    );

    fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify({
        title: activeInputField.style.left,
        body: activeInputField.style.top,
        userId: submitterId,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => response.json())
      .then((json) => console.log(json));

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
  function createPopup(fieldType, inputField) {
    const popupContainer = document.createElement("div");
    popupContainer.id = "popupContainer";
    popupContainer.style.position = "absolute";
    popupContainer.style.top = "2%";
    popupContainer.style.left = "50%";
    // popupContainer.style.transform = "translate(-50%, -50%)";
    popupContainer.style.background = "#fff";
    popupContainer.style.padding = "20px";
    popupContainer.style.border = "1px solid #ccc";
    popupContainer.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.1)";
    popupContainer.style.display = "flex";
    popupContainer.style.flexDirection = "column";
    popupContainer.style.alignItems = "center";

    let popupContent;
    if (fieldType === "Text") {
      popupContent = document.createElement("input");
      popupContent.type = "text";
      popupContent.placeholder = "Enter text";
    } else if (fieldType === "Signature") {
      const popupContents = document.createElement("div");
      popupContent = document.createElement("canvas");
      popupContent.width = 300;
      popupContent.height = 150;
      popupContent.style.border = "1px solid #ccc";
      popupContent.style.cursor = "crosshair";
      const context = popupContent.getContext("2d");
      let isDrawing = false;
      popupContent.addEventListener("mousedown", function (event) {
        isDrawing = true;
        // const x = event.clientX - popupContent.getBoundingClientRect().left;
        // const y = event.clientY - popupContent.getBoundingClientRect().top;
        context.beginPath();
        // context.moveTo(x, y);
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

      const clearButton = document.createElement("button");
      clearButton.innerText = "Clear";
      clearButton.style.backgroundColor = "#ef5350";
      clearButton.style.color = "#fff";
      clearButton.style.borderColor = "#ef5350";
      clearButton.style.marginBottom = "10px";
      clearButton.addEventListener("click", function () {
        // Clear the canvas
        context.clearRect(0, 0, popupContent.width, popupContent.height);
      });

      popupContents.appendChild(popupContent);
      popupContents.appendChild(clearButton);
      popupContainer.appendChild(popupContents);
    } else if (fieldType === "Date") {
      popupContent = document.createElement("input");
      popupContent.type = "date";
    }

    const buttonsContainer = document.createElement("div");
    buttonsContainer.style.display = "flex";
    buttonsContainer.style.width = "100%";
    buttonsContainer.style.justifyContent = "center";
    buttonsContainer.style.marginTop = "10px";

    const popupCloseButton = document.createElement("button");
    popupCloseButton.innerText = "Close";
    popupCloseButton.style.backgroundColor = "#37a0bf";
    popupCloseButton.style.borderColor = "#37a0bf";
    popupCloseButton.style.marginRight = "10px";
    popupCloseButton.addEventListener("click", function () {
        document.body.removeChild(popupContainer);
    });
    // popupContainer.appendChild(closeButton);

    const submitButton = document.createElement("button");
    submitButton.innerText = "Submit";
    submitButton.style.backgroundColor = "#37a0bf";
    submitButton.style.borderColor = "#37a0bf";
    submitButton.style.marginLeft = "10px";
    submitButton.addEventListener("click", function () {
      let enteredValue;
      if (fieldType === "Signature") {
        // For signature, get the canvas element
        const signatureCanvas = popupContent;
        // Create a new canvas to overlay the input field
        const overlayCanvas = document.createElement("canvas");
        overlayCanvas.width = inputField.offsetWidth;
        overlayCanvas.height = inputField.offsetHeight;
        const overlayContext = overlayCanvas.getContext("2d");
        // Copy the content of the signature canvas onto the overlay canvas
        overlayContext.drawImage(
          signatureCanvas,
          0,
          0,
          overlayCanvas.width,
          overlayCanvas.height
        );
        // Convert the overlay canvas to a data URL
        enteredValue = overlayCanvas.toDataURL();
        // Set the value of the input field to the data URL
        inputField.style.backgroundSize = "cover";
        inputField.style.backgroundRepeat = "no-repeat";
        // Hide the signature canvas
        signatureCanvas.style.display = "none";
      } else {
        // For other field types, get the entered value from the input field
        enteredValue = popupContent.value;
        // Set the value of the input field to the entered value
        inputField.value = enteredValue;
      }
      console.log("Entered value:", enteredValue);
      // inputField.value = enteredValue;
      document.body.removeChild(popupContainer);
    });

    popupContainer.appendChild(popupContent);
    // popupContainer.appendChild(submitButton);
    buttonsContainer.appendChild(popupCloseButton);
    buttonsContainer.appendChild(submitButton);
    popupContainer.appendChild(buttonsContainer);
    document.body.appendChild(popupContainer);
  }

  let saveButton = document.getElementsByClassName("save")[0];
  saveButton.addEventListener("click", function () {
    console.log(fields);
    console.log(submitters);
  });

});
