import {createDAVClient, DAVClient} from 'tsdav';

const client = new DAVClient({
    serverUrl: 'https://cloud.aurora.dedyn.io/remote.php/dav',
    credentials: {
        username: 'PSE Test',
        password: 'YOUR_APP_SPECIFIC_PASSWORD',
    },
    authMethod: 'Basic',
    defaultAccountType: 'caldav',
});
client.login();
const calendars = await client.fetchCalendars();

console.log(calendars);



//----------------------------- Tasks -----------------------------------




