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

//----------------------------- Login -----------------------------------
const login_status:HTMLElement = document.getElementById('login_status');

async function loginToServer(remember: boolean = false) {
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

async function fetchAndDisplay() {
    if (!sessionID) {return}
    const calendars: any[] = await getCalenders();
    for (const calendar of calendars) {
        let calendar_div:HTMLElement = document.createElement('div');
        const heading = document.createElement('h2');
        heading.textContent = calendar.displayName;
        calendar_div.appendChild(heading);
        const objects = await fetchTasks(calendar);
        for (const object of objects) {
            let task_div:HTMLElement = document.createElement('div');
            //ToDo
            task_div.textContent = getInfoFromICal(object.data).summary;
            task_div.className = "task";
            calendar_div.appendChild(task_div);
        }
        task_list.appendChild(calendar_div);
    }
}

function getInfoFromICal(ical: string):{summary: string, uid: string, created: string, lastModified: string, dtstamp: string} {
    let data = null;
    const regex = /BEGIN:VTODO[\s\S]*?END:VTODO/g;
    const matches = ical.match(regex);
    if (matches) {
        matches.forEach((match) => {
            const uid = match.match(/UID:(.*)/)[1].trim();
            const created = match.match(/CREATED:(.*)/)[1].trim();
            const lastModified = match.match(/LAST-MODIFIED:(.*)/)[1].trim();
            const dtstamp = match.match(/DTSTAMP:(.*)/)[1].trim();
            const summary = match.match(/SUMMARY:(.*)/)[1].trim();
            data = {uid, created, lastModified, dtstamp, summary };
        });
    }
    return data;
}

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

