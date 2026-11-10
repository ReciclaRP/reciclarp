import { createPoint } from './logic/backend';
import { invalidateLogin, loggedIn } from './logic/login';
import { descriptionFromPointTypes } from './logic/misc';

async function form_to_point() {
    let pointdescription = document.getElementById("pointdescription");
    let lati = document.getElementById("lati");
    let long = document.getElementById("long");
    let time_open = document.getElementById("time_open");
    let time_close = document.getElementById("time_close");
    let accepts_paper = document.getElementById("accepts_paper");
    let accepts_metal = document.getElementById("accepts_metal");
    let accepts_organic = document.getElementById("accepts_organic");
    let accepts_biological = document.getElementById("accepts_biological");


    console.log(pointdescription.value);
    console.log(lati.value);
    console.log(long.value);
    console.log(time_open.value);
    console.log(time_close.value);
    console.log(accepts_paper.value);
    console.log(accepts_metal.value);
    console.log(accepts_organic.value);
    console.log(accepts_biological.value);
}

