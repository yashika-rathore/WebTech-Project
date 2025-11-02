const taskForm = document.getElementById('taskForm');
const tasksList = document.getElementById('tasksList');
const firstButton = document.querySelector('.btn-primary');
const filterButtons = document.querySelectorAll('.filter-btn');

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    return card;
}

function addTextToElement(element, text) {
    const textNode = document.createTextNode(text);
    element.appendChild(textNode);
}

function renderEmptyState() {
    tasksList.innerHTML = `
        <div class="empty-state">
            <p>No tasks found. Add your first task above!</p>
        </div>
    `;
}

function updateTaskTitle(element, title) {
    element.textContent = title;
}

function appendTaskToList(taskCard) {
    tasksList.appendChild(taskCard);
}

function removeTaskFromList(taskCard) {
    tasksList.removeChild(taskCard);
}

function replaceTask(newCard, oldCard) {
    tasksList.replaceChild(newCard, oldCard);
}

function insertTaskAtTop(taskCard) {
    const firstTask = tasksList.firstChild;
    tasksList.insertBefore(taskCard, firstTask);
}

function setDataAttribute(element, taskId) {
    element.setAttribute('data-task-id', taskId);
}

function getTaskId(element) {
    return element.getAttribute('data-task-id');
}

function removeDataAttribute(element) {
    element.removeAttribute('data-task-id');
}

function toggleTaskCompletion(element) {
    element.classList.toggle('completed');
    element.classList.add('updated');
    element.classList.remove('pending');
    if (element.classList.contains('completed')) {
        console.log('Task is completed');
    }
}

function hideElement(element) {
    element.style.display = 'none';
}

function showElement(element) {
    element.style.display = 'block';
}

function changeElementColor(element, color) {
    element.style.backgroundColor = color;
    element.style.color = '#fff';
}

function setupFormSubmission() {
    taskForm.addEventListener('submit', function(event) {
        event.preventDefault();
        handleAddTask();
    });
}

function setupButtonEvents() {
    const deleteBtn = document.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', handleDelete);
    deleteBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
    });
    deleteBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
}

function setupEventDelegation() {
    tasksList.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-btn')) {
            const taskId = event.target.closest('.task-card').dataset.taskId;
            deleteTask(taskId);
        }
        if (event.target.classList.contains('edit-btn')) {
            const taskId = event.target.closest('.task-card').dataset.taskId;
            openEditModal(taskId);
        }
    });
}

function getTaskCardFromButton(button) {
    return button.parentElement.parentElement;
}

function getAllTaskCards() {
    return tasksList.children;
}

function getFirstTask() {
    return tasksList.firstElementChild;
}

function getLastTask() {
    return tasksList.lastElementChild;
}

function getNextTask(currentTask) {
    return currentTask.nextElementSibling;
}

function getTaskCardFromAnyChild(element) {
    return element.closest('.task-card');
}

function getFormValues() {
    return {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        priority: document.getElementById('taskPriority').value,
        category: document.getElementById('taskCategory').value,
        dueDate: document.getElementById('taskDueDate').value
    };
}

function isTaskCompleted(checkbox) {
    return checkbox.checked;
}

function disableSubmitButton() {
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
}

function createCompleteTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card priority-${task.priority}`;
    card.setAttribute('data-task-id', task.id);
    const header = document.createElement('div');
    header.className = 'task-header';
    const title = document.createElement('h3');
    title.className = 'task-title';
    title.textContent = task.title;
    const description = document.createElement('p');
    description.className = 'task-description';
    description.textContent = task.description;
    header.appendChild(title);
    card.appendChild(header);
    card.appendChild(description);
    return card;
}

function validateFormInputs() {
    const titleInput = document.getElementById('taskTitle');
    const errorSpan = document.getElementById('titleError');
    if (titleInput.value.trim() === '') {
        errorSpan.textContent = 'Task title is required';
        errorSpan.style.display = 'block';
        titleInput.classList.add('error');
        return false;
    } else {
        errorSpan.textContent = '';
        errorSpan.style.display = 'none';
        titleInput.classList.remove('error');
        return true;
    }
}

function filterTasksByStatus(status) {
    const allTasks = tasksList.querySelectorAll('.task-card');
    allTasks.forEach(task => {
        if (status === 'all') {
            task.style.display = 'block';
        } else if (status === 'completed') {
            if (task.classList.contains('completed')) {
                task.style.display = 'block';
            } else {
                task.style.display = 'none';
            }
        } else if (status === 'pending') {
            if (!task.classList.contains('completed')) {
                task.style.display = 'block';
            } else {
                task.style.display = 'none';
            }
        }
    });
}

function updateTaskCounters() {
    const allTasks = document.querySelectorAll('.task-card');
    const completedTasks = document.querySelectorAll('.task-card.completed');
    const pendingTasks = allTasks.length - completedTasks.length;
    document.getElementById('countAll').textContent = `(${allTasks.length})`;
    document.getElementById('countCompleted').textContent = `(${completedTasks.length})`;
    document.getElementById('countPending').textContent = `(${pendingTasks})`;
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM is ready!');
    initializeApp();
});

function initializeApp() {
    setupFormSubmission();
    setupEventDelegation();
    loadTasksFromStorage();
    renderAllTasks();
}
