const DATABASE_CONFIG = {
    name: 'TaskManagementDB',
    version: 1,
    stores: {
        tasks: 'tasks',
        users: 'users',
        categories: 'categories'
    }
};

const DB_KEY = 'task_management_db';

function initializeDatabase() {
    const dbExists = localStorage.getItem(DB_KEY);
    if (!dbExists) {
        const initialDB = {
            tasks: [],
            users: [],
            categories: [],
            metadata: {
                created: new Date().toISOString(),
                version: DATABASE_CONFIG.version
            }
        };
        localStorage.setItem(DB_KEY, JSON.stringify(initialDB));
    }
    return true;
}

function closeDatabase() {
    console.log('Database connection closed');
}

function dbInsert(tableName, record) {
    try {
        const stored = localStorage.getItem(DB_KEY);
        if (!stored) throw new Error('Database not initialized');
        const db = JSON.parse(stored);
        if (!db[tableName]) throw new Error(`Table '${tableName}' does not exist`);
        record.createdAt = new Date().toISOString();
        record.updatedAt = new Date().toISOString();
        db[tableName].push(record);
        localStorage.setItem(DB_KEY, JSON.stringify(db));
        return { success: true, data: record };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function dbSelectAll(tableName) {
    try {
        const stored = localStorage.getItem(DB_KEY);
        if (!stored) throw new Error('Database not initialized');
        const db = JSON.parse(stored);
        if (!db[tableName]) throw new Error(`Table '${tableName}' does not exist`);
        return { success: true, data: db[tableName] };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function dbSelectById(tableName, id) {
    try {
        const stored = localStorage.getItem(DB_KEY);
        if (!stored) throw new Error('Database not initialized');
        const db = JSON.parse(stored);
        if (!db[tableName]) throw new Error(`Table '${tableName}' does not exist`);
        const record = db[tableName].find(item => item.id === id);
        if (!record) return { success: false, error: 'Record not found' };
        return { success: true, data: record };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function dbSelectWhere(tableName, condition) {
    try {
        const stored = localStorage.getItem(DB_KEY);
        if (!stored) throw new Error('Database not initialized');
        const db = JSON.parse(stored);
        if (!db[tableName]) throw new Error(`Table '${tableName}' does not exist`);
        const records = db[tableName].filter(condition);
        return { success: true, data: records };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function dbUpdate(tableName, id, updates) {
    try {
        const stored = localStorage.getItem(DB_KEY);
        if (!stored) throw new Error('Database not initialized');
        const db = JSON.parse(stored);
        if (!db[tableName]) throw new Error(`Table '${tableName}' does not exist`);
        const index = db[tableName].findIndex(item => item.id === id);
        if (index === -1) return { success: false, error: 'Record not found' };
        db[tableName][index] = {
            ...db[tableName][index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(DB_KEY, JSON.stringify(db));
        return { success: true, data: db[tableName][index] };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function dbDelete(tableName, id) {
    try {
        const stored = localStorage.getItem(DB_KEY);
        if (!stored) throw new Error('Database not initialized');
        const db = JSON.parse(stored);
        if (!db[tableName]) throw new Error(`Table '${tableName}' does not exist`);
        const initialLength = db[tableName].length;
        db[tableName] = db[tableName].filter(item => item.id !== id);
        if (db[tableName].length === initialLength) return { success: false, error: 'Record not found' };
        localStorage.setItem(DB_KEY, JSON.stringify(db));
        return { success: true, message: 'Record deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function beginTransaction() {
    const db = JSON.parse(localStorage.getItem(DB_KEY));
    localStorage.setItem(DB_KEY + '_backup', JSON.stringify(db));
}

function commitTransaction() {
    localStorage.removeItem(DB_KEY + '_backup');
}

function rollbackTransaction() {
    const backup = localStorage.getItem(DB_KEY + '_backup');
    if (backup) {
        localStorage.setItem(DB_KEY, backup);
        localStorage.removeItem(DB_KEY + '_backup');
    } else {
        console.warn('No transaction to roll back');
    }
}

class QueryBuilder {
    constructor(tableName) {
        this.tableName = tableName;
        this.whereClause = null;
        this.orderByField = null;
        this.orderDirection = 'asc';
        this.limitValue = null;
    }
    where(condition) {
        this.whereClause = condition;
        return this;
    }
    orderBy(field, direction = 'asc') {
        this.orderByField = field;
        this.orderDirection = direction;
        return this;
    }
    limit(count) {
        this.limitValue = count;
        return this;
    }
    execute() {
        let result = dbSelectAll(this.tableName);
        if (!result.success) return result;
        let data = result.data;
        if (this.whereClause) data = data.filter(this.whereClause);
        if (this.orderByField) {
            data.sort((a, b) => {
                const aVal = a[this.orderByField] ?? '';
                const bVal = b[this.orderByField] ?? '';
                return this.orderDirection === 'asc'
                    ? aVal > bVal ? 1 : -1
                    : aVal < bVal ? 1 : -1;
            });
        }
        if (this.limitValue) data = data.slice(0, this.limitValue);
        return { success: true, data: data };
    }
}

function addNewTask(taskData) {
    return dbInsert('tasks', {
        id: Date.now(),
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        category: taskData.category,
        dueDate: taskData.dueDate,
        completed: false
    });
}

function getPendingTasks() {
    return dbSelectWhere('tasks', task => !task.completed);
}

function updateTaskStatus(taskId, completed) {
    return dbUpdate('tasks', taskId, { completed: completed });
}

function deleteOldCompletedTasks(daysOld) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const result = dbSelectWhere('tasks', task => task.completed && new Date(task.updatedAt) < cutoffDate);
    if (result.success) result.data.forEach(task => dbDelete('tasks', task.id));
    return result;
}

function getTopPriorityTasks() {
    const query = new QueryBuilder('tasks')
        .where(task => task.priority === 'high' && !task.completed)
        .orderBy('createdAt', 'desc')
        .limit(5);
    return query.execute();
}

function getDatabaseStats() {
    const db = JSON.parse(localStorage.getItem(DB_KEY));
    const stats = {
        totalTasks: db.tasks.length,
        completedTasks: db.tasks.filter(t => t.completed).length,
        pendingTasks: db.tasks.filter(t => !t.completed).length,
        highPriority: db.tasks.filter(t => t.priority === 'high').length,
        mediumPriority: db.tasks.filter(t => t.priority === 'medium').length,
        lowPriority: db.tasks.filter(t => t.priority === 'low').length,
        databaseSize: new Blob([JSON.stringify(db)]).size + ' bytes'
    };
    return stats;
}

function exportDatabase() {
    const db = localStorage.getItem(DB_KEY);
    const blob = new Blob([db], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task_database_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importDatabase(jsonData) {
    try {
        const db = JSON.parse(jsonData);
        localStorage.setItem(DB_KEY, JSON.stringify(db));
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeDatabase();
});
