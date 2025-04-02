import {Task} from "./task";

const proxyURL: string = "http://localhost:3000"
let sessionID: string = null;

//----------------------------- Proxy Communication -----------------------------------

async function login(serverUrl: string, username: string, password: string):Promise<string> {
  const response = await fetch(`${proxyURL}/login?serverUrl=${encodeURIComponent(serverUrl)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
    method: "GET",
  });
  if (!response.ok) {
      console.error("Error logging in:" + response.statusText);
      return null;
  } else {
    return response.text();
  }
}
async function getCalenders():Promise<any[]> {
    const response = await fetch(`${proxyURL}/tasklists?sessionID=${encodeURIComponent(sessionID)}`, {
    method: "GET",
    });
    if (!response.ok) {
        console.error("Error getting calendars:" + response.statusText);
        return null;
    } else {
        return response.json();
    }
}
async function fetchTasks(calender: JSON) {
     const response = await fetch(`${proxyURL}/tasks?sessionID=${encodeURIComponent(sessionID)}&calender=${encodeURIComponent(JSON.stringify(calender))}`, {
        method: "GET",
    });
    if (!response.ok) {
        console.error("Error getting tasks:" + response.statusText);
        return null;
    } else {
        return response.json();
    }
}

// (async () => {
// sessionID = await login('https://cloud.aurora.dedyn.io/remote.php/dav', 'PSE Test', 'YOUR_APP_SPECIFIC_PASSWORD');
// const calendars = await getCalenders();
// // @ts-ignore
//     for (const calendar of calendars) {
//     const objects = await fetchTasks(calendar);
//     console.log(objects);
// }

// const items = await fetchTasks(client, calendars[0]);
// const result = await createTask(client, calendars[0], "Test10")

// console.log(sessionID);
// console.log(calendars);
// // console.log("---------------------------------");
// // console.log(items);
// // console.log("---------------------------------");
// // console.log(result);
// })();

async function changeTaskName(task:Task, name:string) {
    if (!task.localTask) {
        //ToDo
    } else {
        task.summary = name;
    }
}

//----------------------------- Login -----------------------------------
const login_status:HTMLElement = document.getElementById('login_status');

async function loginToServer(remember: boolean = false) {
    login_status.textContent = "Login started...";
    const url:string = (document.getElementById('url_input') as HTMLInputElement).value.trim();
    const username:string = (document.getElementById('username_input') as HTMLInputElement).value.trim();
    const password:string = (document.getElementById('password_input') as HTMLInputElement).value.trim();
    if (!username || !password || !url) {
        login_status.textContent = "Please fill in all fields";
        return;
    }
    sessionID = await login(url, username, password);
    if (sessionID === null) {
        login_status.textContent = "Login failed";
    } else {
        login_status.textContent = "Login successful";
        document.getElementById('big_login_status').style.display = "none";
        fetchAndDisplay();
    }
    if (remember) {
        localStorage.setItem("url", url);
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
    }
}
async function autoLogin() {
    const url:string = localStorage.getItem("url");
    const username:string = localStorage.getItem("username");
    const password:string = localStorage.getItem("password");
    if (url && username && password) {
        (document.getElementById('url_input') as HTMLInputElement).value = url;
        (document.getElementById('username_input') as HTMLInputElement).value = username;
        (document.getElementById('password_input') as HTMLInputElement).value = password;
        loginToServer();
    }
}
autoLogin()

//----------------------------- Show Tasks -----------------------------------
const task_list:HTMLElement = document.getElementById('task_list');

async function fetchAndDisplay():Promise<void> {
    if (!sessionID) {return}
    const calendars: any[] = await getCalenders();
    for (const calendar of calendars) {
        let calendar_div:HTMLElement = document.createElement('div');
        const heading = document.createElement('h2');
        heading.textContent = calendar.displayName;
        calendar_div.appendChild(heading);
        const objects = await fetchTasks(calendar);
        for (const object of objects) {
            const task = new Task(object.data, object.etag, object.url);
            calendar_div.appendChild(buildDisplayableTask(task));
        }
        task_list.appendChild(calendar_div);
    }
}

//----------------------------- Local Tasks -----------------------------------
const local_task_list:HTMLElement = document.getElementById('local_task_list');
let localTasks:Task[] = null;

async function saveLocalTasks() {
    localStorage.setItem("local_tasks", JSON.stringify(localTasks));
}
function recoverSavedTasks():void {
    const savedTasks = JSON.parse(localStorage.getItem("local_tasks"));
    if (savedTasks === null || savedTasks.length === 0) {
        localTasks = [];
        localTasks.push(new Task("This is your first task!"));
    } else {
        // Reconstruct Task objects from plain objects
        localTasks = savedTasks.map(taskData => {
            const task = new Task(taskData.summary);
            Object.assign(task, taskData);
            return task;
        });
    }
}
function displaySavedTasks():void {
    local_task_list.innerHTML = '';
    for (const task of localTasks) {
        local_task_list.appendChild(buildDisplayableTask(task));
    }
}
function buildDisplayableTask(task: Task, fresh:boolean = false):HTMLElement {
    let task_div:HTMLElement = document.createElement('div');
    task_div.className = "task";
    let checkbox:HTMLInputElement = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.className = "task_checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener('change', (event) => {
        if (checkbox.checked) {
            task.setDone();
        } else {
            task.setNotDone();
        }
        saveLocalTasks();
    })
    task_div.appendChild(checkbox);
    let textSpan:HTMLSpanElement = document.createElement('span');
    textSpan.textContent = " " + task.summary;
    textSpan.style.width = "100%";
    //Editing
    let task_edit:HTMLElement = document.createElement('div');
    task_edit.className = "popup";
    let name_edit_label:HTMLLabelElement = document.createElement('label');
    let name_edit:HTMLInputElement = document.createElement('input');
    let delete_edit:HTMLButtonElement = document.createElement('button');

    const name_edit_label_text:HTMLSpanElement = document.createElement('span');
    name_edit_label_text.textContent = "Edit Name: ";
    name_edit_label.appendChild(name_edit_label_text);
    name_edit_label.appendChild(name_edit);
    name_edit.value = task.summary;
    name_edit.addEventListener('change', (event) => {
        changeTaskName(task, name_edit.value);
    })

    delete_edit.className = "button";
    delete_edit.textContent = "Delete Task";
    delete_edit.style.color = "#c21919";
    delete_edit.addEventListener('click', (event) => {
        task_edit.style.display = 'none';
        document.removeEventListener('keydown', keyHandler);
        document.removeEventListener('click', clickHandler);
        localTasks = localTasks.filter(t => t !== task);
        local_task_list.removeChild(task_div);
        saveLocalTasks();
    })

    task_edit.appendChild(name_edit_label);
    task_edit.appendChild(document.createElement('br'));
    task_edit.appendChild(document.createElement('br'));
    task_edit.appendChild(delete_edit);
    // close/open edit window
    const keyHandler = (e) => {
        if (e.key === 'Escape') {
            task_edit.style.display = 'none';
            document.removeEventListener('keydown', keyHandler);
            document.removeEventListener('click', clickHandler);
            saveLocalTasks();
            displaySavedTasks();
        }
    };
    const clickHandler = (e) => {
        if (!task_edit.contains(e.target) && e.target !== textSpan) {
            task_edit.style.display = 'none';
            document.removeEventListener('keydown', keyHandler);
            document.removeEventListener('click', clickHandler);
            saveLocalTasks();
            displaySavedTasks();
        }
    };
    textSpan.addEventListener('click', (event) => {
        task_edit.style.display = "block";
        setTimeout(() => {  //slight delay to avoid immediate triggering
            document.addEventListener('keydown', keyHandler);
            document.addEventListener('click', clickHandler);
        }, 10);
    });
    if (fresh) {
        task_edit.style.display = "block";
        setTimeout(() => {
            document.addEventListener('keydown', keyHandler);
            document.addEventListener('click', clickHandler);
        }, 10);
    }
    task_div.appendChild(textSpan);
    task_div.appendChild(task_edit);
    return task_div;
}
document.getElementById('create_local_button').addEventListener('click', (event) => {
    const task = new Task("New Task");
    localTasks.push(task);
    saveLocalTasks();
    local_task_list.appendChild(buildDisplayableTask(task, true));
})

recoverSavedTasks();
displaySavedTasks();

//----------------------------- Buttons -----------------------------------
const settingsButton:HTMLButtonElement = document.getElementById('settings_button') as HTMLButtonElement;
const popup:HTMLElement = document.getElementById('settings');

settingsButton.addEventListener('click', () => {
    popup.style.display = popup.style.display === '' || popup.style.display === 'none' ? 'block' : 'none';
});
document.addEventListener('click', (event) => {
    // @ts-ignore
    if (popup.style.display === 'block' && !popup.contains(event.target) && !settingsButton.contains(event.target)) {
        popup.style.display = 'none';
    }
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        popup.style.display = 'none';
    }
});

document.getElementById('login_button').addEventListener('click', () => {
    loginToServer();
});
document.getElementById('login_remember_button').addEventListener('click', () => {
    loginToServer(true);
});

