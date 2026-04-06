const tbody = document.getElementById("inventory-body");
const loading = document.getElementById("loading");
const emptyState = document.getElementById("empty-state");
const errorState = document.getElementById("error-state");
const recordCount = document.getElementById("record-count");
const table = document.getElementById("inventory-table");

// Modal elements
const modalOverlay = document.getElementById("modal-overlay");
const modalTitle = document.getElementById("modal-title");
const recordForm = document.getElementById("record-form");
const formId = document.getElementById("form-id");
const formProductName = document.getElementById("form-product-name");
const formCategory = document.getElementById("form-category");
const formQuantity = document.getElementById("form-quantity");
const formPrice = document.getElementById("form-price");
const formSupplier = document.getElementById("form-supplier");

// Delete modal elements
const deleteOverlay = document.getElementById("delete-overlay");
const deleteMessage = document.getElementById("delete-message");
const deleteConfirm = document.getElementById("delete-confirm");

let deleteTargetId = null;

function formatPrice(value) {
    return "$" + Number(value).toFixed(2);
}

function renderTable(records) {
    loading.classList.add("hidden");

    if (records.length === 0) {
        table.classList.add("hidden");
        emptyState.classList.remove("hidden");
        recordCount.textContent = "";
        return;
    }

    table.classList.remove("hidden");
    emptyState.classList.add("hidden");
    recordCount.textContent = records.length + " record" + (records.length !== 1 ? "s" : "");

    tbody.innerHTML = "";
    for (const r of records) {
        const tr = document.createElement("tr");
        tr.innerHTML =
            "<td class='numeric'>" + r.id + "</td>" +
            "<td>" + escapeHtml(r.product_name) + "</td>" +
            "<td>" + escapeHtml(r.category) + "</td>" +
            "<td class='numeric'>" + r.quantity + "</td>" +
            "<td class='numeric'>" + formatPrice(r.price) + "</td>" +
            "<td>" + escapeHtml(r.supplier || "") + "</td>" +
            "<td class='actions'>" +
                "<button class='btn btn-secondary btn-sm edit-btn' data-id='" + r.id + "'>Edit</button>" +
                "<button class='btn btn-danger btn-sm delete-btn' data-id='" + r.id + "'>Delete</button>" +
            "</td>";
        tbody.appendChild(tr);
    }
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    loading.classList.add("hidden");
    table.classList.add("hidden");
    emptyState.classList.add("hidden");
    errorState.textContent = message;
    errorState.classList.remove("hidden");
}

async function loadInventory() {
    try {
        const res = await fetch("/inventory");
        if (!res.ok) throw new Error("Server returned " + res.status);
        const data = await res.json();
        renderTable(data);
    } catch (err) {
        showError("Failed to load inventory: " + err.message);
    }
}

// --- Modal helpers ---

function openModal(title, record) {
    modalTitle.textContent = title;
    formId.value = record ? record.id : "";
    formProductName.value = record ? record.product_name : "";
    formCategory.value = record ? record.category : "";
    formQuantity.value = record ? record.quantity : "";
    formPrice.value = record ? record.price : "";
    formSupplier.value = record ? (record.supplier || "") : "";
    modalOverlay.classList.remove("hidden");
    formProductName.focus();
}

function closeModal() {
    modalOverlay.classList.add("hidden");
    recordForm.reset();
}

function openDeleteModal(id) {
    deleteTargetId = id;
    deleteMessage.textContent = "Are you sure you want to delete record #" + id + "?";
    deleteOverlay.classList.remove("hidden");
}

function closeDeleteModal() {
    deleteOverlay.classList.add("hidden");
    deleteTargetId = null;
}

// --- Event listeners ---

document.getElementById("add-btn").addEventListener("click", function () {
    openModal("New Record", null);
});

document.getElementById("modal-close").addEventListener("click", closeModal);
document.getElementById("modal-cancel").addEventListener("click", closeModal);

modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) closeModal();
});

recordForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const record = {
        product_name: formProductName.value.trim(),
        category: formCategory.value.trim(),
        quantity: parseInt(formQuantity.value, 10),
        price: parseFloat(formPrice.value),
        supplier: formSupplier.value.trim() || null,
    };
    const id = formId.value;

    if (id) {
        // TODO: PUT /inventory/{id} endpoint
        alert("Update endpoint not yet implemented.");
    } else {
        // TODO: POST /inventory endpoint
        alert("Create endpoint not yet implemented.");
    }
    closeModal();
});

document.getElementById("delete-close").addEventListener("click", closeDeleteModal);
document.getElementById("delete-cancel").addEventListener("click", closeDeleteModal);

deleteOverlay.addEventListener("click", function (e) {
    if (e.target === deleteOverlay) closeDeleteModal();
});

deleteConfirm.addEventListener("click", async function () {
    if (deleteTargetId !== null) {
        try {
            await fetch("/inventory/" + deleteTargetId, { method: "DELETE" });
            closeDeleteModal();
            loadInventory();
        } catch (err) {
            alert("Error deleting record: " + err.message);
            closeDeleteModal();
        }
        return;
    }
    closeDeleteModal();
});

// Delegate edit/delete clicks on table rows
tbody.addEventListener("click", function (e) {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = parseInt(btn.dataset.id, 10);
    const row = btn.closest("tr");
    const cells = row.querySelectorAll("td");

    if (btn.classList.contains("edit-btn")) {
        openModal("Edit Record #" + id, {
            id: id,
            product_name: cells[1].textContent,
            category: cells[2].textContent,
            quantity: parseInt(cells[3].textContent, 10),
            price: parseFloat(cells[4].textContent.replace("$", "")),
            supplier: cells[5].textContent,
        });
    } else if (btn.classList.contains("delete-btn")) {
        openDeleteModal(id);
    }
});

// Load on page start
loadInventory();
