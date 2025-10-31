// Основные переменные
let tasks = [];
let dragStartIndex;
let sortDirection = 'asc'; // 'asc' - от старого к новому, 'desc' - от нового к старому

// DOM элементы
let todoContainer;
let sidebar;
let mainContent;
let tasksList;
let completedList;
let addTaskBtn;
let taskInputContainer;
let taskInput;
let dateInput;
let saveBtn;
let searchInput;
let filterSelect;
let sortButton;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    createAppStructure();
    loadTasksFromStorage();
    renderTasks();
    updateSortButtonText();
});

// Создание структуры приложения
function createAppStructure() {
    // Создаем основной контейнер
    todoContainer = document.createElement('div');
    todoContainer.className = 'todo-container';
    
    // Создаем боковую панель (белый фон)
    sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    
    // Заголовок боковой панели
    const sidebarTitle = document.createElement('h2');
    sidebarTitle.className = 'sidebar-title';
    sidebarTitle.textContent = 'Управление задачами';
    sidebar.appendChild(sidebarTitle);
    
    // Боковая панель с фильтрами и поиском
    const sidebarControls = document.createElement('div');
    sidebarControls.className = 'sidebar-controls';
    
    // Группа фильтров
    const filterGroup = document.createElement('div');
    filterGroup.className = 'filter-group';
    
    // Поиск
    searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Поиск задачи...';
    searchInput.addEventListener('input', filterTasks);
    
    // Фильтр по статусу
    filterSelect = document.createElement('select');
    const optionAll = document.createElement('option');
    optionAll.value = 'all';
    optionAll.textContent = 'Все задачи';
    const optionActive = document.createElement('option');
    optionActive.value = 'active';
    optionActive.textContent = 'Активные';
    const optionCompleted = document.createElement('option');
    optionCompleted.value = 'completed';
    optionCompleted.textContent = 'Выполненные';
    
    filterSelect.appendChild(optionAll);
    filterSelect.appendChild(optionActive);
    filterSelect.appendChild(optionCompleted);
    filterSelect.addEventListener('change', filterTasks);
    
    // Кнопка сортировки по дате
    sortButton = document.createElement('button');
    sortButton.textContent = 'Сортировать: Старые → Новые';
    sortButton.addEventListener('click', sortTasksByDate);
    
    filterGroup.appendChild(searchInput);
    filterGroup.appendChild(filterSelect);
    filterGroup.appendChild(sortButton);
    
    sidebarControls.appendChild(filterGroup);
    sidebar.appendChild(sidebarControls);
    
    // Основной контент (белый фон)
    mainContent = document.createElement('div');
    mainContent.className = 'main-content';
    
    // Создаем заголовок
    const header = document.createElement('h1');
    header.className = 'todo-header';
    header.textContent = 'ToDo-лист';
    mainContent.appendChild(header);
    
    // Создаем блок управления в основном контенте
    const controls = document.createElement('div');
    controls.className = 'controls';
    
    // Кнопка добавления задачи
    addTaskBtn = document.createElement('button');
    addTaskBtn.className = 'add-task-btn';
    addTaskBtn.textContent = 'Создать';
    addTaskBtn.addEventListener('click', showTaskInput);
    
    // Контейнер для ввода задачи
    taskInputContainer = document.createElement('div');
    taskInputContainer.className = 'task-input-container';
    
    // Первая строка - поле ввода задачи
    const taskInputRow = document.createElement('div');
    taskInputRow.className = 'task-input-row';
    
    const checkboxPlaceholder = document.createElement('div');
    checkboxPlaceholder.className = 'task-checkbox-placeholder';
    
    taskInput = document.createElement('input');
    taskInput.type = 'text';
    taskInput.className = 'task-input';
    taskInput.placeholder = 'Новая задача...';
    taskInput.addEventListener('input', toggleSaveButton);
    taskInput.addEventListener('keydown', handleTaskInputKeydown);
    
    taskInputRow.appendChild(checkboxPlaceholder);
    taskInputRow.appendChild(taskInput);
    
    // Вторая строка - поле ввода даты
    const taskDateRow = document.createElement('div');
    taskDateRow.className = 'task-date-row';
    
    const calendarIcon = document.createElement('span');
    calendarIcon.className = 'calendar-icon';
    //calendarIcon.innerHTML = '📅';
    
    dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.className = 'date-input';
    
    taskDateRow.appendChild(calendarIcon);
    taskDateRow.appendChild(dateInput);
    
    // Третья строка - кнопки действий
    const taskActionsRow = document.createElement('div');
    taskActionsRow.className = 'task-actions-row';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-btn';
    cancelBtn.textContent = 'Отмена';
    cancelBtn.addEventListener('click', hideTaskInput);
    
    saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.textContent = 'Сохранить';
    saveBtn.disabled = true;
    saveBtn.addEventListener('click', saveTask);
    
    taskActionsRow.appendChild(cancelBtn);
    taskActionsRow.appendChild(saveBtn);
    
    // Собираем контейнер ввода задачи
    taskInputContainer.appendChild(taskInputRow);
    taskInputContainer.appendChild(taskDateRow);
    taskInputContainer.appendChild(taskActionsRow);
    
    controls.appendChild(addTaskBtn);
    controls.appendChild(taskInputContainer);
    mainContent.appendChild(controls);
    
    // Создаем список задач
    tasksList = document.createElement('ul');
    tasksList.className = 'tasks-list';
    tasksList.id = 'tasks-list';
    mainContent.appendChild(tasksList);
    
    // Создаем блок выполненных задач
    const completedTasks = document.createElement('div');
    completedTasks.className = 'completed-tasks';
    
    const completedHeader = document.createElement('div');
    completedHeader.className = 'completed-header';
    
    const completedTitle = document.createElement('h3');
    completedTitle.textContent = '◄ Выполненные задачи';
    
    const toggleIcon = document.createElement('span');
    toggleIcon.textContent = ' ';
    
    completedHeader.appendChild(completedTitle);
    completedHeader.appendChild(toggleIcon);
    completedHeader.addEventListener('click', toggleCompletedTasks);
    
    completedList = document.createElement('ul');
    completedList.className = 'completed-list';
    completedList.id = 'completed-list';
    
    completedTasks.appendChild(completedHeader);
    completedTasks.appendChild(completedList);
    mainContent.appendChild(completedTasks);
    
    // Собираем все вместе
    todoContainer.appendChild(sidebar);
    todoContainer.appendChild(mainContent);
    
    // Добавляем контейнер в body
    document.body.appendChild(todoContainer);
}

// Показать поле ввода задачи
function showTaskInput() {
    taskInputContainer.classList.add('active');
    taskInput.focus();
    
    // Устанавливаем дату по умолчанию - сегодня
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
}

// Скрыть поле ввода задачи
function hideTaskInput() {
    taskInputContainer.classList.remove('active');
    taskInput.value = '';
    saveBtn.disabled = true;
}

// Обработка нажатия клавиш в поле ввода задачи
function handleTaskInputKeydown(e) {
    if (e.key === 'Enter') {
        saveTask();
    } else if (e.key === 'Escape') {
        hideTaskInput();
    }
}

// Переключение состояния кнопки сохранения
function toggleSaveButton() {
    saveBtn.disabled = taskInput.value.trim() === '';
}

// Сохранение задачи
function saveTask() {
    const text = taskInput.value.trim();
    const date = dateInput.value;
    
    if (text === '') {
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: text,
        date: date || new Date().toISOString().split('T')[0],
        completed: false,
        order: tasks.length
    };
    
    tasks.push(newTask);
    saveTasksToStorage();
    renderTasks();
    hideTaskInput();
}

// Удаление задачи
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasksToStorage();
    renderTasks();
}

// Редактирование задачи
function editTask(id) {
    const task = tasks.find(task => task.id === id);
    if (!task) return;
    
    // Создаем модальное окно для редактирования
    const editModal = document.createElement('div');
    editModal.className = 'edit-modal';
    editModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const editContent = document.createElement('div');
    editContent.className = 'edit-content';
    editContent.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    const editTitle = document.createElement('h3');
    editTitle.textContent = 'Редактировать задачу';
    editTitle.style.marginBottom = '20px';
    
    const textLabel = document.createElement('label');
    textLabel.textContent = 'Название задачи:';
    textLabel.style.display = 'block';
    textLabel.style.marginBottom = '5px';
    textLabel.style.fontWeight = 'bold';
    
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.value = task.text;
    textInput.style.cssText = `
        width: 100%;
        padding: 10px;
        margin-bottom: 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
    `;
    
    const dateLabel = document.createElement('label');
    dateLabel.textContent = 'Дата выполнения:';
    dateLabel.style.display = 'block';
    dateLabel.style.marginBottom = '5px';
    dateLabel.style.fontWeight = 'bold';
    
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.value = task.date;
    dateInput.style.cssText = `
        width: 100%;
        padding: 10px;
        margin-bottom: 20px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
    `;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    `;
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Отмена';
    cancelBtn.style.cssText = `
        padding: 10px 20px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        cursor: pointer;
    `;
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Сохранить';
    saveBtn.style.cssText = `
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        background: #1a73e8;
        color: white;
        cursor: pointer;
    `;
    
    // Обработчики событий
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(editModal);
    });
    
    saveBtn.addEventListener('click', () => {
        const newText = textInput.value.trim();
        const newDate = dateInput.value;
        
        if (newText === '') {
            alert('Название задачи не может быть пустым');
            return;
        }
        
        task.text = newText;
        task.date = newDate || new Date().toISOString().split('T')[0];
        
        saveTasksToStorage();
        renderTasks();
        document.body.removeChild(editModal);
    });
    
    // Закрытие по клику на фон
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            document.body.removeChild(editModal);
        }
    });
    
    // Закрытие по Escape
    const handleKeydown = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(editModal);
            document.removeEventListener('keydown', handleKeydown);
        }
    };
    document.addEventListener('keydown', handleKeydown);
    
    // Собираем модальное окно
    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(saveBtn);
    
    editContent.appendChild(editTitle);
    editContent.appendChild(textLabel);
    editContent.appendChild(textInput);
    editContent.appendChild(dateLabel);
    editContent.appendChild(dateInput);
    editContent.appendChild(buttonContainer);
    
    editModal.appendChild(editContent);
    document.body.appendChild(editModal);
    
    // Фокусируемся на поле ввода
    textInput.focus();
    textInput.select();
}

// Отметка задачи как выполненной
function toggleTaskCompletion(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasksToStorage();
        renderTasks();
    }
}

// Сортировка задач по дате с переключением направления
function sortTasksByDate() {
    if (sortDirection === 'asc') {
        // От нового к старому
        tasks.sort((a, b) => new Date(b.date) - new Date(a.date));
        sortDirection = 'desc';
    } else {
        // От старого к новому
        tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
        sortDirection = 'asc';
    }
    saveTasksToStorage();
    renderTasks();
    updateSortButtonText();
}

// Обновление текста кнопки сортировки
function updateSortButtonText() {
    if (sortButton) {
        if (sortDirection === 'asc') {
            sortButton.textContent = 'Сортировать по дате ↑↓';
        } else {
            sortButton.textContent = 'Сортировать по дате ↑↓';
        }
    }
}

// Фильтрация и поиск задач
function filterTasks() {
    renderTasks();
}

// Переключение видимости выполненных задач
function toggleCompletedTasks() {
    completedList.classList.toggle('expanded');
}

// Drag and Drop функциональность
function handleDragStart(e) {
    dragStartIndex = +this.closest('li').getAttribute('data-id');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragStartIndex.toString());
    this.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const draggingElement = document.querySelector('.dragging');
    const afterElement = getDragAfterElement(tasksList, e.clientY);
    const taskItem = this.closest('li');
    
    if (afterElement == null) {
        tasksList.appendChild(draggingElement);
    } else {
        tasksList.insertBefore(draggingElement, afterElement);
    }
}

function handleDragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDragLeave() {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    const dragEndIndex = +this.closest('li').getAttribute('data-id');
    
    if (dragStartIndex !== dragEndIndex) {
        // Находим задачи по их ID
        const draggedTaskIndex = tasks.findIndex(task => task.id === dragStartIndex);
        const targetTaskIndex = tasks.findIndex(task => task.id === dragEndIndex);
        
        if (draggedTaskIndex !== -1 && targetTaskIndex !== -1) {
            // Удаляем задачу из старой позиции и вставляем в новую
            const [draggedTask] = tasks.splice(draggedTaskIndex, 1);
            tasks.splice(targetTaskIndex, 0, draggedTask);
            
            // Обновляем порядок
            tasks.forEach((task, index) => {
                task.order = index;
            });
            
            saveTasksToStorage();
            renderTasks();
        }
    }
    
    this.classList.remove('drag-over');
}

function handleDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.task-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

// Вспомогательная функция для определения позиции при перетаскивании
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Рендеринг задач
function renderTasks() {
    // Очищаем списки
    tasksList.innerHTML = '';
    completedList.innerHTML = '';
    
    // Фильтруем задачи
    const searchText = searchInput.value.toLowerCase();
    const filterValue = filterSelect.value;
    
    let filteredTasks = tasks.filter(task => {
        const matchesSearch = task.text.toLowerCase().includes(searchText);
        const matchesFilter = 
            filterValue === 'all' || 
            (filterValue === 'active' && !task.completed) ||
            (filterValue === 'completed' && task.completed);
        
        return matchesSearch && matchesFilter;
    });
    
    // Разделяем задачи на активные и выполненные
    const activeTasks = filteredTasks.filter(task => !task.completed);
    const completedTasks = filteredTasks.filter(task => task.completed);
    
    // Рендерим активные задачи
    if (activeTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'Нет активных задач';
        tasksList.appendChild(emptyMessage);
    } else {
        activeTasks.forEach((task, index) => {
            const taskElement = createTaskElement(task, index);
            tasksList.appendChild(taskElement);
        });
    }
    
    // Рендерим выполненные задачи
    if (completedTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'Нет выполненных задач';
        completedList.appendChild(emptyMessage);
    } else {
        completedTasks.forEach((task, index) => {
            const taskElement = createTaskElement(task, index);
            completedList.appendChild(taskElement);
        });
    }
    
    // Добавляем обработчики drag and drop после рендеринга
    addDragAndDropHandlers();
}

// Добавление обработчиков drag and drop
function addDragAndDropHandlers() {
    const taskItems = document.querySelectorAll('.task-item');
    
    taskItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('dragenter', handleDragEnter);
        item.addEventListener('dragleave', handleDragLeave);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
    });
}

// Создание элемента задачи
function createTaskElement(task, index) {
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item';
    taskItem.setAttribute('data-id', task.id);
    taskItem.setAttribute('draggable', true);
    
    // Чекбокс
    const checkbox = document.createElement('div');
    checkbox.className = `task-checkbox ${task.completed ? 'checked' : ''}`;
    checkbox.addEventListener('click', () => toggleTaskCompletion(task.id));
    
    // Контент задачи
    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';
    
    const taskText = document.createElement('div');
    taskText.className = `task-text ${task.completed ? 'completed' : ''}`;
    taskText.textContent = task.text;
    
    const taskDate = document.createElement('div');
    taskDate.className = 'task-date';
    taskDate.textContent = formatDate(task.date);
    
    taskContent.appendChild(taskText);
    taskContent.appendChild(taskDate);
    
    // Действия с задачей
    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';
    
    const editButton = document.createElement('button');
    editButton.textContent = 'Редактировать';
    editButton.addEventListener('click', () => editTask(task.id));
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Удалить';
    deleteButton.addEventListener('click', () => deleteTask(task.id));
    
    taskActions.appendChild(editButton);
    taskActions.appendChild(deleteButton);
    
    // Собираем элемент
    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskContent);
    taskItem.appendChild(taskActions);
    
    return taskItem;
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

// Сохранение задач в localStorage
function saveTasksToStorage() {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

// Загрузка задач из localStorage
function loadTasksFromStorage() {
    const storedTasks = localStorage.getItem('todoTasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}