 // Smooth scroll navigation link active state toggle
 const navLinks = document.querySelectorAll('nav.sidebar a');
 const sections = Array.from(navLinks).map(link => document.querySelector(link.getAttribute('href')));
 function onScroll() {
   const scrollY = window.pageYOffset;
   sections.forEach((section, i) => {
     if (
       section.offsetTop <= scrollY + 80 &&
       section.offsetTop + section.offsetHeight > scrollY + 80
     ) {
       navLinks.forEach(link => link.classList.remove('active'));
       navLinks[i].classList.add('active');
     }
   });
 }
 window.addEventListener('scroll', onScroll);

 // Contact form submission (dummy, no backend)
 const contactForm = document.getElementById('contact-form');
 contactForm.addEventListener('submit', (e) => {
   e.preventDefault();
   alert('Thank you for your message, I will get back to you soon!');
   contactForm.reset();
 });

 // Simple theme toggle (dark/light)
 const themeToggleBtn = document.getElementById('themeToggle');
 themeToggleBtn.addEventListener('click', () => {
   if(document.documentElement.style.filter) {
     document.documentElement.style.filter = '';
     return;
   }
   document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)';
 });

 // Task Manager feature implementation
 /**
  * Task schema:
  * id: string unique
  * title: string
  * dueDate: string (ISO date)
  * priority: 'low' | 'medium' | 'high'
  * category: string
  * description: string
  * completed: boolean
  */

 const taskForm = document.getElementById('task-form');
 const tasksList = document.getElementById('tasks-list');
 const filterStatus = document.getElementById('filter-status');
 const filterPriority = document.getElementById('filter-priority');
 const searchTasks = document.getElementById('search-tasks');

 let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

 // Utility - generate unique id
 function generateId() {
   return '_' + Math.random().toString(36).substr(2, 9);
 }

 // Save tasks to localStorage
 function saveTasks() {
   localStorage.setItem('tasks', JSON.stringify(tasks));
 }

 // Render tasks filtered by controls
 function renderTasks() {
   const statusFilter = filterStatus.value;
   const priorityFilter = filterPriority.value;
   const searchTerm = searchTasks.value.toLowerCase();

   tasksList.innerHTML = '';

   const filteredTasks = tasks.filter(task => {
     if (statusFilter === 'pending' && task.completed) return false;
     if (statusFilter === 'completed' && !task.completed) return false;
     if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
     if (
       task.title.toLowerCase().indexOf(searchTerm) === -1 &&
       task.description.toLowerCase().indexOf(searchTerm) === -1 &&
       task.category.toLowerCase().indexOf(searchTerm) === -1
     ) {
       return false;
     }
     return true;
   });

   if (filteredTasks.length === 0) {
     tasksList.innerHTML = '<p style="color:#6b7280; user-select:none;">No tasks found.</p>';
     return;
   }

   filteredTasks.forEach(task => {
     const taskItem = document.createElement('div');
     taskItem.className = 'task-item';
     if(task.completed) taskItem.classList.add('completed');
     taskItem.setAttribute('role', 'listitem');
     taskItem.setAttribute('tabindex', '0');

     const topRow = document.createElement('div');
     topRow.className = 'task-top';

     const title = document.createElement('div');
     title.className = 'task-title';
     title.textContent = task.title;
     topRow.appendChild(title);

     // Priority badge with color
     const priorityBadge = document.createElement('div');
     priorityBadge.className = 'task-priority ' + task.priority;
     priorityBadge.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
     topRow.appendChild(priorityBadge);

     taskItem.appendChild(topRow);

     // Due date
     if (task.dueDate) {
       const due = document.createElement('div');
       due.className = 'task-due';
       const dateVal = new Date(task.dueDate);
       due.textContent = 'Due: ' + dateVal.toLocaleDateString(undefined, {year:'numeric',month:'short',day:'numeric'});
       taskItem.appendChild(due);
     }

     // Description
     if (task.description) {
       const desc = document.createElement('div');
       desc.className = 'task-desc';
       desc.textContent = task.description;
       taskItem.appendChild(desc);
     }

     const btnRow = document.createElement('div');
     btnRow.className = 'task-buttons';

     // Complete/uncomplete button
     const btnToggle = document.createElement('button');
     btnToggle.className = 'task-btn toggle';
     btnToggle.title = task.completed ? 'Mark as pending' : 'Mark as completed';
     btnToggle.setAttribute('aria-label', btnToggle.title);
     btnToggle.innerHTML = task.completed ?
       `<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"/></svg>`
       :
       `<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/></svg>`;

     btnToggle.addEventListener('click', () => {
       task.completed = !task.completed;
       saveTasks();
       renderTasks();
       showNotification(`Task "${task.title}" marked as ${task.completed ? 'completed' : 'pending'}.`);
     });
     btnRow.appendChild(btnToggle);

     // Delete button
     const btnDelete = document.createElement('button');
     btnDelete.className = 'task-btn delete';
     btnDelete.title = 'Delete task';
     btnDelete.setAttribute('aria-label', 'Delete task ' + task.title);
     btnDelete.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
     btnDelete.addEventListener('click', () => {
       if(confirm(`Delete task "${task.title}"?`)) {
         tasks = tasks.filter(t => t.id !== task.id);
         saveTasks();
         renderTasks();
         showNotification(`Task "${task.title}" deleted.`);
       }
     });
     btnRow.appendChild(btnDelete);

     taskItem.appendChild(btnRow);
     tasksList.appendChild(taskItem);
   });
 }

 // Add task handler
 taskForm.addEventListener('submit', e => {
   e.preventDefault();
   const title = taskForm.title.value.trim();
   if (!title) {
     alert('Task title is required.');
     return;
   }
   const newTask = {
     id: generateId(),
     title,
     dueDate: taskForm.dueDate.value,
     priority: taskForm.priority.value,
     category: taskForm.category.value.trim() || 'General',
     description: taskForm.description.value.trim(),
     completed: false,
   };
   tasks.push(newTask);
   saveTasks();
   renderTasks();
   taskForm.reset();
   showNotification(`Task "${newTask.title}" added.`);
 });

 // Filters event listeners
 filterStatus.addEventListener('change', renderTasks);
 filterPriority.addEventListener('change', renderTasks);
 searchTasks.addEventListener('input', renderTasks);

 // Notification/toast system
 function showNotification(message) {
   const existingToast = document.querySelector('.toast-notification');
   if(existingToast) existingToast.remove();

   const toast = document.createElement('div');
   toast.className = 'toast-notification';
   toast.textContent = message;
   toast.setAttribute('role', 'alert');
   toast.style.position = 'fixed';
   toast.style.bottom = '1.5rem';
   toast.style.right = '1.5rem';
   toast.style.background = 'rgba(34, 197, 94, 0.9)';
   toast.style.color = '#121212';
   toast.style.padding = '0.7rem 1.2rem';
   toast.style.borderRadius = '12px';
   toast.style.boxShadow = '0 3px 10px rgba(34,197,94,0.6)';
   toast.style.fontWeight = '600';
   toast.style.zIndex = '9999';
   toast.style.userSelect = 'none';
   toast.style.opacity = '0';
   toast.style.transition = 'opacity 0.4s ease-in-out';

   document.body.appendChild(toast);
   requestAnimationFrame(() => {
     toast.style.opacity = '1';
   });
   setTimeout(() => {
     toast.style.opacity = '0';
     toast.addEventListener('transitionend', () => {
       toast.remove();
     });
   }, 2500);
 }

 // Initial render
 renderTasks();