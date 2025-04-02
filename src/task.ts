export class Task {
    constructor(dataOrSummary: string, etag?: string, url?: string) {
         if (etag && url) {
             this.data = dataOrSummary;
             this.etag = etag;
             this.url = url;
             this.summary = getInfoFromICal(dataOrSummary).summary;
             this.localTask = false;
         } else {
             this.summary = dataOrSummary;
             this.localTask = true;
         }
     }
    summary: string;
    data: string;
    etag: string;
    url: string;
    localTask: boolean;
    //------------------
    done:boolean = false;
    public setDone():void {
        this.done = true;
    }
    public setNotDone():void {
        this.done = false;
    }
}

//----------------------------- Helpers -----------------------------------
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
