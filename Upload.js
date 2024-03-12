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

  pdfCanvas.addEventListener("dragover", function (event) {
    event.preventDefault();
  });

  pdfCanvas.addEventListener("drop", function (event) {
    event.preventDefault();

    // Check if PDF is loaded before allowing dragging and dropping
    if (!pdfLoaded) {
      return; // Exit the function if PDF is not loaded
    }

    // Create new input field with the specified field type
    const inputField = createInputField(
      event.clientX,
      event.clientY,
      "Text"
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

  function createInputField(x, y, fieldType) {
    pdfCanvasDimensions = pdfCanvas.getBoundingClientRect();
    const inputContainer = document.createElement("div");
    inputContainer.style.position = "absolute";
    inputContainer.style.left = `${x}px`;
    inputContainer.style.top = `${y}px`;

    // Create label to display field type
    const label = document.createElement("div");
    label.innerText = fieldType;
    label.style.background = "white";
    label.style.color = "black";
    label.style.padding = "2px";
    label.style.border = "1px solid black";
    label.style.position = "absolute";
    label.style.top = "-20px"; // Adjust the position as needed
    label.style.left = "0";
    label.style.zIndex = "9999"; // Ensure it appears on top
    inputContainer.appendChild(label);

    // Create input field
    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.style.width = "160px";
    inputField.style.height = "35px";
    inputField.style.border = "1px solid black";
    inputField.style.left = `${x}px`;
    inputField.style.top = `${y}px`;
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
    console.log("when mouseMove, in handle dragging, left "+activeInputField.style.left+" top "+activeInputField.style.top);
  }

  function stopDragging() {
    // let x1 = parseFloat(activeInputField.style.left) - pdfCanvasDimensions.left;
    // let y1 = parseFloat(activeInputField.style.top) - pdfCanvasDimensions.top;
    // console.log(" x1 " + x1 + " y1 " + y1);
    // let pcd = parseFloat(activeInputField.style.left);
    // console.log("pcd  " + pcd);
    // console.log("activeInputFieldX  " + x1 + "  activeInputFieldY  " + y1);
    pdfCanvasDimensions = pdfCanvas.getBoundingClientRect();
    console.log("activeInputFieldX  " + activeInputField.style.left + "  activeInputFieldY  " + activeInputField.style.top);
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
    });

  document.getElementById("nextButton").addEventListener("click", function () {
    let prevPage = currentPage;
    if (currentPage < noOfpages) {
      currentPage++;
      renderPDF(currentPage);
    }
    removePreviousPageInputs(prevPage);
    addCurrentPageInputs(currentPage);
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
      }
    }
  }
  
});
