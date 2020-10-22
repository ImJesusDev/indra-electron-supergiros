const { ipcRenderer: ipc } = require('electron');
/* Alerts */
const Swal = require('sweetalert2')

function goToRunt() {
    console.log('here');
    $('#form-container').hide();
    $('#runt-webview').show();
};

const webview = document.getElementById('runt-webview');

setTimeout(() => {
    webview.openDevTools();
}, 500);



ipc.on('vehicleData', (event, props) => {
    console.log(props);
    Swal.fire({
        title: 'Información obtenida!',
        text: 'Se ha consultado la informacion correctamente',
        html: `
            <ul>
                <li> Marca: ${props.make} </li>
                <li> Modelo: ${props.model} </li>
                <li> Color: ${props.color}</li>
                <li> Linea:${props.line} </li>
                <li> Estado de Vehiculo: ${props.state}</li>
                <li> Estado Soat: ${props.soatState} </li>
                <li> Estado Ultima Solicitud: ${props.lastRequestState}</li>
                <li> Entidad Ultima Solicitud: ${props.lastRequestEntity}</li>
            </ul>
        `,
        icon: 'success'
    });

    $('#form-container').show();
    $('#runt-webview').hide();
    console.log(`Message received from webview ${JSON.stringify(props)}`);
});