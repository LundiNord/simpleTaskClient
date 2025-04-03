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
}

//----------------------------- Helpers -----------------------------------
function getInfoFromICal(ical: string):{summary: string, uid: string, created: string, lastModified: string, dtstamp: string, completed: boolean} {
    let data = null;
    const regex = /BEGIN:VTODO[\s\S]*?END:VTODO/g;
    const matches = ical.match(regex);
    if (matches) {
        matches.forEach((match) => {
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
            data = {uid, created, lastModified, dtstamp, summary, completed };
        });
    }
    return data;
}
function formatDateForICS() {
    return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}
