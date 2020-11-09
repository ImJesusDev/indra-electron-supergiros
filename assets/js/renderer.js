const { ipcRenderer: ipc } = require('electron');
/* Alerts */
const Swal = require('sweetalert2')
async function openSettings() {
    const savedCredentials = localStorage.getItem('paynet-credentials');
    const parsedValues = JSON.parse(savedCredentials);
    
    
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
    })
    if (formValues && formValues.username && formValues.password) {
        localStorage.setItem('paynet-credentials', JSON.stringify(formValues));
    }
}
function goToRunt() {
    $('#form-container').hide();
    $('#runt-webview').show();
    /* Store the value of the selected vehicle type */
    const vehicleType = $('#vehicle-type-select');
    localStorage.setItem('vehicle-type', vehicleType.val());
};

const runtWebview = document.getElementById('runt-webview');
const paynetWebview = document.getElementById('paynet-webview');

const sendVehicleData = async() => {
    const documentType = localStorage.getItem('document-type');
    const plate = localStorage.getItem('plate');
    const documentNumber = localStorage.getItem('document-number');
    const model = localStorage.getItem('vehicle-model');
    const vehicleType = localStorage.getItem('vehicle-type');
    paynetWebview.send('vehicleData', {
        documentNumber: documentNumber,
        plate: plate,
        documentType: documentType,
        model: model,
        vehicleType: vehicleType
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
    // runtWebview.openDevTools();
    // paynetWebview.openDevTools();
}, 500);

ipc.on('runtFormData', (event, props) => {
    localStorage.setItem('document-type', props.documentType);
    localStorage.setItem('plate', props.plate);
    localStorage.setItem('document-number', props.documentNumber);
});
ipc.on('paynetLogin', (event, props) => {
    $('#status-report').html('');
    var statusContent = '<span>Iniciando Sesión!</span>';
    $('#status-report').append(statusContent);

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
    $('#status-report').show();
    $('#status-report').html('');
    if (props.type === 'vehicleInfo') {
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
        $('#status-report').html('');
        var statusContent = '<span>Información obtenida, realizando redirección a Paynet</span>';
        $('#status-report').append(statusContent);
        setTimeout(async() => {
            $('#runt-webview').hide();
            $('#paynet-webview').show();
            runtWebview.send('newRequest', true);
            await checkPaynetCredentials();
            await sendVehicleData();
        }, 2000);
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