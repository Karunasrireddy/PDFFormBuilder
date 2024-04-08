document.addEventListener("DOMContentLoaded", function () {
  let payLoadObject;
  let arrayOfTemplates;
  let submittersData;
  let submittersPayload;
  let submittersDetails;
  let arrayOfSubmitters;
  let payLoad;
  let contactData;
  let contactDetails;

  function GetpayLoad(data) {
    payLoadObject = data["payload"];
    arrayOfTemplates = payLoadObject.map((obj) => ({
      templateName: obj.templateName,
      templateId: obj.templateId,
      createdBy: obj.createdBy,
      createdTimestamp: obj.createdTimestamp,
    }));
  }

  const requestOptionsGet = {
    method: "GET",
    headers: {
      "Content-Type": "application/json", // Example header, replace with your desired headers
      Authorization:
        "Bearer eyJraWQiOiJUQ3ZIcnJBQnFcL0NRT0hCZ0NsMmZQVXQ5bG1zWFwvREVlbWVCMVNrbjhtVmc9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJhNTFmNWM3Ny0yOGI1LTQxZTAtYjk3YS1kNDdhYzQ1YTUzYTUiLCJkZXZpY2Vfa2V5IjoidXMtZWFzdC0xXzRlZTRkODI1LTE5MjItNGE5Zi1iMWYxLWJkMGZhNTZmMjcyOCIsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX3dxM0xEUE1ZaSIsImNsaWVudF9pZCI6IjdraGdsZTExOGkzNG90Y3MwNmUzYWIwYW80IiwiZXZlbnRfaWQiOiI3ZDJlN2ZkMi04MjAxLTQ4MDItYTEwNi1iNGQzOGZkYWIzM2IiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNzEyNTUwMjk5LCJleHAiOjE3MTI1NjgyOTksImlhdCI6MTcxMjU1MDI5OSwianRpIjoiZTA4MjMzNDgtOWQxMi00MjA0LWJjODgtNDVhNjI1YjM0NDQ3IiwidXNlcm5hbWUiOiJwYXZpbGxpb2FkbWluIn0.mYU36FM-mbXAo1WZ3zfIvt_mejkem3gKxBLViCAzfaecsBGlSosuAXRJtm5gSVuZMTJV-MA7iF0SGMLM6y85z67YZ7BrSUi8Lv4SMQd7unUSTXEytsexExPSaZdugshviIOgovSjvL13c2m33RooEJ8brR25wJOelMCIXBxy5jYtTG7AnJ-3xCNKSSz88hrrQR5L_AWawRMRND18PuuKsDIf6uhu_V2kpbD6QckXZwYP53FjCjUgpnd9MYyGK06KXZGPGL9qN9zyFNwVAqhhpDnti3fS1944n60yKu575V8a4wEaQHZt6P9EoisyjfW-JmKhfOMR6J_gNZu6nbm75A",
      tenantId: "NA", // Example Authorization header
    },
  };
  fetch(
    "https://dev.pavillio.com/api/practice/v0.1/signatures/getTemplates",
    requestOptionsGet
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // Parse the JSON data
    })
    .then((data) => {
      console.log(data); // Handle the retrieved data
      GetpayLoad(data);
      // Call the displayCards function to generate and display cards
      displayCards();
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });

  function createCard(obj) {
    return `
  
    <div id = "card-${obj.templateId}" class="col-sm-12 mb-3 mb-sm-0">
        <div class="card cardname mt-2">
          <div class="card-body cardbodyname">
            <h5 class="card-title cardtitlename">${obj.templateName}</h5>
            <h5 class="card-title cardtitlename">${obj.templateId}</h5>
            <p class="card-text cardtextname">
              <i class="bi bi-person"></i> Created By: ${obj.createdBy}
            </p>
            <p class="card-text2 cardtextname2">
              <i class="bi bi-calendar4-event"></i> Document Created Date And Time: ${obj.createdTimestamp}
            </p>
          </div>
        </div>
      </div>
  
    `;
  }
  // Function to display cards on the webpage
  function displayCards() {
    // Select the container where cards will be appended
    const container = document.getElementById("cards-container");

    // Clear previous content in the container
    container.innerHTML = "";
    //console.log("arrayOfTemplates "+arrayOfTemplates);
    let strarrayOfTemplates = arrayOfTemplates;

    // Iterate through extractedFields and create a card for each object
    strarrayOfTemplates.map((obj) => {
      // Create HTML for the card using the createCard function
      const cardHTML = createCard(obj);

      const cardDiv = document.createElement("div");
      cardDiv.id = obj.templateId;

      cardDiv.innerHTML = cardHTML;

      //const cardElement = cardDiv.firstChild;

      cardDiv.addEventListener("click", getTemplate);

      // Append the card HTML to the container
      container.appendChild(cardDiv);
    });
  }

  function getTemplate(event) {
    const cardId = event.currentTarget.id;

    fetch(
      `https://dev.pavillio.com/api/practice/v0.1/signatures/getTemplates?templateId=${cardId}`,
      requestOptionsGet
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json(); // Parse the JSON data
      })
      .then((data) => {
        console.log(data); // Handle the retrieved data

        getSubmiiters(data);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }

  function getSubmiiters(data) {
    submittersPayload = data["payload"];
    console.log(submittersPayload);
    //submittersDetails = JSON.stringify(submittersPayload[0].submittersInfo);
    submittersDetails = submittersPayload[0].submittersInfo;
    /* console.log(submittersDetails);
  arrayOfSubmitters = submittersDetails.map((obj) => ({
    submitterName: obj.name,
    submitterId: obj.id,
  })); */
    displaySubmitterPop();

    document.getElementById("popupContainer").style.display = "block";

    //console.log("cardId " + cardId);

    document
      .getElementById("closePopup")
      .addEventListener("click", function () {
        document.getElementById("popupContainer").style.display = "none";
      });
  }

  function createSubmittersPopUp(submittersDetails) {
    let submittersHTML = "";

    /* for (let i = 0; i < submittersDetails.length; i++) {
    console.log(submittersDetails[i].name + " " + submittersDetails[i].id);
  } */

    if (submittersDetails === null) {
      submittersHTML = `
    <p>No fields available with this template</p>`;
    } else {
      submittersDetails.forEach((submitter, index) => {
        submittersHTML += `
    <div class="form-group row submittersDiv">
    <div class="col-6">
      <input
        type="text"
        class="form-control phoneName"
        placeholder=${submitter.name}
      />
    </div>
    <select id="selectContact${index}"></select>
</div>`;
      });
    }

    return `<div id="popupContainer" class="popupContainer">
  <div class="popup">
    <div class="popupHeader">
      <h4>New Document Template</h4>
      <span id="closePopup" class="closePopup">&times;</span>
    </div>
    <hr />
    <div id="phoneContent" class="content">
      <div class="card phoneCard">
        <div class="card-body phonebody">
        ${submittersHTML}
        </div>
      </div>
    </div>
  </div>
</div>`;
  }

  function displaySubmitterPop() {
    console.log("arrayOfSubmitters " + submittersDetails);
    const submitterPopContainer = document.getElementById("submittersDiv");
    submitterPopContainer.innerHTML = "";
    const submittersPopUpHTML = createSubmittersPopUp(submittersDetails);
    const submitterPopElement = document.createElement("div");
    submitterPopElement.innerHTML = submittersPopUpHTML;
    submitterPopContainer.appendChild(submitterPopElement);
    console.log("submittersDetails " + JSON.stringify(submittersDetails));
    fetchContactDetails();
  }

  // document.getElementById("closePopup").addEventListener("click", function () {
  //   document.getElementById("popupContainer").style.display = "none";
  // });

  document.addEventListener("click", function (event) {
    var popupContainer = document.getElementById("popupContainer");
    var popup = document.getElementsByClassName("popup")[0];

    if (event.target === popupContainer) {
      popupContainer.style.display = "none";
    }
  });
  function fetchContactDetails() {
    fetch(
      "https://dev.pavillio.com/api/search/v0.1/search/CNT?limit=10&offset=1&sortBy=lastName&orderBy=asc&firstName=a&isOrCondition=Y",
      requestOptionsGet
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json(); // Parse the JSON data
      })
      .then((data) => {
        console.log(data); // Handle the retrieved data
        getContactData(data);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }

  function getContactData(data) {
    payLoad = data["payload"];
    //console.log(payLoad);
    contactData = payLoad["rows"];
    console.log(contactData);
    contactData.map((obj) => {
      let firstName = obj.firstName;
      let middleName = obj.middleName;
      let lastName = obj.lastName;
      let fullName = firstName + " " + middleName + " " + lastName;
      //let option = document.createElement("option");
      /* option.value = firstName + " " + middleName + " " + lastName;
    option.text = firstName + " " + middleName + " " + lastName; */
      /* contactDetails = document.getElementById(`selectContact${index}`);
    if (contactDetails) {
      contactDetails.appendChild(option);
    }
    //contactDetails.appendChild(option);
    console.log(firstName + " " + middleName + " " + lastName); */
      if (submittersDetails !== null) {
        for (let i = 0; i < submittersDetails.length; i++) {
          let contactDetails = document.getElementById(`selectContact${i}`);
          if (contactDetails) {
            let option = document.createElement("option");
            option.value = fullName;
            option.text = fullName;
            contactDetails.appendChild(option);
          }
        }
      }
    });
  }

  document
    .getElementById("openPopupCreate")
    .addEventListener("click", function () {
      document.getElementById("popupContainerCreate").style.display = "block";
    });

  document
    .getElementById("closePopupCreate")
    .addEventListener("click", function () {
      document.getElementById("popupContainerCreate").style.display = "none";
    });

  document.addEventListener("click", function (event) {
    var popupContainerCreate = document.getElementById("popupContainerCreate");
    var popupCreate = document.getElementsByClassName("popupCreate")[0];

    if (event.target === popupContainerCreate) {
      popupContainerCreate.style.display = "none";
    }
  });

  document
    .getElementById("createButton")
    .addEventListener("click", function () {
      var documentName = document.getElementById("documentName");
      // var errorMessage = document.getElementById('errorMessage');
      if (documentName !== "") {
        // If the document name is not empty, navigate to the other page
        window.location.href = "Upload.html";
      }
      // else{
      //   // errorMessage.textContent="Please Enter The Document Name"
      // alert("Please Enter The Document Name");
      // }
      // No alert or action needed if the document name is not entered
    });

  // fetch(
  //   "https://dev.pavillio.com/api/search/v0.1/search/CNT?limit=10&offset=1&sortBy=lastName&orderBy=asc&firstName=a&isOrCondition=Y",
  //   requestOptionsGet
  // )
  //   .then((response) => {
  //     if (!response.ok) {
  //       throw new Error("Network response was not ok");
  //     }
  //     return response.json(); // Parse the JSON data
  //   })
  //   .then((data) => {
  //     //console.log(data); // Handle the retrieved data
  //     //getContactData(data);
  //   })
  //   .catch((error) => {
  //     console.error("There was a problem with the fetch operation:", error);
  //   });

  // let payLoad;
  // let contactData;
  // let contactDetails = document.getElementById("selectContact");

  // function getContactData(data) {
  //   payLoad = data["payload"];
  //   //console.log(payLoad);
  //   contactData = payLoad["rows"];
  //   console.log(contactData);
  //   contactData.map((obj) => {
  //     let firstName = obj.firstName;
  //     let middleName = obj.middleName;
  //     let lastName = obj.lastName;
  //     let option = document.createElement("option");
  //     option.value = firstName + " " + middleName + " " + lastName;
  //     option.text = firstName + " " + middleName + " " + lastName;
  //     contactDetails.appendChild(option);
  //     console.log(firstName + " " + middleName + " " + lastName);
  //   });
  // }
});
