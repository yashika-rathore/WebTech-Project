let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;

const taskForm = document.getElementById('taskForm');
const tasksList = document.getElementById('tasksList');
const xmlToggle = document.getElementById('xmlToggle');
const xmlPreview = document.getElementById('xmlPreview');
const xmlContent = document.getElementById('xmlContent');
const editModal = document.getElementById('editModal');

const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const taskPriority = document.getElementById('taskPriority');
const taskCategory = document.getElementById('taskCategory');
const taskDueDate = document.getElementById('taskDueDate');

const titleError = document.getElementById('titleError');
const dateError = document.getElementById('dateError');

const editTitle = document.getElementById('editTitle');
const editDescription = document.getElementById('editDescription');
const editPriority = document.getElementById('editPriority');
const editCategory = document.getElementById('editCategory');
const editDueDate = document.getElementById('editDueDate');
const saveEditBtn = document.getElementById('saveEdit');
const cancelEditBtn = document.getElementById('cancelEdit');

document.addEventListener('DOMContentLoaded', function() {
    loadTasksFromStorage();
    setupEventListeners();
    renderTasks();
});

function setupEventListeners() {
    taskForm.addEventListener('submit', handleAddTask);
    
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            currentFilter = this.getAttribute('data-filter');
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderTasks();
        });
    });
    
    xmlToggle.addEventListener('click', toggleXmlPreview);
    saveEditBtn.addEventListener('click', saveEditTask);
    cancelEditBtn.addEventListener('click', closeEditModal);
    
    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
}

function handleAddTask(e) {
    e.preventDefault();
    
    titleError.textContent = '';
    dateError.textContent = '';
    taskTitle.classList.remove('error');
    taskDueDate.classList.remove('error');
    
    if (!validateTask()) {
        return;
    }
    
    const task = {
        id: Date.now(),
        title: taskTitle.value.trim(),
        description: taskDescription.value.trim(),
        priority: taskPriority.value,
        category: taskCategory.value.trim(),
        dueDate: taskDueDate.value,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveTasksToStorage();
    taskForm.reset();
    renderTasks();
}

function loadTasksFromStorage() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}

function saveTasksToStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    editingTaskId = taskId;
    editTitle.value = task.title;
    editDescription.value = task.description;
    editPriority.value = task.priority;
    editCategory.value = task.category;
    editDueDate.value = task.dueDate;
    
    editModal.classList.add('show');
}

function saveEditTask() {
    const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
    if (taskIndex === -1) return;
    
    if (!editTitle.value.trim()) {
        alert('Task title is required!');
        return;
    }
    
    tasks[taskIndex] = {
        ...tasks[taskIndex],
        title: editTitle.value.trim(),
        description: editDescription.value.trim(),
        priority: editPriority.value,
        category: editCategory.value.trim(),
        dueDate: editDueDate.value
    };
    
    saveTasksToStorage();
    closeEditModal();
    renderTasks();
}

function closeEditModal() {
    editModal.classList.remove('show');
    editingTaskId = null;
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasksToStorage();
        renderTasks();
    }
}

function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasksToStorage();
        renderTasks();
    }
}

function validateTask() {
    let isValid = true;
    
    if (!taskTitle.value.trim()) {
        titleError.textContent = 'Task title is required';
        taskTitle.classList.add('error');
        isValid = false;
    } else if (taskTitle.value.length > 100) {
        titleError.textContent = 'Title should not exceed 100 characters';
        taskTitle.classList.add('error');
        isValid = false;
    }
    
    if (taskDueDate.value) {
        const selectedDate = new Date(taskDueDate.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            dateError.textContent = 'Due date cannot be in the past';
            taskDueDate.classList.add('error');
            isValid = false;
        }
    }
    
    return isValid;
}

function renderTasks() {
    let filteredTasks = tasks;
    if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    } else if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(t => !t.completed);
    }
    
    document.getElementById('countAll').textContent = `(${tasks.length})`;
    document.getElementById('countPending').textContent = `(${tasks.filter(t => !t.completed).length})`;
    document.getElementById('countCompleted').textContent = `(${tasks.filter(t => t.completed).length})`;
    
    tasksList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <p>No tasks found. Add your first task above!</p>
            </div>
        `;
        return;
    }
    
    filteredTasks.forEach(task => {
        const taskCard = createTaskCard(task);
        tasksList.appendChild(taskCard);
    });
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card priority-${task.priority} ${task.completed ? 'completed' : ''}`;
    
    card.innerHTML = `
        <div class="task-header">
            <div class="task-content">
                <div class="task-title-row">
                    <button class="checkbox-btn" onclick="toggleTaskComplete(${task.id})">
                        ${task.completed ? '[Done]' : '[Pending]'}
                    </button>
                    <h3 class="task-title ${task.completed ? 'completed' : ''}">${task.title}</h3>
                </div>
                
                ${task.description ? `
                    <p class="task-description">${task.description}</p>
                ` : ''}
                
                <div class="task-meta">
                    ${task.category ? `
                        <span class="task-badge badge-category">
                            Category: ${task.category}
                        </span>
                    ` : ''}
                    
                    ${task.dueDate ? `
                        <span class="task-badge badge-date">
                            Due: ${formatDate(task.dueDate)}
                        </span>
                    ` : ''}
                </div>
            </div>
            
            <div class="task-actions">
                <button class="action-btn edit-btn" onclick="openEditModal(${task.id})">
                    Edit
                </button>
                <button class="action-btn delete-btn" onclick="deleteTask(${task.id})">
                    Delete
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function toggleXmlPreview() {
    if (xmlPreview.style.display === 'none') {
        xmlContent.textContent = generateXML();
        xmlPreview.style.display = 'block';
        xmlToggle.textContent = 'Hide XML';
    } else {
        xmlPreview.style.display = 'none';
        xmlToggle.textContent = 'Show XML';
    }
}

function generateXML() {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<tasks>\n';
    
    tasks.forEach(task => {
        xml += '  <task>\n';
        xml += `    <id>${task.id}</id>\n`;
        xml += `    <title>${escapeXml(task.title)}</title>\n`;
        xml += `    <description>${escapeXml(task.description)}</description>\n`;
        xml += `    <priority>${task.priority}</priority>\n`;
        xml += `    <category>${escapeXml(task.category)}</category>\n`;
        xml += `    <dueDate>${task.dueDate || ''}</dueDate>\n`;
        xml += `    <completed>${task.completed}</completed>\n`;
        xml += `    <createdAt>${task.createdAt}</createdAt>\n`;
        xml += '  </task>\n';
    });
    
    xml += '</tasks>';
    return xml;
}

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}
