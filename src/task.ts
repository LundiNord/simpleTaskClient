export class Task {
    constructor(dataOrSummary: string, etag?: string, url?: string, localTask?: boolean) {
         if (etag && url) {
             this.data = dataOrSummary;
             this.etag = etag;
             this.url = url;
             this.summary = getInfoFromICal(dataOrSummary).summary;
             this.uuid = getInfoFromICal(dataOrSummary).uid;
             this.created = getInfoFromICal(dataOrSummary).created;
             this.lastModified = getInfoFromICal(dataOrSummary).lastModified;
             this.dtstamp = getInfoFromICal(dataOrSummary).dtstamp;
             this.localTask = false;
             this.completed = getInfoFromICal(dataOrSummary).completed;
             this.due = getInfoFromICal(dataOrSummary).due;
         } else {
             this.summary = dataOrSummary;
             this.localTask = true;
         }
         if (localTask != null) {
                this.localTask = localTask;
         }
     }
    private summary: string;
    private data: string;
    etag: string;
    uuid: string;
    created: string;
    lastModified: string;
    dtstamp: string;
    completed: boolean;
    private url: string;
    public readonly localTask: boolean;
    due: string;    //null or 20250404T150000Z
    //------------------
    public setDone():void {
        if (!this.localTask) {
            this.data = null;
        }
        this.completed = true;
    }
    public setNotDone():void {
        if (!this.localTask) {
            this.data = null;
        }
        this.completed = false;
    }
    public getUrl():string {
        if (this.url) {
            return this.url;
        }
        this.url = this.summary + '_' + Math.random().toString(36).substring(2, 7) + '.ics';
        return this.url;
    }
    public setUrl(url:string):void {
        this.url = url;
    }
    public getData():string {
        if (this.data) {
            return this.data;
        }
        if(!this.uuid) {
            this.uuid = crypto.randomUUID();
        }
        if (!this.created) {
            this.created = formatDateForICS();
        }
        if (!this.lastModified) {
            this.lastModified = formatDateForICS();
        }
        if (!this.dtstamp) {
            this.dtstamp = formatDateForICS();
        }
        return 'BEGIN:VCALENDAR\n' + 'VERSION:2.0\n' +
            'PRODID:-//Simple Task Client 0.1\n' +
            'BEGIN:VTODO\n' +
            'UID:' + this.uuid + '\n' +
            'CREATED:' + this.created + '\n' +
            'LAST-MODIFIED:' + this.lastModified + '\n' +
            'DTSTAMP:' + this.dtstamp + '\n' +
            'SUMMARY:' + this.summary + '\n' +
            (this.completed ? 'STATUS:COMPLETED\n' : '') +
            (this.due ? 'DUE:' + this.due + '\n' : '') +
            'END:VTODO\n' +
            'END:VCALENDAR'
    }
    public updateTaskName(name:string):void {
        this.summary = name;
        if (!this.localTask) {
            this.data = null;
        }
    }
    public getSummary():string {
        return this.summary;
    }
    public getDue():string {
        if (!this.due) {
            return this.due;
        }
        const year:string = this.due.substring(0, 4);
        const month:string = this.due.substring(4, 6);
        const day:string = this.due.substring(6, 8);
        const hour:string = this.due.substring(9, 11);
        const minute:string = this.due.substring(11, 13);
        return `${year}-${month}-${day}T${hour}:${minute}`;
    }
    public setDue(value:string):void {
        const date = new Date(value);
        this.due = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        if (!this.localTask) {
            this.data = null;
        }
    }
}

//----------------------------- Helpers -----------------------------------
function getInfoFromICal(ical: string):{summary: string, uid: string, created: string, lastModified: string, dtstamp: string, completed: boolean, due: string} {
    let data:any = null;
    const regex = /BEGIN:VTODO[\s\S]*?END:VTODO/g;
    const matches = ical.match(regex);
    if (matches) {
        matches.forEach((match:string):void => {
            const uid:string = RegExp(/UID:(.*)/).exec(match)[1].trim();
            const created:string = RegExp(/CREATED:(.*)/).exec(match)[1].trim();
            const lastModified:string = RegExp(/LAST-MODIFIED:(.*)/).exec(match)[1].trim();
            const dtstamp:string = RegExp(/DTSTAMP:(.*)/).exec(match)[1].trim();
            const summary:string = RegExp(/SUMMARY:(.*)/).exec(match)[1].trim();
            const statusMatch = RegExp(/STATUS:(.*)/).exec(match);
            const status:string = statusMatch ? statusMatch[1].trim() : null;
            let completed:boolean = false;
            if (status && status === 'COMPLETED') {
                completed = true;
            }
            const dueMatch = RegExp(/DUE:(.*)/).exec(match);
            const due:string = dueMatch ? dueMatch[1].trim() : null;
            data = {uid, created, lastModified, dtstamp, summary, completed, due};
        });
    }
    return data;
}
function formatDateForICS():string {
    return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}
