document.addEventListener("DOMContentLoaded", function () {
    const pdfViewerContainer = document.getElementById("pdfViewerContainer");
    const pdfCanvas = document.getElementById("pdfCanvas");
    const context = pdfCanvas.getContext("2d");
    let pdfUrl = "";
    let inputFields = [];
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let activeInputField = null;
   
    function renderPDF() {
        pdfjsLib.getDocument(pdfUrl).promise.then(function(pdf) {
            return pdf.getPage(1);
        }).then(function(page) {
            const viewport = page.getViewport({ scale: 1 });
            pdfCanvas.width = viewport.width;
            pdfCanvas.height = viewport.height;
   
            page.render({
                canvasContext: context,
                viewport: viewport
            });
        }).catch(function(error) {
            console.error('Error rendering PDF:', error);
        });
    }
   
/*     async function renderWholePDF() {
      try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const numPages = pdf.numPages;
   
        for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1 });
          pdfCanvas.width = viewport.width;
          pdfCanvas.height = viewport.height;
   
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;
        }
      } catch (error) {
        console.error("Error rendering PDF:", error);
      }
    } */
   
    function loadPDF(file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function (event) {
        pdfUrl = event.target.result;
        renderPDF();
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
   
      // Create new input field
      const inputField = createInputField(event.clientX, event.clientY);
   
      // Add event listeners for dragging
      inputField.addEventListener("mousedown", startDragging);
   
      // Append the input field to the document body
      document.body.appendChild(inputField);
   
      // Store the input field in the array
      inputFields.push(inputField);
    });
   
    function createInputField(x, y) {
      const inputField = document.createElement("input");
      inputField.type = "text";
      inputField.style.position = "absolute";
      inputField.style.left = `${x}px`;
      inputField.style.top = `${y}px`;
      inputField.style.width = "100px";
      inputField.style.height = "20px";
      inputField.style.border = "1px solid black";
      return inputField;
    }
   
    function startDragging(event) {
      isDragging = true;
      activeInputField = event.target;
   
      // Calculate the offset relative to the mouse position
      offsetX = event.clientX - parseInt(activeInputField.style.left);
      offsetY = event.clientY - parseInt(activeInputField.style.top);
   
      // Add event listeners for mousemove and mouseup
      document.addEventListener("mousemove", handleDragging);
      document.addEventListener("mouseup", stopDragging);
    }
   
    function handleDragging(event) {
      if (!isDragging) return;
   
      // Update the position of the active input field being dragged
      activeInputField.style.left = `${event.clientX - offsetX}px`;
      activeInputField.style.top = `${event.clientY - offsetY}px`;
    }
   
    function stopDragging() {
      isDragging = false;
      activeInputField = null;
   
      // Remove event listeners for mousemove and mouseup
      document.removeEventListener("mousemove", handleDragging);
      document.removeEventListener("mouseup", stopDragging);
    }
  });