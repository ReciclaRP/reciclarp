import { invalidateLogin, loggedIn } from "./login";
import { pullMapData, getPointAccesses } from './backend';
import { descriptionFromPointTypes } from "./misc";
import { pointAccessNo } from "./points";

async function create_json() {
    let udata = await loggedIn();
    if(udata) {
        let data = await pullMapData();
        let exp = {
            exportee: udata.pid,
            exportedat: new Date().toString(),
            data: []
        }

        for(let entry of data) {
            let accesses = await getPointAccesses(udata.email, udata.token, entry.pid, 100);
            
            let bucket = Array(24);
            for(let aentry of accesses.data) {
                let hr = Number(aentry.hour_accessed.split(":")[0]);
                
                if(bucket[hr]) {
                    bucket[hr] += 1;
                } else {
                    bucket[hr] = 1;
                }
            }

            for(let bentry of bucket) {
                if(!bentry) bentry = 0;
            }

            exp.data.push({
                pid: entry.pid,
                description: entry.pointdescription,
                time_open: entry.time_open,
                time_close: entry.time_close,
                accepts: descriptionFromPointTypes(entry),
                latitude: entry.lati,
                longitude: entry.long,
                creator: entry.creator,
                times_accessed: await pointAccessNo(entry.pid),

                accessed_sample_100: bucket
            });
        }

        return JSON.stringify(exp);
    } else {
        invalidateLogin();
    }
}

export {
    create_json
}