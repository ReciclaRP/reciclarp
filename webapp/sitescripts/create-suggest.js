// Endpoint /locations/create & /locations/suggest

// NOTE: DERIVE USER IDS FROM AUTH
/* 
    auth: string,

    data: {
        address: string,

        hours: {
            opens: string
            closes: string
        },

        materials: {
            paper: bool,
            metals: bool,
            organic: bool,
            biological: bool
        }
    }
*/

function readForm() {
  const inputs = document.querySelectorAll(".point-form input");
  const [address, opens, closes, paper, metals, organic, biological] = inputs;

  return {
    address: address.value,
    hours: {
      opens: opens.value,
      closes: closes.value,
    },
    materials: {
      paper: paper.checked,
      metals: metals.checked,
      organic: organic.checked,
      biological: biological.checked,
    },
  };
}

function putData(kind){
    //TODO: Validação, kind = suggest ou create, etc.
    const data = readForm();


    console.log(data);
}