import {
    db,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
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
// APPLICATION DATA
// ==========================================

let items = [];

let editingItemId = null;

let currentImageURL = "";

let currentImagePath = "";


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
// OPEN MODAL
// ==========================================

function openModal(type = "Lost") {

    reportModal.style.display = "block";

    setReportType(type);

}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeReportModal() {

    reportModal.style.display = "none";

    itemForm.reset();

    editingItemId = null;

    currentImageURL = "";

    currentImagePath = "";

    imagePreviewContainer.style.display = "none";

    document.getElementById("modalTitle").textContent =
        "Report an Item";

    document.getElementById("submitBtn").innerHTML =
        `<i class="fa-solid fa-cloud-arrow-up"></i>
         Submit Report`;

}


// ==========================================
// MODAL BUTTON EVENTS
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


closeModal.addEventListener("click", closeReportModal);


// Close modal when clicking outside

window.addEventListener("click", (event) => {

    if (event.target === reportModal) {

        closeReportModal();

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

    } else {

        foundTypeBtn.classList.add("active-type");

    }

}


// Report type buttons

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


        // Newest reports first

        items.sort((a, b) => {

            const timeA = a.createdAt || 0;
            const timeB = b.createdAt || 0;

            return timeB - timeA;

        });


        displayItems(items);

        updateStatistics();

    } catch (error) {

        console.error("Error loading items:", error);

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

        const statusClass =
            `status-${item.status.toLowerCase()}`;


        const imageHTML = item.imageURL
            ? `
                <div class="item-image"
                    onclick="window.openImagePreview('${item.imageURL}')">

                    <img
                        src="${item.imageURL}"
                        alt="${item.name}"
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
            item.status !== "Returned"
                ? `
                    <button
                        class="action-btn return-btn"
                        onclick="window.markReturned('${item.id}')"
                    >
                        <i class="fa-solid fa-check"></i>
                        Returned
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
                        ${item.status}
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
                        ${item.date}
                    </span>

                </div>


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

    const div = document.createElement("div");

    div.textContent = text || "";

    return div.innerHTML;

}


// ==========================================
// SUBMIT FORM
// ==========================================

itemForm.addEventListener("submit", async (event) => {

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
            document.getElementById("itemName").value.trim();

        const description =
            document.getElementById("description").value.trim();

        const category =
            document.getElementById("category").value;

        const location =
            document.getElementById("location").value.trim();

        const date =
            document.getElementById("date").value;

        const type =
            reportType.value;


        let imageURL = currentImageURL;

        let imagePath = currentImagePath;


        // Upload image if selected

        // Save image locally as Base64 for prototype

const file = imageInput.files[0];

if (file) {

    imageURL = await new Promise((resolve) => {

        const reader = new FileReader();

        reader.onload = function (event) {
            resolve(event.target.result);
        };

        reader.readAsDataURL(file);

    });

    imagePath = "";

}


        const itemData = {

            name: name,

            description: description,

            category: category,

            location: location,

            date: date,

            status: editingItemId
                ? (items.find(item =>
                    item.id === editingItemId)?.status || type)
                : type,

            imageURL: imageURL,

            imagePath: imagePath,

            createdAt: editingItemId
                ? (items.find(item =>
                    item.id === editingItemId)?.createdAt || Date.now())
                : Date.now()

        };


        // EDIT EXISTING ITEM

        if (editingItemId) {

            await updateDoc(

                doc(db, "items", editingItemId),

                itemData

            );

            showToast("Report updated successfully!");

        }

        // ADD NEW ITEM

        else {

            await addDoc(

                collection(db, "items"),

                itemData

            );

            showToast("Report added successfully!");

        }


        closeReportModal();

        await loadItems();

    }

    catch (error) {

        console.error("Error saving item:", error);

        alert(
            "Something went wrong. Please check Firebase configuration."
        );

    }

    finally {

        submitBtn.disabled = false;

        submitBtn.innerHTML = `
            <i class="fa-solid fa-cloud-arrow-up"></i>
            Submit Report
        `;

    }

});


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


    const filteredItems = items.filter((item) => {

        const matchesSearch =

            item.name.toLowerCase()
                .includes(searchText)

            ||

            item.description.toLowerCase()
                .includes(searchText);


        const matchesCategory =

            selectedCategory === "all"

            ||

            item.category === selectedCategory;


        const matchesStatus =

            selectedStatus === "all"

            ||

            item.status === selectedStatus;


        return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus
);

    });


    displayItems(filteredItems);

}


searchInput.addEventListener("input", filterItems);

categoryFilter.addEventListener("change", filterItems);

statusFilter.addEventListener("change", filterItems);


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics() {

    const total = items.length;

    const lost =
        items.filter(item =>
            item.status === "Lost"
        ).length;

    const found =
        items.filter(item =>
            item.status === "Found"
        ).length;

    const returned =
        items.filter(item =>
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
        items.find(item => item.id === id);

    if (!item) return;


    editingItemId = id;

    currentImageURL = item.imageURL || "";

    currentImagePath = item.imagePath || "";


    document.getElementById("itemName").value =
        item.name;

    document.getElementById("description").value =
        item.description;

    document.getElementById("category").value =
        item.category;

    document.getElementById("location").value =
        item.location;

    document.getElementById("date").value =
        item.date;


    setReportType(
        item.status === "Returned"
            ? "Found"
            : item.status
    );


    if (item.imageURL) {

        imagePreview.src = item.imageURL;

        imagePreviewContainer.style.display = "block";

    }


    document.getElementById("modalTitle").textContent =
        "Edit Report";


    document.getElementById("submitBtn").innerHTML =
        `<i class="fa-solid fa-pen"></i>
         Update Report`;


    reportModal.style.display = "block";

};


// ==========================================
// MARK AS RETURNED
// ==========================================

window.markReturned = async function (id) {

    const confirmReturn =
        confirm(
            "Are you sure this item has been returned?"
        );


    if (!confirmReturn) return;


    try {

        await updateDoc(

            doc(db, "items", id),

            {
                status: "Returned"
            }

        );


        showToast("Item marked as returned!");

        await loadItems();

    }

    catch (error) {

        console.error(error);

        alert("Could not update the item.");

    }

};


// ==========================================
// DELETE ITEM
// ==========================================

window.deleteItem = async function (id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this report?"
        );


    if (!confirmDelete) return;


    try {

        const item =
            items.find(item => item.id === id);


        // Delete image from Firebase Storage

        if (item && item.imagePath) {

            try {

                const imageReference =
                    ref(storage, item.imagePath);

                await deleteObject(imageReference);

            }

            catch (imageError) {

                console.log(
                    "Image could not be deleted:",
                    imageError
                );

            }

        }


        // Delete Firestore document

        await deleteDoc(

            doc(db, "items", id)

        );


        showToast("Report deleted successfully!");

        await loadItems();

    }

    catch (error) {

        console.error(error);

        alert("Could not delete the report.");

    }

};


// ==========================================
// IMAGE PREVIEW MODAL
// ==========================================

window.openImagePreview = function (imageURL) {

    fullImage.src = imageURL;

    imageModal.style.display = "flex";

};


closeImageModal.addEventListener("click", () => {

    imageModal.style.display = "none";

});


imageModal.addEventListener("click", (event) => {

    if (event.target === imageModal) {

        imageModal.style.display = "none";

    }

});


// ==========================================
// LOAD APPLICATION
// ==========================================

loadItems();