const { ipcRenderer: ipc } = require('electron');
const path = require('path')


ipc.on('paynetCredentials', async(event, props) => {
    if (window.location.href === 'https://indra.paynet.com.co:14443/login.aspx') {
        ipc.sendTo(1, 'paynetLogin', true);
        // window.$ = window.jQuery = require(path.join(__dirname, '/jquery-3.5.1.min.js'));
        await setUsername(props.username);
        await setPassword(props.password);
        await login();
    }
    if (window.location.href === 'https://indra.paynet.com.co:14443/InformacionSeguridad.aspx') {
        ipc.sendTo(1, 'pinRedirect', true);
        await setTimeout(async() => {
            await navigateToPing();
        }, 1000);
    }
    if (window.location.href === 'https://indra.paynet.com.co:14443/PIN/VentaPin.aspx') {
        await setTimeout(async() => {
            ipc.sendTo(1, 'loadingPinInfo', true);
            await inputData();
        }, 1000);
    }

});

ipc.on('vehicleData', async(event, props) => {
    localStorage.setItem('vehiclePlate', props.plate);
    localStorage.setItem('documentNumber', props.documentNumber);
    localStorage.setItem('documentType', props.documentType);
    localStorage.setItem('vehicleModel', props.model);
    localStorage.setItem('vehicleType', props.vehicleType);
    localStorage.setItem('cellphone', props.cellphone);
});
/* Add listener for when the content is loaded */
document.addEventListener('DOMContentLoaded', async(event) => {

    window.$ = window.jQuery = require(path.join(__dirname, '/jquery-1.11.1.min.js'));
    if (window.location.href === 'https://indra.paynet.com.co:14443/InformacionSeguridad.aspx') {
        ipc.sendTo(1, 'pinRedirect', true);
        await setTimeout(async() => {
            await navigateToPing();
        }, 1000);
    }
    if (window.location.href === 'https://indra.paynet.com.co:14443/PIN/VentaPin.aspx') {
        await setTimeout(async() => {
            ipc.sendTo(1, 'loadingPinInfo', true);
            await inputData();
        }, 1000);
    }

}, false);

const navigateToPing = async() => {
    setTimeout(() => {
        xpath = "//a[contains(text(),'Compra PIN')]";
        matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        matchingElement.click();
    }, 1000);

};

const setUsername = async(username) => {
    const usernameInput = $('#ctl00_cph_StormLogin_UserName');
    usernameInput.val(username);
};

const inputData = async() => {

    const vehicleModel = localStorage.getItem('vehicleModel');
    const vehiclePlate = localStorage.getItem('vehiclePlate');
    const documentNumber = localStorage.getItem('documentNumber');
    const documentType = localStorage.getItem('documentType');
    const vehicleType = localStorage.getItem('vehicleType');
    const cellphone = localStorage.getItem('cellphone');

    await setModel(vehicleModel);
    await setPlate(vehiclePlate);
    await setPlateConfirmation(vehiclePlate);
    await setDocument(documentNumber);
    await setDocumentType(documentType);
    await setCellphone(cellphone);
    // await setPhone('456');
    // await setMobile('789');
    await setService(vehicleType);
    setTimeout(() => {
        const continueBtn = document.getElementById('ctl00_cph_btnSiguiente');
        continueBtn.addEventListener('click', () => {
            // Handle logic after press button to continue
        });
    }, 2000);

};

const getPinInfo = async() => {
    // Get the <th> tag 
    let xpath = "//th[text()='PIN']";
    let matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    // Get the parent <tr> tag
    let parentElement = matchingElement.parentElement;

    // Get the next <tr> tag which contain the results
    let resultsTag = parentElement.nextElementSibling

    // Get the PIN number
    let pinNumber = resultsTag.childNodes[1].childNodes[1].textContent;



};

const setPlate = async(plate) => {
    const plateInput = $('#ctl00_cph_txtPlaca');
    plateInput.val(plate);
};

const setService = async(service) => {
    let optionInput;
    switch (service) {
        case 'MOTOCICLETA':
            optionInput = $('#ctl00_cph_rblServicio_0');
            optionInput.click();
            break;
        case 'LIVIANOS PARTICULARES':
            optionInput = $('#ctl00_cph_rblServicio_1');
            optionInput.click();
            break;
        case 'PESADOS 2 EJES PARTICULARES':
            optionInput = $('#ctl00_cph_rblServicio_2');
            optionInput.click();
            break;
        case 'MOTOCARROS':
            optionInput = $('#ctl00_cph_rblServicio_3');
            optionInput.click();
            break;
        case 'LIVIANOS PUBLICOS':
            optionInput = $('#ctl00_cph_rblServicio_4');
            optionInput.click();
            break;
        case 'PESADOS 3 O MAS EJES PARTICULARES':
            optionInput = $('#ctl00_cph_rblServicio_5');
            optionInput.click();
            break;
        case 'PESADOS BIARTICULADOS PARTICULARES':
            optionInput = $('#ctl00_cph_rblServicio_6');
            optionInput.click();
            break;
        case 'PESADOS BIARTICULADOS PUBLICOS':
            optionInput = $('#ctl00_cph_rblServicio_7');
            optionInput.click();
            break;
        case 'PESADOS 3 O MAS EJES PUBLICOS':
            optionInput = $('#ctl00_cph_rblServicio_8');
            optionInput.click();
            break;
        case 'PESADOS 2 EJES PUBLICOS':
            optionInput = $('#ctl00_cph_rblServicio_9');
            optionInput.click();
            break;
        case 'MOTOCARROS LIVIANOS PARTICULARES':
            optionInput = $('#ctl00_cph_rblServicio_10');
            optionInput.click();
            break;
        case 'MOTOCARROS LIVIANOS PUBLICOS':
            optionInput = $('#ctl00_cph_rblServicio_11');
            optionInput.click();
            break;
        default:
            break;
    }
};

const setPlateConfirmation = async(plate) => {
    const plateInput = $('#ctl00_cph_txtConfirmacionPlaca');
    plateInput.val(plate);
};
const setDocument = async(document) => {
    const documentInput = $('#ctl00_cph_txtNumeroCedula');
    documentInput.val(document);
};
const setDocumentType = async(documentType) => {
    const documentTypeInput = $('#ctl00_cph_ddlTipoIdentificacion');
    documentTypeInput.val(documentType);
};

const setModel = async(model) => {
    const modelInput = $('#ctl00_cph_txtModelo');
    modelInput.val(model);
};
const setCellphone = async(cellphone) => {
    const cellphoneInput = $('#ctl00_cph_txtCelular');
    cellphoneInput.val(cellphone);
};

const setPhone = async(phone) => {
    const phoneInput = $('#ctl00_cph_txtTelefono');
    phoneInput.val(phone);
};
const setMobile = async(mobile) => {
    const mobileInput = $('#ctl00_cph_txtCelular');
    mobileInput.val(mobile);
};

const setPassword = async(password) => {
    const passwordInput = $('#ctl00_cph_StormLogin_Password');
    passwordInput.val(password);
};

const login = async() => {
    const loginBtn = $('#ctl00_cph_StormLogin_LoginButton');
    const rememberInput = document.getElementById('ctl00_cph_StormLogin_RememberMe');
    rememberInput.checked = true;
    loginBtn.click();
};