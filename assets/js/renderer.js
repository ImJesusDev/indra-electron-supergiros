/* IPC */
const { ipcRenderer: ipc } = require('electron');
/* Alerts */
const Swal = require('sweetalert2');
/* Runt */
const runtWebview = document.getElementById('runt-webview');
/* Paynet */
const paynetWebview = document.getElementById('paynet-webview');

async function openSettings() {

    const savedCredentials = localStorage.getItem('paynet-credentials');
    const parsedValues = JSON.parse(savedCredentials)
    const { value: formValues } = await Swal.fire({
        title: 'Credenciales Paynet.',
        html: `
        <div class="w-full">
            <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                        Nombre de Usuario
                    </label>
                    <input value=${parsedValues.username} required id="username" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Nombre de Usuario">
                </div>
                <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                        Clave
                    </label>
                    <input value=${parsedValues.password} required id="password" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************">
                </div>
            </form>
        </div>`,
        focusConfirm: false,
        preConfirm: () => {
            return {
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            }
        }
    });

    if (formValues && formValues.username && formValues.password) {
        localStorage.setItem('paynet-credentials', JSON.stringify(formValues));
    }
}

function goToRunt() {
    $('#initial-form').hide();
    $('#runt-webview').show();
    $('#initial-step').removeClass('current').addClass('done');
    $('#runt-step').addClass('current');
    /* Store the value of the selected vehicle type */
    const plate = $('#vehicle-plate');
    const documentNumber = $('#document-number');
    const documentType = $('#document-type');
    const cellphone = $('#cellphone');
    const revisionType = $('#revision-type');
    const vehicleType = $('#vehicle-type-select');
    localStorage.setItem('vehicle-type', vehicleType.val());
    localStorage.setItem('vehicle-plate', plate.val());
    localStorage.setItem('document-number', documentNumber.val());
    localStorage.setItem('document-type', documentType.val());
    localStorage.setItem('cellphone', cellphone.val());
    localStorage.setItem('revision-type', revisionType.val());
    const formData = {
        'plate': plate.val(),
        'documentType': documentType.val(),
        'documentNumber': documentNumber.val()
    };
    runtWebview.send('runt-form-data', formData);
};

function sicovInputChange() {
    const sicovUsername = $('#sicov-username');
    const sicovPassword = $('#sicov-password');
    if (sicovUsername.val() && sicovPassword.val()) {
        $('#sicov-btn-disabled').hide();
        $('#sicov-btn-enabled').show();
    }
}

function initialFormChange() {
    const plate = $('#vehicle-plate');
    const documentNumber = $('#document-number');
    const documentType = $('#document-type');
    const cellphone = $('#cellphone');
    const revisionType = $('#revision-type');
    const vehicleType = $('#vehicle-type-select');
    if (revisionType.val()) {
        $('#revision-type').css("color", "black");
    } else {
        $('#revision-type').css("color", "#bfbfc7");
    }
    if (documentType.val()) {
        $('#document-type').css("color", "black");
    } else {
        $('#document-type').css("color", "#bfbfc7");
    }
    if (vehicleType.val()) {
        $('#vehicle-type-select').css("color", "black");
    } else {
        $('#vehicle-type-select').css("color", "#bfbfc7");
    }
    if (plate.val() && documentNumber.val() && cellphone.val() && documentType.val() && revisionType.val() && vehicleType.val()) {
        $('#continue-disabled').hide();
        $('#continue-img').show();
    } else {
        $('#continue-disabled').show();
        $('#continue-img').hide();
    }
}

function showForm() {
    $('#login-container').hide();
    $('#form-container').show();
    /* Store the value of the selected vehicle type */
    const sicovUsername = $('#sicov-username');
    const sicovPassword = $('#sicov-password');
    localStorage.setItem('sicov-username', sicovUsername.val());
    localStorage.setItem('sicov-password', sicovPassword.val());
};

const sendVehicleData = async() => {
    const documentType = localStorage.getItem('document-type');
    const plate = localStorage.getItem('plate');
    const documentNumber = localStorage.getItem('document-number');
    const model = localStorage.getItem('vehicle-model');
    const vehicleType = localStorage.getItem('vehicle-type');
    const cellphone = localStorage.getItem('cellphone');
    paynetWebview.send('vehicleData', {
        documentNumber: documentNumber,
        plate: plate,
        documentType: documentType,
        model: model,
        vehicleType: vehicleType,
        cellphone: cellphone
    });
};

const checkPaynetCredentials = async() => {
    let credentials = localStorage.getItem('paynet-credentials');
    if (!credentials) {
        const { value: formValues } = await Swal.fire({
            title: 'Es la primera vez que usas la aplicacion, por favor ingresa tus credenciales Paynet.',
            html: `
            <div class="w-full">
                <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                            Nombre de Usuario
                        </label>
                        <input required id="username" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Nombre de Usuario">
                    </div>
                    <div class="mb-6">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                            Clave
                        </label>
                        <input required id="password" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************">
                    </div>
                </form>
            </div>`,
            focusConfirm: false,
            preConfirm: () => {
                return {
                    username: document.getElementById('username').value,
                    password: document.getElementById('password').value
                }
            }
        })
        if (formValues && formValues.username && formValues.password) {
            localStorage.setItem('paynet-credentials', JSON.stringify(formValues));
            paynetWebview.send('paynetCredentials', formValues);
            sendVehicleData();
        }
    } else {
        paynetWebview.send('paynetCredentials', JSON.parse(credentials));
        sendVehicleData();
    }

};


setTimeout(async() => {
    runtWebview.openDevTools();
    // paynetWebview.openDevTools();
}, 500);

// ipc.on('runtFormData', (event, props) => {
//     localStorage.setItem('document-type', props.documentType);
//     localStorage.setItem('plate', props.plate);
//     localStorage.setItem('document-number', props.documentNumber);
// });

ipc.on('paynetLogin', (event, props) => {
    $('#status-report').html('');
    var statusContent = '<span>Iniciando Sesión!</span>';
    $('#status-report').append(statusContent);

});
ipc.on('runt-error', (event, props) => {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ha ocurrido un error.',
        confirmButtonText: 'Reintentar',
    }).then(async() => {
        $('#status-report').html('');
        $('#status-report').hide();
        $('#runt-webview').hide();
        $('#runt-webview').attr('src', 'https://www.runt.com.co/consultaCiudadana/#/consultaVehiculo');
        $('#initial-form').show();
        $('#runt-step').removeClass('current');
        $('#initial-step').addClass('current').removeClass('done');

    })

});


ipc.on('pinRedirect', (event, props) => {
    $('#status-report').html('');
    var statusContent = '<span>Redireccionado a compra de PIN</span>';
    $('#status-report').append(statusContent);

});
ipc.on('loadingPinInfo', (event, props) => {
    $('#status-report').html('');
    var statusContent = '<span>Ingresando información</span>';
    $('#status-report').append(statusContent);
    setTimeout(() => {
        $('#status-report').hide();
    }, 600);

});

ipc.on('vehicleData', (event, props) => {
    if (props.type === 'vehicleInfo') {
        $('#status-report').show();
        $('#status-report').html('');
        var statusContent = '<span>Consultando Informacion del Vehiculo!</span>';
        localStorage.setItem('vehicle-model', props.data.model);
        $('#status-report').append(statusContent);
    }
    if (props.type === 'otherInfo') {
        $('#status-report').html('');
        var statusContent = '<span>Consultando Informacion Adicional!</span>';
        $('#status-report').append(statusContent);
    }

    if (props.type === 'done') {
        console.log('done', props);
        setTimeout(async() => {
            console.log('inside async', props);
            $('#status-report').html('');
            $('#status-report').hide();
            Swal.fire({
                title: 'Información obtenida!',
                text: "Se ha consultado la información correctamente. ¿Desea continuar a Paynet?",
                icon: 'success',
                html: `
                <ul>
                    <li> Marca: ${props.data.make} </li>
                    <li> Modelo: ${props.data.model} </li>
                    <li> Color: ${props.data.color}</li>
                    <li> Linea:${props.data.line} </li>
                    <li> Estado de Vehículo: ${props.data.state}</li>
                    <li> Estado Soat: ${props.data.soat} </li>
                    <li> Estado Ultima Solicitud: ${props.data.lastRequest.lastRequestState}</li>
                    <li> Entidad Ultima Solicitud: ${props.data.lastRequest.lastRequestEntity}</li>
                </ul>
                `,
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Continuar a Paynet',
                cancelButtonText: 'Cancelar'
            }).then(async(result) => {
                if (result.isConfirmed) {
                    $('#status-report').show();
                    $('#status-report').html('');
                    var statusContent = '<span>Cargando Paynet</span>';
                    $('#status-report').append(statusContent);
                    $('#runt-webview').hide();
                    $('#paynet-webview').show();
                    $('#runt-step').removeClass('current').addClass('done');
                    $('#paynet-step').addClass('current');
                    runtWebview.send('newRequest', true);
                    await checkPaynetCredentials();
                    // await sendVehicleData();
                }
            })


        }, 1500);
    }


    // Swal.fire({
    //     title: 'Información obtenida!',
    //     text: 'Se ha consultado la informacion correctamente',
    //     html: `
    //         <ul>
    //             <li> Marca: ${props.make} </li>
    //             <li> Modelo: ${props.model} </li>
    //             <li> Color: ${props.color}</li>
    //             <li> Linea:${props.line} </li>
    //             <li> Estado de Vehiculo: ${props.state}</li>
    //             <li> Estado Soat: ${props.soatState} </li>
    //             <li> Estado Ultima Solicitud: ${props.lastRequestState}</li>
    //             <li> Entidad Ultima Solicitud: ${props.lastRequestEntity}</li>
    //         </ul>
    //     `,
    //     icon: 'success'
    // });

    // $('#form-container').show();

});