let tasks = [];
let isFrozen = false;

// Task constructor
function Task(title, deadline, id) {
  this.title = title;
  this.deadline = deadline;
  this.completed = false;
  this.id = id;
  this.extensionRequested = false;
}

// Add task function
function addTask() {
  if (isFrozen) {
    addChatMessage("AI: You're frozen right now, no new tasks. Deal with it.");
    return;
  }
  
  const taskTitle = document.getElementById('taskTitle').value;
  const taskDeadline = document.getElementById('taskDeadline').value;

  if (!taskTitle || !taskDeadline) {
    alert('Please fill in both fields!');
    return;
  }

  const newTask = new Task(taskTitle, taskDeadline, Date.now());
  tasks.push(newTask);
  renderTasks();

  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDeadline').value = '';
}

// Render tasks to the screen
function renderTasks() {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';

  tasks.forEach(task => {
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('task-item');
    taskDiv.innerHTML = `
      <strong>${task.title}</strong><br>
      Due: ${task.deadline}<br>
      Status: ${task.completed ? 'Completed' : 'Incomplete'}
      <button onclick="completeTask(${task.id})">Complete</button>
      <button onclick="requestExtension(${task.id})">Request Extension</button>
    `;
    taskDiv.innerHTML += checkTaskStatus(task);
    taskList.appendChild(taskDiv);
  });
}

// Check task status
function checkTaskStatus(task) {
  const currentDate = new Date();
  const taskDeadline = new Date(task.deadline);
  let aiMessage = '';

  if (task.completed) {
    aiMessage = `<p><strong>Good job!</strong> You actually did something!</p>`;
  } else {
    if (currentDate > taskDeadline && !task.extensionRequested) {
      aiMessage = `<p><strong>You're late!</strong> Should I extend the deadline for you?</p>`;
    } else if (currentDate > taskDeadline && task.extensionRequested) {
      aiMessage = `<p><strong>Really?</strong> I gave you more time. Hurry up!</p>`;
    } else {
      aiMessage = `<p><strong>Come on!</strong> You still have time!</p>`;
    }
  }

  return aiMessage;
}

// Mark task as completed
function completeTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = true;
    renderTasks();
    addChatMessage(`Task "${task.title}" completed! Well done.`);
  }
}

// Request extension for a task
function requestExtension(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task && !task.extensionRequested) {
    const newDeadline = prompt("Enter new deadline (YYYY-MM-DDTHH:MM):");
    if (newDeadline) {
      task.deadline = newDeadline;
      task.extensionRequested = true;
      renderTasks();
      addChatMessage(`Task deadline extended to ${newDeadline}. You're welcome.`);
    }
  } else if (task && task.extensionRequested) {
    addChatMessage(`I already gave you an extension! Don't keep pushing it.`);
  } else {
    addChatMessage("Something went wrong. Try again.");
  }
}

// Chat with AI
function sendMessage() {
  const userMessage = document.getElementById('chatInput').value;
  if (!userMessage.trim()) return; // Ignore empty messages
  
  addChatMessage(`You: ${userMessage}`);
  
  // Process the AI response
  const response = getAIResponse(userMessage);
  addChatMessage(`AI: ${response}`);

  // Clear chat input
  document.getElementById('chatInput').value = '';
}

// Function to handle AI responses
function getAIResponse(message) {
  const lowerMessage = message.toLowerCase();

  // Handle emergency situation
  if (lowerMessage.includes("emergency")) {
    return "Oh, an emergency? Alright, I get it. I'll extend the deadline for you. But don’t make this a habit!";
  }

  if (lowerMessage.includes("extension")) {
    return "Fine, I’ll extend the deadline... but you better hurry!";
  } else if (lowerMessage.includes("task")) {
    return "Tasks? You should be working on them! Not chatting with me.";
  } else if (lowerMessage.includes("complete")) {
    return "Good job! But seriously, you should complete your tasks sooner.";
  } else {
    return "Stop procrastinating and get to work!";
  }
}

// Freeze the app for a random period when a task is overdue
function freezeApp() {
  isFrozen = true;
  document.getElementById('taskInput').classList.add('disabled');
  document.getElementById('freezeMessage').classList.remove('hidden');
  
  const freezeTime = Math.floor(Math.random() * 15) + 1; // Random freeze time between 1 and 15 minutes
  setTimeout(() => {
    isFrozen = false;
    document.getElementById('taskInput').classList.remove('disabled');
    document.getElementById('freezeMessage').classList.add('hidden');
  }, freezeTime * 60 * 1000);
}

// Monitor tasks to trigger freeze if overdue
function monitorTasks() {
  const currentDate = new Date();
  tasks.forEach(task => {
    const taskDeadline = new Date(task.deadline);
    if (!task.completed && currentDate > taskDeadline && !task.extensionRequested) {
      freezeApp();
    }
  });
}

// Add message to chat window
function addChatMessage(message) {
  const chatBox = document.getElementById('chatBox');
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
}

// Check tasks every minute
setInterval(monitorTasks, 60000);
