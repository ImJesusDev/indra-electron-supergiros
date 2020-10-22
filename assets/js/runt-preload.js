const { ipcRenderer: ipc } = require('electron');

/* Add listener for when the content is loaded */
document.addEventListener('DOMContentLoaded', function(event) {

    /* Add timeout to prevent errors (button not rendered) */
    setTimeout(() => {
        /* Find button to make the request for vehicle information */
        let xpath = "//button[text()='Consultar Información']";
        let matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;


        /* Plate input */
        let plate = document.getElementById('noPlaca');
        plate.value = 'HKQ558';
        plate.focus();

        /* Document number input */
        let documentNumber = document.getElementsByName('noDocumento')[0];
        documentNumber.value = '51914792';
        documentNumber.focus();

        /* Add Event on click for the button */
        matchingElement.addEventListener("click", function() {
            /* Add timeout after the button is clicked */
            setTimeout(() => {
                /* Get the Make of the vehicle */
                let makeXpath = "//label[text()='Marca:']";
                let matchingMakeElement = document.evaluate(makeXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                let parentMakeDiv = matchingMakeElement.parentElement;
                let vehicleMake = parentMakeDiv.nextElementSibling.textContent;
                console.log('La marca del vehículo es: ', vehicleMake.trim());

                /* Get the Model of the vehicle */
                let modelXpath = "//label[text()='Modelo:']";
                let matchingModelElement = document.evaluate(modelXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                let parentModelDiv = matchingModelElement.parentElement;
                let vehicleModel = parentModelDiv.nextElementSibling.textContent;
                console.log('El modelo del vehículo es: ', vehicleModel.trim());

                /* Get the Line of the vehicle */
                let lineXpath = "//label[text()='Línea:']";
                let matchingLineElement = document.evaluate(lineXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                let parentLineDiv = matchingLineElement.parentElement;
                let vehicleLine = parentLineDiv.nextElementSibling.textContent;
                console.log('La linea del vehículo es: ', vehicleLine.trim());

                /* Get the Color of the vehicle */
                let colorXpath = "//label[text()='Color:']";
                let matchingColorElement = document.evaluate(colorXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                let parentColorDiv = matchingColorElement.parentElement;
                let vehicleColor = parentColorDiv.nextElementSibling.textContent;
                console.log('El color del vehículo es: ', vehicleColor.trim());

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
                    console.log('El estado del soat es: ', soatState.trim());
                }, 300);

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
                    console.log('El estado de la ultima solicitud es: ', lastRequestState.trim());
                    console.log('Realizada en: ', lastRequestEntity.trim());
                }, 300);


                /* Get the state of the vehicle */
                let stateXpath = "//label[text()='Estado del vehículo:']";
                let matchingStateElement = document.evaluate(stateXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                let parentStateDiv = matchingStateElement.parentElement;
                let vehicleState = parentStateDiv.parentElement.nextElementSibling.childNodes[14].textContent;
                console.log('El estado del vehículo es: ', vehicleState.trim());

                setTimeout(() => {
                    const vehicleData = {
                        make: vehicleMake.trim(),
                        model: vehicleModel.trim(),
                        line: vehicleLine.trim(),
                        color: vehicleColor.trim(),
                        state: vehicleState.trim(),
                        soatState: soatState.trim(),
                        lastRequestState: lastRequestState.trim(),
                        lastRequestEntity: lastRequestEntity.trim()

                    };

                    ipc.sendTo(1, 'vehicleData', vehicleData);
                    // Realizar otra consulta
                    /*  Click the button to make another search */
                    let newSearchXpath = "//button[text()='Realizar otra consulta']";
                    let newSearchButton = document.evaluate(newSearchXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    newSearchButton.click();
                }, 800);



            }, 2500);
        });

    }, 3000);

}, false);