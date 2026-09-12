import {
    db,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "./firebase-config.js";


// ==========================================
// VARIABLES
// ==========================================

const reportModal = document.getElementById("reportModal");

const openReportBtn = document.getElementById("openReportBtn");
const reportLostBtn = document.getElementById("reportLostBtn");
const reportFoundBtn = document.getElementById("reportFoundBtn");
const ctaReportBtn = document.getElementById("ctaReportBtn");

const closeModal = document.getElementById("closeModal");

const itemForm = document.getElementById("itemForm");

const reportType = document.getElementById("reportType");

const lostTypeBtn = document.getElementById("lostTypeBtn");
const foundTypeBtn = document.getElementById("foundTypeBtn");

const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");

const imagePreviewContainer =
    document.querySelector(".image-preview-container");

const itemsContainer = document.getElementById("itemsContainer");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

const imageModal = document.getElementById("imageModal");
const fullImage = document.getElementById("fullImage");
const closeImageModal =
    document.getElementById("closeImageModal");


// ==========================================
// RETURN MODAL VARIABLES
// ==========================================

const returnModal = document.getElementById("returnModal");

const closeReturnModal =
    document.getElementById("closeReturnModal");

const returnForm =
    document.getElementById("returnForm");

let returningItemId = null;


// ==========================================
// QUESTIONS & ANSWERS VARIABLES
// ==========================================

const queryForm =
    document.getElementById("queryForm");

const questionsContainer =
    document.getElementById("questionsContainer");

const questionsCount =
    document.getElementById("questionsCount");

const answerModal =
    document.getElementById("answerModal");

const closeAnswerModal =
    document.getElementById("closeAnswerModal");

const answerForm =
    document.getElementById("answerForm");

const answerMessage =
    document.getElementById("answerMessage");

const answerQuestionPreview =
    document.getElementById("answerQuestionPreview");

let answeringQueryId = null;


// ==========================================
// APPLICATION DATA
// ==========================================

let items = [];

let questions = [];

let returnRecords = [];

let editingItemId = null;

let currentImageURL = "";


// ==========================================
// SET TODAY'S DATE
// ==========================================

document.getElementById("date").value =
    new Date().toISOString().split("T")[0];


// ==========================================
// MOBILE MENU
// ==========================================

menuBtn.addEventListener("click", () => {

    navLinks.classList.toggle("show");

});


// ==========================================
// OPEN REPORT MODAL
// ==========================================

function openModal(type = "Lost") {

    reportModal.style.display = "block";

    setReportType(type);

}


// ==========================================
// CLOSE REPORT MODAL
// ==========================================

function closeReportModal() {

    reportModal.style.display = "none";

    itemForm.reset();

    editingItemId = null;

    currentImageURL = "";

    imagePreview.src = "";

    imagePreviewContainer.style.display = "none";


    document.getElementById("date").value =
        new Date().toISOString().split("T")[0];


    document.getElementById("modalTitle").textContent =
        "Report an Item";


    document.getElementById("submitBtn").innerHTML =
        `
        <i class="fa-solid fa-cloud-arrow-up"></i>
        Submit Report
        `;

}


// ==========================================
// REPORT BUTTON EVENTS
// ==========================================

openReportBtn.addEventListener("click", () => {

    openModal("Lost");

});


reportLostBtn.addEventListener("click", () => {

    openModal("Lost");

});


reportFoundBtn.addEventListener("click", () => {

    openModal("Found");

});


ctaReportBtn.addEventListener("click", () => {

    openModal("Lost");

});


closeModal.addEventListener(
    "click",
    closeReportModal
);


// ==========================================
// CLOSE MODAL OUTSIDE CLICK
// ==========================================

window.addEventListener("click", (event) => {

    if (event.target === reportModal) {

        closeReportModal();

    }


    if (event.target === returnModal) {

        closeReturnModalFunction();

    }


    if (event.target === answerModal) {

        closeAnswerModalFunction();

    }

});


// ==========================================
// SET REPORT TYPE
// ==========================================

function setReportType(type) {

    reportType.value = type;


    lostTypeBtn.classList.remove("active-type");

    foundTypeBtn.classList.remove("active-type");


    if (type === "Lost") {

        lostTypeBtn.classList.add("active-type");

    }

    else {

        foundTypeBtn.classList.add("active-type");

    }

}


// ==========================================
// REPORT TYPE BUTTONS
// ==========================================

lostTypeBtn.addEventListener("click", () => {

    setReportType("Lost");

});


foundTypeBtn.addEventListener("click", () => {

    setReportType("Found");

});


// ==========================================
// IMAGE PREVIEW
// ==========================================

imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if (!file) return;


    // Prevent extremely large images

    if (file.size > 700 * 1024) {

        alert(
            "Please select an image smaller than 700 KB for this prototype."
        );

        imageInput.value = "";

        return;

    }


    const reader = new FileReader();


    reader.onload = function (event) {

        imagePreview.src = event.target.result;

        imagePreviewContainer.style.display = "block";

    };


    reader.readAsDataURL(file);

});


// ==========================================
// SHOW TOAST
// ==========================================

function showToast(message) {

    toastMessage.textContent = message;

    toast.style.display = "flex";


    setTimeout(() => {

        toast.style.display = "none";

    }, 3000);

}


// ==========================================
// LOAD ITEMS FROM FIREBASE
// ==========================================

async function loadItems() {

    try {

        itemsContainer.innerHTML = `
            <div class="loading">
                <i class="fa-solid fa-spinner fa-spin"></i>
                Loading reports...
            </div>
        `;


        const querySnapshot =
            await getDocs(collection(db, "items"));


        items = [];


        querySnapshot.forEach((document) => {

            items.push({

                id: document.id,

                ...document.data()

            });

        });


        // Newest first

        items.sort((a, b) => {

            return (
                (b.createdAt || 0) -
                (a.createdAt || 0)
            );

        });


        displayItems(items);

        updateStatistics();

    }

    catch (error) {

        console.error(
            "Error loading items:",
            error
        );


        itemsContainer.innerHTML = "";

        emptyState.style.display = "block";

    }

}


// ==========================================
// DISPLAY ITEMS
// ==========================================

function displayItems(itemsToDisplay) {

    itemsContainer.innerHTML = "";


    if (itemsToDisplay.length === 0) {

        emptyState.style.display = "block";

        return;

    }


    emptyState.style.display = "none";


    itemsToDisplay.forEach((item) => {

        const status =
            item.status || "Lost";


        const statusClass =
            `status-${status.toLowerCase()}`;


        const imageHTML =
            item.imageURL
                ? `
                <div
                    class="item-image"
                    onclick="window.openImagePreview('${item.imageURL}')"
                >

                    <img
                        src="${item.imageURL}"
                        alt="${escapeHTML(item.name)}"
                    >

                </div>
                `

                : `
                <div class="item-image">

                    <div class="no-image">

                        <i class="fa-solid fa-image"></i>

                        <span>No Image Available</span>

                    </div>

                </div>
                `;


        const returnedButton =
            status !== "Returned"

                ? `
                <button
                    class="action-btn return-btn"
                    onclick="window.openReturnModal('${item.id}')"
                >

                    <i class="fa-solid fa-handshake"></i>

                    Return

                </button>
                `

                : `
                <button
                    class="action-btn return-btn"
                    disabled
                >

                    <i class="fa-solid fa-check"></i>

                    Returned

                </button>
                `;


        const contactHTML = `

            <div class="item-contact">

                <p>

                    <i class="fa-solid fa-user"></i>

                    ${escapeHTML(item.contactName || "Not provided")}

                </p>


                <p>

                    <i class="fa-solid fa-phone"></i>

                    ${escapeHTML(item.contactPhone || "Not provided")}

                </p>


                <p>

                    <i class="fa-solid fa-envelope"></i>

                    ${escapeHTML(item.contactEmail || "Not provided")}

                </p>

            </div>

        `;


        const card = document.createElement("div");

        card.className = "item-card";


        card.innerHTML = `

            ${imageHTML}


            <div class="item-content">


                <div class="item-top">

                    <div>

                        <h3 class="item-title">

                            ${escapeHTML(item.name)}

                        </h3>


                        <span class="item-category">

                            ${escapeHTML(item.category)}

                        </span>

                    </div>


                    <span class="status ${statusClass}">

                        ${status}

                    </span>

                </div>


                <p class="item-description">

                    ${escapeHTML(item.description)}

                </p>


                <div class="item-info">

                    <span>

                        <i class="fa-solid fa-location-dot"></i>

                        ${escapeHTML(item.location)}

                    </span>


                    <span>

                        <i class="fa-solid fa-calendar"></i>

                        ${item.date || ""}

                    </span>

                </div>


                ${contactHTML}


                <div class="item-actions">


                    <button
                        class="action-btn edit-btn"
                        onclick="window.editItem('${item.id}')"
                    >

                        <i class="fa-solid fa-pen"></i>

                        Edit

                    </button>


                    ${returnedButton}


                    <button
                        class="action-btn delete-btn"
                        onclick="window.deleteItem('${item.id}')"
                    >

                        <i class="fa-solid fa-trash"></i>

                        Delete

                    </button>


                </div>


            </div>

        `;


        itemsContainer.appendChild(card);

    });

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;

}


// ==========================================
// CONVERT IMAGE TO BASE64
// ==========================================

function convertImageToBase64(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();


        reader.onload = () => {

            resolve(reader.result);

        };


        reader.onerror = error => {

            reject(error);

        };


        reader.readAsDataURL(file);

    });

}


// ==========================================
// SUBMIT ITEM FORM
// ==========================================

itemForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const submitBtn =
            document.getElementById("submitBtn");


        submitBtn.disabled = true;


        submitBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Saving...
        `;


        try {

            const name =
                document
                    .getElementById("itemName")
                    .value
                    .trim();


            const description =
                document
                    .getElementById("description")
                    .value
                    .trim();


            const category =
                document
                    .getElementById("category")
                    .value;


            const location =
                document
                    .getElementById("location")
                    .value
                    .trim();


            const date =
                document
                    .getElementById("date")
                    .value;


            const type =
                reportType.value;


            const contactName =
                document
                    .getElementById("contactName")
                    .value
                    .trim();


            const contactPhone =
                document
                    .getElementById("contactPhone")
                    .value
                    .trim();


            const contactEmail =
                document
                    .getElementById("contactEmail")
                    .value
                    .trim();


            let imageURL =
                currentImageURL;


            const file =
                imageInput.files[0];


            // Convert new image to Base64

            if (file) {

                imageURL =
                    await convertImageToBase64(file);

            }


            const existingItem =
                items.find(
                    item =>
                        item.id === editingItemId
                );


            const itemData = {

                name,

                description,

                category,

                location,

                date,

                contactName,

                contactPhone,

                contactEmail,

                status:
                    editingItemId

                        ? (
                            existingItem?.status ||
                            type
                        )

                        : type,

                imageURL,

                createdAt:
                    editingItemId

                        ? (
                            existingItem?.createdAt ||
                            Date.now()
                        )

                        : Date.now(),

                updatedAt:
                    Date.now()

            };


            // UPDATE EXISTING ITEM

            if (editingItemId) {

                await updateDoc(

                    doc(
                        db,
                        "items",
                        editingItemId
                    ),

                    itemData

                );


                showToast(
                    "Report updated successfully!"
                );

            }


            // ADD NEW ITEM

            else {

                await addDoc(

                    collection(
                        db,
                        "items"
                    ),

                    itemData

                );


                showToast(
                    "Report added successfully!"
                );

            }


            closeReportModal();

            await loadItems();

        }


        catch (error) {

            console.error(
                "Error saving item:",
                error
            );


            alert(
                "Something went wrong while saving the report."
            );

        }


        finally {

            submitBtn.disabled = false;


            submitBtn.innerHTML = `
                <i class="fa-solid fa-cloud-arrow-up"></i>
                Submit Report
            `;

        }

    }
);


// ==========================================
// SEARCH AND FILTER
// ==========================================

function filterItems() {

    const searchText =
        searchInput.value.toLowerCase();


    const selectedCategory =
        categoryFilter.value;


    const selectedStatus =
        statusFilter.value;


    const filteredItems =
        items.filter((item) => {


            const name =
                (item.name || "").toLowerCase();


            const description =
                (item.description || "").toLowerCase();


            const matchesSearch =

                name.includes(searchText)

                ||

                description.includes(searchText);


            const matchesCategory =

                selectedCategory === "all"

                ||

                item.category === selectedCategory;


            const matchesStatus =

                selectedStatus === "all"

                ||

                item.status === selectedStatus;


            return (

                matchesSearch

                &&

                matchesCategory

                &&

                matchesStatus

            );

        });


    displayItems(filteredItems);

}


searchInput.addEventListener(
    "input",
    filterItems
);


categoryFilter.addEventListener(
    "change",
    filterItems
);


statusFilter.addEventListener(
    "change",
    filterItems
);


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics() {

    const total =
        items.length;


    const lost =
        items.filter(
            item =>
                item.status === "Lost"
        ).length;


    const found =
        items.filter(
            item =>
                item.status === "Found"
        ).length;


    const returned =
        items.filter(
            item =>
                item.status === "Returned"
        ).length;


    document.getElementById("totalReports").textContent =
        total;


    document.getElementById("lostCount").textContent =
        lost;


    document.getElementById("foundCount").textContent =
        found;


    document.getElementById("returnedCount").textContent =
        returned;


    document.getElementById("heroTotal").textContent =
        total;


    document.getElementById("heroReturned").textContent =
        returned;

}


// ==========================================
// EDIT ITEM
// ==========================================

window.editItem = function (id) {

    const item =
        items.find(
            item =>
                item.id === id
        );


    if (!item) return;


    editingItemId = id;


    currentImageURL =
        item.imageURL || "";


    document.getElementById("itemName").value =
        item.name || "";


    document.getElementById("description").value =
        item.description || "";


    document.getElementById("category").value =
        item.category || "";


    document.getElementById("location").value =
        item.location || "";


    document.getElementById("date").value =
        item.date || "";


    document.getElementById("contactName").value =
        item.contactName || "";


    document.getElementById("contactPhone").value =
        item.contactPhone || "";


    document.getElementById("contactEmail").value =
        item.contactEmail || "";


    setReportType(

        item.status === "Returned"

            ? "Found"

            : item.status

    );


    if (item.imageURL) {

        imagePreview.src =
            item.imageURL;


        imagePreviewContainer.style.display =
            "block";

    }


    document.getElementById("modalTitle").textContent =
        "Edit Report";


    document.getElementById("submitBtn").innerHTML =
        `
        <i class="fa-solid fa-pen"></i>
        Update Report
        `;


    reportModal.style.display =
        "block";

};


// ==========================================
// DELETE ITEM
// ==========================================

window.deleteItem =
    async function (id) {

        const confirmDelete =
            confirm(
                "Are you sure you want to delete this report?"
            );


        if (!confirmDelete) return;


        try {

            await deleteDoc(

                doc(
                    db,
                    "items",
                    id
                )

            );


            showToast(
                "Report deleted successfully!"
            );


            await loadItems();

        }


        catch (error) {

            console.error(error);


            alert(
                "Could not delete the report."
            );

        }

    };


// ==========================================
// OPEN RETURN MODAL
// ==========================================

window.openReturnModal =
    function (id) {

        returningItemId = id;


        returnForm.reset();


        document.getElementById("returnDate").value =
            new Date()
                .toISOString()
                .split("T")[0];


        returnModal.style.display =
            "block";

    };


// ==========================================
// CLOSE RETURN MODAL
// ==========================================

function closeReturnModalFunction() {

    returnModal.style.display =
        "none";


    returnForm.reset();


    returningItemId = null;

}


closeReturnModal.addEventListener(
    "click",
    closeReturnModalFunction
);


// ==========================================
// SAVE RETURN RECORD
// ==========================================

returnForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (!returningItemId) return;


        const item =
            items.find(
                item =>
                    item.id === returningItemId
            );


        if (!item) return;


        try {

            const returnedToName =
                document
                    .getElementById("returnedToName")
                    .value
                    .trim();


            const returnedToPhone =
                document
                    .getElementById("returnedToPhone")
                    .value
                    .trim();


            const returnedToEmail =
                document
                    .getElementById("returnedToEmail")
                    .value
                    .trim();


            const returnDate =
                document
                    .getElementById("returnDate")
                    .value;


            const returnNotes =
                document
                    .getElementById("returnNotes")
                    .value
                    .trim();


            // Save permanent return record

            await addDoc(

                collection(
                    db,
                    "returnRecords"
                ),

                {

                    itemId: item.id,

                    itemName:
                        item.name,

                    category:
                        item.category,

                    originalContactName:
                        item.contactName || "",

                    originalContactPhone:
                        item.contactPhone || "",

                    originalContactEmail:
                        item.contactEmail || "",

                    returnedToName,

                    returnedToPhone,

                    returnedToEmail,

                    returnDate,

                    returnNotes,

                    status: "Returned",

                    createdAt:
                        Date.now()

                }

            );


            // Update item status

            await updateDoc(

                doc(
                    db,
                    "items",
                    returningItemId
                ),

                {

                    status:
                        "Returned",

                    returnedAt:
                        Date.now()

                }

            );


            closeReturnModalFunction();


            showToast(
                "Return record saved successfully!"
            );


            await loadItems();

            await loadReturnRecords();

        }


        catch (error) {

            console.error(
                "Return error:",
                error
            );


            alert(
                "Could not save the return record."
            );

        }

    }
);


// ==========================================
// LOAD RETURN RECORDS
// ==========================================

async function loadReturnRecords() {

    const recordsContainer =
        document.getElementById("recordsContainer");


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "returnRecords"
                )
            );


        returnRecords = [];


        snapshot.forEach((document) => {

            returnRecords.push({

                id: document.id,

                ...document.data()

            });

        });


        returnRecords.sort((a, b) => {

            return (
                (b.createdAt || 0) -
                (a.createdAt || 0)
            );

        });


        displayReturnRecords();

    }


    catch (error) {

        console.error(
            "Error loading return records:",
            error
        );


        recordsContainer.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="records-empty"
                >

                    No return records available.

                </td>

            </tr>

        `;

    }

}


// ==========================================
// DISPLAY RETURN RECORDS
// ==========================================

function displayReturnRecords() {

    const recordsContainer =
        document.getElementById("recordsContainer");


    recordsContainer.innerHTML = "";


    if (returnRecords.length === 0) {

        recordsContainer.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="records-empty"
                >

                    No items have been returned yet.

                </td>

            </tr>

        `;


        return;

    }


    returnRecords.forEach((record) => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>

                ${escapeHTML(record.itemName)}

            </td>


            <td>

                ${escapeHTML(record.category)}

            </td>


            <td>

                ${escapeHTML(record.returnedToName)}

            </td>


            <td>

                <div>
                    ${escapeHTML(record.returnedToPhone)}
                </div>

                <small>
                    ${escapeHTML(record.returnedToEmail)}
                </small>

            </td>


            <td>

                ${record.returnDate || ""}

            </td>


            <td>

                <span class="status status-returned">

                    Returned

                </span>

            </td>

        `;


        recordsContainer.appendChild(row);

    });

}


// ==========================================
// SUBMIT QUESTION
// ==========================================

queryForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const queryName =
            document
                .getElementById("queryName")
                .value
                .trim();


        const queryEmail =
            document
                .getElementById("queryEmail")
                .value
                .trim();


        const queryMessage =
            document
                .getElementById("queryMessage")
                .value
                .trim();


        try {

            await addDoc(

                collection(
                    db,
                    "queries"
                ),

                {

                    name:
                        queryName,

                    email:
                        queryEmail,

                    question:
                        queryMessage,

                    answer:
                        "",

                    status:
                        "Pending",

                    createdAt:
                        Date.now(),

                    answeredAt:
                        null

                }

            );


            queryForm.reset();


            showToast(
                "Your question has been submitted!"
            );


            await loadQuestions();

        }


        catch (error) {

            console.error(
                "Error submitting question:",
                error
            );


            alert(
                "Could not submit your question."
            );

        }

    }
);


// ==========================================
// LOAD QUESTIONS
// ==========================================

async function loadQuestions() {

    try {

        questionsContainer.innerHTML = `

            <div class="questions-loading">

                <i class="fa-solid fa-spinner fa-spin"></i>

                Loading questions...

            </div>

        `;


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "queries"
                )
            );


        questions = [];


        snapshot.forEach((document) => {

            questions.push({

                id: document.id,

                ...document.data()

            });

        });


        // Newest questions first

        questions.sort((a, b) => {

            return (
                (b.createdAt || 0) -
                (a.createdAt || 0)
            );

        });


        displayQuestions();

    }


    catch (error) {

        console.error(
            "Error loading questions:",
            error
        );


        questionsContainer.innerHTML = `

            <div class="questions-empty">

                No questions available yet.

            </div>

        `;

    }

}


// ==========================================
// DISPLAY QUESTIONS
// ==========================================

function displayQuestions() {

    questionsContainer.innerHTML = "";


    questionsCount.textContent =
        questions.length;


    if (questions.length === 0) {

        questionsContainer.innerHTML = `

            <div class="questions-empty">

                <i class="fa-solid fa-comments"></i>

                <h4>No Questions Yet</h4>

                <p>
                    Be the first person to ask a question!
                </p>

            </div>

        `;


        return;

    }


    questions.forEach((query) => {

        const isAnswered =
            query.status === "Answered";


        const questionCard =
            document.createElement("div");


        questionCard.className =
            "question-card";


        const answerHTML =
            isAnswered && query.answer

                ? `

                <div class="team-answer">

                    <div class="answer-title">

                        <i class="fa-solid fa-reply"></i>

                        <strong>
                            TraceLink Team Response
                        </strong>

                    </div>


                    <p>

                        ${escapeHTML(query.answer)}

                    </p>

                </div>

                `

                : `

                <div class="pending-answer">

                    <i class="fa-solid fa-clock"></i>

                    Waiting for a response from the team.

                </div>

                `;


        const answerButton =
            !isAnswered

                ? `

                <button
                    class="answer-question-btn"
                    onclick="window.openAnswerModal('${query.id}')"
                >

                    <i class="fa-solid fa-reply"></i>

                    Answer Question

                </button>

                `

                : `

                <button
                    class="answer-question-btn"
                    onclick="window.openAnswerModal('${query.id}')"
                >

                    <i class="fa-solid fa-pen"></i>

                    Edit Answer

                </button>

                `;


        questionCard.innerHTML = `


            <div class="question-top">


                <div class="question-user">

                    <div class="question-avatar">

                        <i class="fa-solid fa-user"></i>

                    </div>


                    <div>

                        <strong>

                            ${escapeHTML(query.name)}

                        </strong>


                        <small>

                            ${escapeHTML(query.email)}

                        </small>

                    </div>

                </div>


                <span class="question-status ${
                    isAnswered
                        ? "answered"
                        : "pending"
                }">

                    <i class="fa-solid ${
                        isAnswered
                            ? "fa-circle-check"
                            : "fa-clock"
                    }"></i>

                    ${isAnswered
                        ? "Answered"
                        : "Pending"
                    }

                </span>


            </div>



            <div class="question-content">

                <h4>

                    <i class="fa-solid fa-circle-question"></i>

                    Question

                </h4>


                <p>

                    ${escapeHTML(
                        query.question ||
                        query.message ||
                        query.queryMessage ||
                        "Question details are not available."
)}

                </p>

            </div>



            ${answerHTML}



            <div class="question-actions">

                ${answerButton}

            </div>


        `;


        questionsContainer.appendChild(
            questionCard
        );

    });

}


// ==========================================
// OPEN ANSWER MODAL
// ==========================================

window.openAnswerModal =
    function (id) {

        const query =
            questions.find(
                query =>
                    query.id === id
            );


        if (!query) return;


        answeringQueryId =
            id;


        answerQuestionPreview.innerHTML = `

            <strong>

                <i class="fa-solid fa-circle-question"></i>

                Question from ${escapeHTML(query.name)}

            </strong>


            <p>

                ${escapeHTML(
                    query.question ||
                    query.message ||
                    query.queryMessage ||
                    "Question details are not available."
                )}

            </p>

        `;


        answerMessage.value =
            query.answer || "";


        answerModal.style.display =
            "block";

    };


// ==========================================
// CLOSE ANSWER MODAL
// ==========================================

function closeAnswerModalFunction() {

    answerModal.style.display =
        "none";


    answerForm.reset();


    answeringQueryId =
        null;

}


closeAnswerModal.addEventListener(
    "click",
    closeAnswerModalFunction
);


// ==========================================
// SAVE ANSWER
// ==========================================

answerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (!answeringQueryId) return;


        const answer =
            answerMessage.value.trim();


        if (!answer) {

            alert(
                "Please write an answer first."
            );

            return;

        }


        try {

            await updateDoc(

                doc(
                    db,
                    "queries",
                    answeringQueryId
                ),

                {

                    answer:

                        answer,

                    status:

                        "Answered",

                    answeredAt:

                        Date.now()

                }

            );


            showToast(
                "Answer published successfully!"
            );


            closeAnswerModalFunction();


            await loadQuestions();

        }


        catch (error) {

            console.error(
                "Error saving answer:",
                error
            );


            alert(
                "Could not save the answer."
            );

        }

    }
);


// ==========================================
// IMAGE PREVIEW MODAL
// ==========================================

window.openImagePreview =
    function (imageURL) {

        fullImage.src =
            imageURL;


        imageModal.style.display =
            "flex";

    };


closeImageModal.addEventListener(
    "click",
    () => {

        imageModal.style.display =
            "none";

    }
);


imageModal.addEventListener(
    "click",
    (event) => {

        if (event.target === imageModal) {

            imageModal.style.display =
                "none";

        }

    }
);


// ==========================================
// LOAD APPLICATION
// ==========================================

loadItems();

loadReturnRecords();

loadQuestions();