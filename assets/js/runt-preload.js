const { ipcRenderer: ipc } = require('electron');

let userDocument;
let userVehiclePlate;
let userDocumentType;

ipc.on('newRequest', async(event, props) => {
    await newRequest();
});

ipc.on('runt-form-data', async(event, props) => {
    console.log('runt-form-data', props);
    userDocument = props.documentNumber;
    userVehiclePlate = props.plate;
    userDocumentType = props.documentType;
    /* Plate input */
    let plateInput = $('#noPlaca');
    console.log('hereeee', userVehiclePlate);
    plateInput.val(userVehiclePlate);
    plateInput.trigger('input');

    /* Document number input */
    let documentNumberInput = $('input[name ="noDocumento"]');
    documentNumberInput.val(userDocument);
    documentNumberInput.trigger('input');

    let documentTypeXpath = "//label[text()='Tipo de Documento:']";
    let documentMatchingElement = document.evaluate(documentTypeXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let documentTypeSelect = documentMatchingElement.parentElement.childNodes[3].childNodes[3];
    documentTypeSelect.value = userDocumentType;
});
/* Add listener for when the content is loaded */
document.addEventListener('DOMContentLoaded', async(event) => {
    console.log('domloaded');
    /* Add timeout to prevent errors (button not rendered) */
    setTimeout(async() => {
        if (document.title.indexOf('Error') >= 0) {
            ipc.sendTo(1, 'runt-error', true);
        } else {
            /* Find button to make the request for vehicle information */
            let xpath = "//button[text()='Consultar Información']";

            let matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

            /* Add Event on click for the button */
            matchingElement.addEventListener("click", async() => {
                /* Store the selected values of the form */
                // const form = document.getElementsByName('consultaAutomotorFrm');
                // const documentTypeValue = form[0].childNodes[11].childNodes[3].childNodes[3].value;

                // const plate = $('#noPlaca');


                // const documentNumber = $('input[name ="noDocumento"]');


                // const formData = {
                //     documentNumber: documentNumber.val(),
                //     plate: plate.val(),
                //     documentType: documentTypeValue
                // };

                // ipc.sendTo(1, 'runtFormData', formData);


                /* Add timeout after the button is clicked */
                setTimeout(async() => {
                    let theMake = await getVehicleMake();
                    let theModel = await getVehicleModel();
                    let theLine = await getVehicleLine();
                    let theColor = await getVehicleColor();
                    let theState = await getVehicleState();
                    await sendData('vehicleInfo', {
                        make: theMake,
                        model: theModel,
                        line: theLine,
                        color: theColor,
                        state: theState,
                    });

                    let soatInfo = await getSoatInfo();
                    let lastRequestInfo = await getRequestInfo();

                    await sendData('otherInfo', {
                        soat: soatInfo,
                        lastRequest: lastRequestInfo
                    })

                    await sendData('done', {
                        make: theMake,
                        model: theModel,
                        line: theLine,
                        color: theColor,
                        state: theState,
                        soat: soatInfo,
                        lastRequest: lastRequestInfo
                    });
                    // await newRequest();

                }, 500);
            });
        }


    }, 2000);

}, false);


const sendData = async(type, data) => {
    console.log(data);
    const dataToSend = {
        type: type,
        data: data
    };
    ipc.sendTo(1, 'vehicleData', dataToSend);

    // setTimeout(() => {
    //     const vehicleData = {

    //         soatState: soatState.trim(),
    //         lastRequestState: lastRequestState.trim(),
    //         lastRequestEntity: lastRequestEntity.trim()
    //     };
    //     ipc.sendTo(1, 'vehicleData', vehicleData);
    // }, 800);
};


const getVehicleMake = async() => {
    /* Get the Make of the vehicle */
    let makeXpath = "//label[text()='Marca:']";
    let matchingMakeElement = document.evaluate(makeXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let parentMakeDiv = matchingMakeElement.parentElement;
    let vehicleMake = parentMakeDiv.nextElementSibling.textContent;
    return vehicleMake.trim();
};

const getVehicleModel = async() => {
    /* Get the Model of the vehicle */
    let modelXpath = "//label[text()='Modelo:']";
    let matchingModelElement = document.evaluate(modelXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let parentModelDiv = matchingModelElement.parentElement;
    let vehicleModel = parentModelDiv.nextElementSibling.textContent;
    return vehicleModel.trim();
};

const getVehicleLine = async() => {

    /* Get the Line of the vehicle */
    let lineXpath = "//label[text()='Línea:']";
    let matchingLineElement = document.evaluate(lineXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let parentLineDiv = matchingLineElement.parentElement;
    let vehicleLine = parentLineDiv.nextElementSibling.textContent;
    return vehicleLine.trim();
};

const getVehicleColor = async() => {

    /* Get the Color of the vehicle */
    let colorXpath = "//label[text()='Color:']";
    let matchingColorElement = document.evaluate(colorXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let parentColorDiv = matchingColorElement.parentElement;
    let vehicleColor = parentColorDiv.nextElementSibling.textContent;
    return vehicleColor.trim();
};

const getSoatInfo = async() => {
    return new Promise((resolve) => {
        /* Soat */
        let soatTabXpath = "//a[text()=' Poliza SOAT']";
        let soatTab = document.evaluate(soatTabXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        soatTab.click();
        let soatState = '';
        setTimeout(() => {
            let soatXpath = "//th[text()='Número de poliza']";
            let matchingSoatElement = document.evaluate(soatXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            let parentSoatDiv = matchingSoatElement.parentElement;
            soatState = parentSoatDiv.parentElement.nextElementSibling.childNodes[2].childNodes[11].childNodes[4].textContent;
            resolve(soatState.trim());
        }, 300);
    });
};

const getVehicleState = async() => {
    /* Get the state of the vehicle */
    let stateXpath = "//label[text()='Estado del vehículo:']";
    let matchingStateElement = document.evaluate(stateXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let parentStateDiv = matchingStateElement.parentElement;
    let vehicleState = parentStateDiv.parentElement.nextElementSibling.childNodes[14].textContent;
    return vehicleState.trim();
};

const getRequestInfo = async() => {
    return new Promise((resolve) => {
        /*  Requests */
        let requestsTabXpath = "//a[text()=' Solicitudes']";
        let requests = document.evaluate(requestsTabXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        requests.click();
        let lastRequestState = '';
        let lastRequestEntity = '';
        setTimeout(() => {
            let requestXpath = "//th[text()='Entidad']";
            let matchingRequestElement = document.evaluate(requestXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            let parentRequestDiv = matchingRequestElement.parentElement;
            lastRequestState = parentRequestDiv.parentElement.nextElementSibling.childNodes[2].childNodes[5].textContent;
            lastRequestEntity = parentRequestDiv.parentElement.nextElementSibling.childNodes[2].childNodes[9].textContent;
            resolve({
                lastRequestState: lastRequestState.trim(),
                lastRequestEntity: lastRequestEntity.trim()
            });
        }, 1000);
    });
};

const newRequest = async() => {
    /*  Click the button to make another search */
    let newSearchXpath = "//button[text()='Realizar otra consulta']";
    let newSearchButton = document.evaluate(newSearchXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    newSearchButton.click();
};