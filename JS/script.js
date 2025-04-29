// DOM Elements
const list = document.getElementById("list");
const addBtn = document.getElementById("addBtn");
const userInput = document.getElementById("inputBox");
const deadlineInput = document.querySelector("#deadlineInput");
const chapterCount = document.getElementById("chapterCount");

// State management
let editing = false;

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  displayChapters();
  updateChapterCount();
});

addBtn.addEventListener("click", addChapter);
userInput.addEventListener("keydown", keyboardEvent);

// Helper Functions
function keyboardEvent(event) {
    if (event.key === "Enter") {
      addChapter();
    }
  }

function getDeadlineStatus(inputDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inputDate = new Date(inputDateStr);
  inputDate.setHours(0, 0, 0, 0);

  if (inputDate < today) {
    return "text-danger"; // Past deadline
  } else if (inputDate.getTime() === today.getTime()) {
    return "text-warning"; // Due today
  } else {
    return "text-success"; // Future deadline
  }
}

function checkEmpty() {
  if (list.children.length <= 0) {
    let listItem = document.createElement("li");
    listItem.className = "list-group-item emptyListItem d-flex justify-content-center align-items-center py-4";
    listItem.innerHTML = `<p class="mb-0 text-center fs-5">Nothing in the list. Please add some chapters!</p>`;
    list.appendChild(listItem);
  }
}

function updateChapterCount() {
  const chaptersArray = JSON.parse(localStorage.getItem("chapters")) ?? [];
  chapterCount.textContent = chaptersArray.length;
}

// Core CRUD Functions
function addChapter(e) {
  // Remove empty list message if present
  if (list.children.length > 0 && list.children[0].classList.contains("emptyListItem")) {
    list.children[0].remove();
  }

  // Get input values
  const inputText = userInput.value.trim();
  const lastDate = deadlineInput.value;

  //for comparison
  const date = new Date(lastDate);
  date.setHours(0, 0, 0, 0);
  console.log(typeof(date));

  //today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  console.log(typeof(today));

  // Validate inputs
  if (!inputText) {
    alert("Please enter chapter name before adding!");
    checkEmpty();
    return;
  }
  
  if (!lastDate) {
    alert("Please enter chapter deadline before adding!");
    checkEmpty();
    return; 
  } else if(date < today){
    alert("Please enter a chapter deadline that is coming!");
    checkEmpty();
    return;
  }

  // Retrieve and update chapters in localStorage
  let chaptersArray = JSON.parse(localStorage.getItem("chapters")) ?? [];
  
  chaptersArray.push({
    title: inputText,
    date: lastDate,
    completed: false,
  });

  localStorage.setItem("chapters", JSON.stringify(chaptersArray));

  // Update UI
  displayChapters();
  updateChapterCount();
  
  // Reset form
  userInput.value = "";
  deadlineInput.value = "";
  userInput.focus();
  
  // Prevent form submission if function called from event
  if (e) e.preventDefault();
}

function removeChapter(index) {
  if (confirm("Are you sure you want to remove this chapter?")) {
    let chaptersArray = JSON.parse(localStorage.getItem("chapters")) ?? [];
    chaptersArray.splice(index, 1);
    localStorage.setItem("chapters", JSON.stringify(chaptersArray));
    
    displayChapters();
    updateChapterCount();
    checkEmpty();
  }
}

function editChapter(index, element) {
  if (editing) return; // Prevent multiple edit operations
  
  editing = true;

  const buttonBlock = element.parentNode;
  const listItem = buttonBlock.parentNode;
  const deadlineBlock = listItem.nextElementSibling;
  const children = listItem.children;
  
  // Get current chapter data
  let chaptersArray = JSON.parse(localStorage.getItem("chapters")) ?? [];
  let targetedChapter = chaptersArray[index];
  let currentText = targetedChapter.title;

  // Hide existing elements
  for (let child of children) {
    child.classList.add("d-none", "d-md-none");
  }
  
  let deadline = deadlineBlock.querySelector("#deadLineOutput");
  deadline.classList.add("d-none");

  // Create edit input for title
  const input = document.createElement("input");
  input.type = "text";
  input.className = "form-control me-2";
  input.value = currentText;
  listItem.appendChild(input);
  input.focus();

  // Create save button
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.className = "btn btn-success btn-sm text-nowrap ms-auto align-self-canter";
  listItem.appendChild(saveBtn);

  // Create cancel button
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.className = "btn btn-secondary btn-sm text-nowrap align-self-canter";
  listItem.appendChild(cancelBtn);

  // Create deadline edit input
  const deadlineUpdateInput = document.createElement("input");
  deadlineUpdateInput.type = "date";
  deadlineUpdateInput.className = "form-control border-0";
  deadlineUpdateInput.value = targetedChapter.date;
  deadlineBlock.appendChild(deadlineUpdateInput);

  // Style adjustments
  deadlineBlock.firstElementChild.classList.add("text-nowrap");
  deadlineBlock.classList.add("pt-2");

  // Save function for edit operation
  function saveEdits() {
    const newText = input.value.trim();
    const newDeadline = deadlineUpdateInput.value;
    
    if (!newText) {
      alert("Chapter name cannot be empty");
      return;
    }
    
    if (!newDeadline) {
      alert("Please set a deadline");
      return;
    }

    // Update chapter object
    Object.assign(targetedChapter, {
      title: newText,
      date: newDeadline,
      completed: targetedChapter.completed
    });

    chaptersArray[index] = targetedChapter;
    localStorage.setItem("chapters", JSON.stringify(chaptersArray));

    cleanupEditMode();
    displayChapters();
  }
  
  function cancelEdit() {
    cleanupEditMode();
    displayChapters();
  }
  
  function cleanupEditMode() {
    // Clean up edit interface
    input.remove();
    saveBtn.remove();
    cancelBtn.remove();
    deadlineUpdateInput.remove();
    
    for (const child of children) {
      child.classList.remove("d-none");
    }
    
    if (deadline) {
      deadline.classList.remove("d-none");
    }

    editing = false;
  }

  // Event listeners for save operation
  saveBtn.addEventListener("click", saveEdits);
  cancelBtn.addEventListener("click", cancelEdit);
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      saveEdits();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  });
}

function toggleCheckBox(index, e) {
  const checkbox = e.target;
  let chaptersArray = JSON.parse(localStorage.getItem("chapters")) ?? [];
  let targetedChapter = chaptersArray[index];
  
  targetedChapter.completed = checkbox.checked;
  localStorage.setItem("chapters", JSON.stringify(chaptersArray));
  
  displayChapters();
}

// Drag and Drop Implementation
function enableDrag() {
  const draggables = document.querySelectorAll("#list > li:not(.emptyListItem)");
  
  draggables.forEach(draggable => {
    draggable.addEventListener("dragstart", () => {
      draggable.classList.add("dragging");
    });

    draggable.addEventListener("dragend", () => {
      draggable.classList.remove("dragging");
      updateStorageAfterDrag();
    });
  });

  list.addEventListener("dragover", e => {
    e.preventDefault();
    const dragItem = list.querySelector(".dragging");
    if (!dragItem) return;
    
    const siblings = [...list.querySelectorAll("#list > li:not(.dragging):not(.emptyListItem)")];
    
    // If there are no siblings (other than the dragging item), just return
    if (siblings.length === 0) return;
    
    // Get the next sibling based on position
    const nextSibling = getNextSibling(siblings, e.clientY);
    
    // Insert before the next sibling (or at the end if nextSibling is null)
    list.insertBefore(dragItem, nextSibling);
  });
  
  list.addEventListener("dragenter", e => {
    e.preventDefault();
  });
}

// Helper function to find the next sibling based on mouse position
function getNextSibling(siblings, mouseY) {
  // Handle case when mouse is above all items
  if (siblings.length > 0 && mouseY < siblings[0].getBoundingClientRect().top) {
    return siblings[0]; // Return the first sibling if mouse is above all items
  }
  
  // Otherwise, find the appropriate sibling based on mouse position
  return siblings.find(sibling => {
    const box = sibling.getBoundingClientRect();
    const midPoint = box.top + box.height / 2;
    return mouseY <= midPoint;
  });
}

function updateStorageAfterDrag() {
  // Skip if list is empty
  if (list.querySelector('.emptyListItem')) return;
  
  const listItems = list.querySelectorAll('li:not(.emptyListItem)');
  let chaptersArray = JSON.parse(localStorage.getItem("chapters")) ?? [];
  let reorderedChapters = [];
  
  // Create new array based on current DOM order
  listItems.forEach(item => {
    const originalIndex = parseInt(item.getAttribute('data-index'));
    if (!isNaN(originalIndex) && chaptersArray[originalIndex]) {
      reorderedChapters.push(chaptersArray[originalIndex]);
    }
  });
  
  // Save reordered chapters
  localStorage.setItem("chapters", JSON.stringify(reorderedChapters));
  
  // Update DOM to reflect new order
  updateDomAfterDrag(reorderedChapters);
}

function updateDomAfterDrag(chaptersArray) {
  const listItems = list.querySelectorAll('li:not(.emptyListItem)');
  
  // Update indices in DOM elements
  listItems.forEach((item, newIndex) => {
    item.setAttribute('data-index', newIndex);
    
    const editBtn = item.querySelector('.editBtn');
    const removeBtn = item.querySelector('.removeBtn');
    const checkbox = item.querySelector('.form-check-input');
    
    if (editBtn) {
      editBtn.setAttribute('onclick', `editChapter(${newIndex}, this)`);
    }
    
    if (removeBtn) {
      removeBtn.setAttribute('onclick', `removeChapter(${newIndex})`);
    }
    
    if (checkbox) {
      checkbox.setAttribute('onclick', `toggleCheckBox(${newIndex}, event)`);
    }
  });
}

// Display chapters from localStorage
function displayChapters() {
  let chaptersArray = JSON.parse(localStorage.getItem("chapters")) ?? [];
  let finalChapters = "";

  chaptersArray.forEach((element, index) => {
    const isChecked = element.completed ? "checked" : "";
    const titleClass = element.completed ? "text-success text-decoration-line-through" : "";
    let dateColor = element.completed ? "text-success" : getDeadlineStatus(element.date);
    let dateDisplay = element.completed ? "Chapter Completed 😊" : formatDate(element.date);

    finalChapters += `
      <li class="list-group-item" draggable="true" style="cursor: move;" data-index="${index}">
        <div class="d-flex justify-content-between pb-2 gap-3">
          <input class="form-check-input fs-5 fs-sm-4" type="checkbox" ${isChecked}
          onclick="toggleCheckBox(${index}, event)">
          <h3 class="flex-sm-grow-1 order-md-0 order-1 fs-5 ${titleClass}">${element.title}</h3>
          <div class="d-md-inline-flex flex-md-column d-flex gap-2 align-self-start">
          <button type="button" class="editBtn btn btn-sm btn-warning "
            onclick="editChapter(${index}, this)">Edit</button>
          <button type="button" class="removeBtn btn btn-danger btn-sm"
            onclick="removeChapter(${index})">Remove</button>
          </div>
        </div>
        <div class="d-flex align-items-center justify-content-start gap-2 gap-sm-3 mt-2">
          <label for="deadLineOutput" class="form-label text-start mb-0">Chapter Deadline:</label>
          <p class="mb-0 ${dateColor}" id="deadLineOutput" name="deadLineOutput">${dateDisplay}</p>
        </div>
      </li>
    `;
  });

  list.innerHTML = finalChapters;
  checkEmpty();
  enableDrag();
}

// Format date in a more readable way
function formatDate(dateString) {
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}