function validateTitle(title) {
    const errors = [];
    if (!title || title.trim() === '') {
        errors.push('Task title is required');
        return { valid: false, errors: errors };
    }
    if (title.length > 100) errors.push('Title should not exceed 100 characters');
    if (title.trim().length < 3) errors.push('Title should be at least 3 characters long');
    return { valid: errors.length === 0, errors: errors };
}

function validateDescription(description) {
    const errors = [];
    if (description && description.length > 500) errors.push('Description should not exceed 500 characters');
    return { valid: errors.length === 0, errors: errors };
}

function validateDueDate(dateString) {
    const errors = [];
    if (!dateString) return { valid: true, errors: [] };
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        errors.push('Invalid date format');
        return { valid: false, errors: errors };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    if (date < today) errors.push('Due date cannot be in the past');
    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
    if (date > twoYearsFromNow) errors.push('Due date should be within 2 years');
    return { valid: errors.length === 0, errors: errors };
}

function validatePriority(priority) {
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority))
        return { valid: false, errors: ['Priority must be low, medium, or high'] };
    return { valid: true, errors: [] };
}

function validateCategory(category) {
    const errors = [];
    if (!category || category.trim() === '') return { valid: true, errors: [] };
    if (category.length > 50) errors.push('Category should not exceed 50 characters');
    const validPattern = /^[a-zA-Z0-9\s]+$/;
    if (!validPattern.test(category))
        errors.push('Category should contain only letters, numbers, and spaces');
    return { valid: errors.length === 0, errors: errors };
}

function validateTaskForm(taskData) {
    const validationResults = { isValid: true, errors: {} };
    const titleValidation = validateTitle(taskData.title);
    if (!titleValidation.valid) {
        validationResults.isValid = false;
        validationResults.errors.title = titleValidation.errors;
    }
    const descValidation = validateDescription(taskData.description);
    if (!descValidation.valid) {
        validationResults.isValid = false;
        validationResults.errors.description = descValidation.errors;
    }
    const dateValidation = validateDueDate(taskData.dueDate);
    if (!dateValidation.valid) {
        validationResults.isValid = false;
        validationResults.errors.dueDate = dateValidation.errors;
    }
    const priorityValidation = validatePriority(taskData.priority);
    if (!priorityValidation.valid) {
        validationResults.isValid = false;
        validationResults.errors.priority = priorityValidation.errors;
    }
    const categoryValidation = validateCategory(taskData.category);
    if (!categoryValidation.valid) {
        validationResults.isValid = false;
        validationResults.errors.category = categoryValidation.errors;
    }
    return validationResults;
}

function displayValidationErrors(errors) {
    clearAllErrors();
    if (errors.title) {
        const titleInput = document.getElementById('taskTitle');
        const titleError = document.getElementById('titleError');
        titleInput.classList.add('error');
        titleError.textContent = errors.title.join(', ');
        titleError.style.display = 'block';
    }
    if (errors.description) {
        const descInput = document.getElementById('taskDescription');
        const descError = document.createElement('span');
        descError.className = 'error-msg';
        descError.textContent = errors.description.join(', ');
        descInput.parentElement.appendChild(descError);
    }
    if (errors.dueDate) {
        const dateInput = document.getElementById('taskDueDate');
        const dateError = document.getElementById('dateError');
        dateInput.classList.add('error');
        dateError.textContent = errors.dueDate.join(', ');
        dateError.style.display = 'block';
    }
    if (errors.category) {
        const categoryInput = document.getElementById('taskCategory');
        const categoryError = document.createElement('span');
        categoryError.className = 'error-msg';
        categoryError.textContent = errors.category.join(', ');
        categoryInput.parentElement.appendChild(categoryError);
    }
}

function clearAllErrors() {
    const titleInput = document.getElementById('taskTitle');
    const titleError = document.getElementById('titleError');
    titleInput.classList.remove('error');
    titleError.textContent = '';
    titleError.style.display = 'none';
    const dateInput = document.getElementById('taskDueDate');
    const dateError = document.getElementById('dateError');
    dateInput.classList.remove('error');
    dateError.textContent = '';
    dateError.style.display = 'none';
    const errorMessages = document.querySelectorAll('.error-msg');
    errorMessages.forEach(error => {
        if (error.id !== 'titleError' && error.id !== 'dateError') error.remove();
    });
}

function setupRealtimeValidation() {
    const titleInput = document.getElementById('taskTitle');
    titleInput.addEventListener('input', function() {
        const validation = validateTitle(this.value);
        const errorSpan = document.getElementById('titleError');
        if (!validation.valid) {
            this.classList.add('error');
            errorSpan.textContent = validation.errors[0];
            errorSpan.style.display = 'block';
        } else {
            this.classList.remove('error');
            errorSpan.textContent = '';
            errorSpan.style.display = 'none';
        }
    });
    const dateInput = document.getElementById('taskDueDate');
    dateInput.addEventListener('change', function() {
        const validation = validateDueDate(this.value);
        const errorSpan = document.getElementById('dateError');
        if (!validation.valid) {
            this.classList.add('error');
            errorSpan.textContent = validation.errors[0];
            errorSpan.style.display = 'block';
        } else {
            this.classList.remove('error');
            errorSpan.textContent = '';
            errorSpan.style.display = 'none';
        }
    });
}

function validateTaskDataIntegrity(task) {
    const errors = [];
    if (!task.id) errors.push('Task ID is missing');
    if (!task.title) errors.push('Task title is missing');
    if (!task.createdAt) errors.push('Creation timestamp is missing');
    if (typeof task.id !== 'number') errors.push('Task ID must be a number');
    if (typeof task.title !== 'string') errors.push('Task title must be a string');
    if (typeof task.completed !== 'boolean') errors.push('Completed status must be boolean');
    if (task.createdAt) {
        const date = new Date(task.createdAt);
        if (isNaN(date.getTime())) errors.push('Invalid creation date format');
    }
    return { valid: errors.length === 0, errors: errors };
}

function sanitizeInput(input) {
    if (!input) return '';
    let sanitized = String(input);
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    return sanitized.trim();
}

function sanitizeTaskData(task) {
    return {
        ...task,
        title: sanitizeInput(task.title),
        description: sanitizeInput(task.description),
        category: sanitizeInput(task.category)
    };
}

function handleFormSubmit(event) {
    event.preventDefault();
    const taskData = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        priority: document.getElementById('taskPriority').value,
        category: document.getElementById('taskCategory').value,
        dueDate: document.getElementById('taskDueDate').value
    };
    const validation = validateTaskForm(taskData);
    if (!validation.isValid) {
        displayValidationErrors(validation.errors);
        return false;
    }
    const sanitizedTask = sanitizeTaskData(taskData);
    const integrityCheck = validateTaskDataIntegrity({
        ...sanitizedTask,
        id: Date.now(),
        completed: false,
        createdAt: new Date().toISOString()
    });
    if (!integrityCheck.valid) {
        console.error('Data integrity issues:', integrityCheck.errors);
        return false;
    }
    console.log('Task validated and ready to save:', sanitizedTask);
    return true;
}
