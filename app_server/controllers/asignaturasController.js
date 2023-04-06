var config = require('../config/config');
//var modeloUser = require('../models/userModel');
//var modeloFestividad = require('../models/festividadModel');
//var modeloAsignatura = require('../models/asignaturaModel');

var modeloPartida = require('../models/partidaModel');
var modeloTarjetas = require('../models/tarjetasModel');
var modeloAsignaturasComprada = require('../models/asignaturasCompradasModel');
var ctrlPartida = require('../controllers/partidaController');


const  mongoose = require("mongoose");



// async function isAsignatura(coord, nombreUsr){
//     try {
//         await mongoose.connect(config.db.uri, { useNewUrlParser: true, useUnifiedTopology: true });
//         console.log("Connected to MongoDB Atlas")

//         const doc = {coordenadas: coord};
//         const result = await modeloAsignatura.find(doc).exec();;

//         if (result.lenght == 0){
//             return 0;
//         }else if(result.lenght == 1){
//             console.log(result[0].nombre);

//             res.status(200).json({message: 'Asignatura Encontrada'})
//             return 1;
//         }
//     }
//     catch (error) {
//         console.error(error);
//         //res.status(500).json({error: 'Error al encontrar Asignatura'});
//         return 0;
//     }finally {
//         mongoose.disconnect();
//     }
// }

// async function isFestividad(coord){
//     try {
//         await mongoose.connect(config.db.uri, { useNewUrlParser: true, useUnifiedTopology: true });
//         console.log("Connected to MongoDB Atlas")

//         const doc = {coordenadas: coord, tipo: "Festividad"};
//         const result = await modeloFestividad.find(doc).exec();;

//         if (result.lenght == 0){
//             return 0;
//         }else if(result.lenght == 1){
//             console.log(result[0].nombre)
//             res.status(200).json({message: 'Festividad Encontrada'})
//             return 1;
//         }
//     }
//     catch (error) {
//         console.error(error);
//         //res.status(500).json({error: 'Error al encontrar Asignatura'});
//         return 0;
//     }finally {
//         mongoose.disconnect();
//     }
// }

// async function isPago(idP, coord, nombreUsr){
//     try {
//         await mongoose.connect(config.db.uri, { useNewUrlParser: true, useUnifiedTopology: true });
//         console.log("Connected to MongoDB Atlas")

//         const doc = {coordenadas: coord, tipo: "Pago"};
//         const result = await modeloPago.find(doc).exec();;

//         if (result.lenght == 0){
//             return 0;
//         }else if(result.lenght == 1){
//             console.log(result[0].nombre);
//             console.log(result[0].pago);

//             //Es una casilla de pago
//             //Obtenemos el dinero 
//             //Buscamos al usuario dentro de la partida
//             //Actualizamos su dinero (-)
//             res.status(200).json({message: 'Pago Encontrada'})
//             return 1;
//         }
//     }
//     catch (error) {
//         console.error(error);
//         //res.status(500).json({error: 'Error al encontrar Asignatura'});
//         return 0;
//     }finally {
//         mongoose.disconnect();
//     }
// }

// async function isCobro(coord){
//     try {
//         await mongoose.connect(config.db.uri, { useNewUrlParser: true, useUnifiedTopology: true });
//         console.log("Connected to MongoDB Atlas")

//         const doc = {coordenadas: coord, tipo: "Cobro"};
//         const result = await modeloPago.find(doc).exec();;

//         if (result.lenght == 0){
//             return 0;
//         }else if(result.lenght == 1){
//             console.log(result[0].nombre);
//             console.log(result[0].cobro);

//             //Es una casilla de cobro
//             //Obtenemos el dinero 
//             //Buscamos al usuario
//             //Actualizamos su dinero (+)
//             res.status(200).json({message: 'Cobro Encontrado'})
//             return 1;
//         }
//     }
//     catch (error) {
//         console.error(error);
//         //res.status(500).json({error: 'Error al encontrar Asignatura'});
//         return 0;
//     }finally {
//         mongoose.disconnect();
//     }
// }
/**
 * 
 * @param {*} req 
 * @param {*} res Devuelve una tarjeta aleatoria.
 */
async function tarjetaAleatoria(req,res){
    console.log("***METHOD GET Para obtener tarjeta aleatoria ");
    try {
        await mongoose.connect(config.db.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB Atlas")

        const resultado = await modeloTarjetas.aggregate([{$sample: {size: 1}}]).exec();
        res.status(200).json(resultado); 
      } catch (error) {
        console.log(error);
        res.status(500).json({mensaje: 'Error al obtener tarjeta aleatoria'});
      }finally {
        mongoose.disconnect();
        console.log("DisConnected to MongoDB Atlas")
    }

}
/**
 * 
 * @param {*} coordenadas Coordenadas de la casilla donde ha caido el jugador 
 * @param {*} res 
 */
async function estaComprada(coordenadas,res){
    console.log("***METHOD Para saber si esta comprada");

    try {
        await mongoose.connect(config.db.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB Atlas")

        const casillaComprada = await modeloAsignaturasComprada.findOne({coordenadas: coordenadas}).exec();
        console.log(coordenadas);

        if(casillaComprada != null){
            //Esa casilla esa comprada
            res.status(200).json("La casilla esta comprada");
            res.json(casillaComprada);
            return 1;
        }else{
            //Esa casilla no esta comprada
            res.status(200).json("La casilla no esta comprada"); 
            return 0;
        }
     
      } catch (error) {
        console.log(error);
        res.status(500).json({mensaje: 'Error al saber si la casilla esta comprada o no'});
      }finally {
        mongoose.disconnect();
        console.log("DisConnected to MongoDB Atlas")
    }





}

/**
 * 
 * @param {*} req.body.username Nombre de usuario del jugador.
 * @param {*} req.body.coordenadas Coordenadas de la casilla donde ha caido el jugador 
 * @param {*} res 
 */
async function operativaCasilla(req, res){
    if(estaComprada(req.body.coordenadas, res)){
        console.log("El jugador", req.body.username, "esta en la casilla comprada tiene que pagar");
        console.log(res.casillaComprada);
        //Si la casilla esta comprada habrá que quitarle dinero al jugador y añadirselo al propietario
    }else{
        console.log("El jugador", req.body.username, "no tiene que pagar");
    }

}


async function checkCasilla(req, res){
    //info asignatura son casillas
    console.log("***METHOD Para chequear casilla ");
    //var partidaEncontrada = ctrlPartida.findPartida(req.body.idPartida);
    
    await mongoose.connect(config.db.uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB Atlas")
    const partidaEncontrada = await modeloPartida.findOne({id: req.body.idPartida}).exec();
    console.log(req.body.idPartida);
    
    console.log(partidaEncontrada);

    try {
        if(partidaEncontrada != null){

    
            const posicion = partidaEncontrada.nombreJugadores.indexOf(req.body.username);
            partidaEncontrada.dineroJugadores[posicion] = partidaEncontrada.dineroJugadores[posicion] + 100;

            await mongoose.connect(config.db.uri, { useNewUrlParser: true, useUnifiedTopology: true });
            console.log("Connected to MongoDB Atlas")

            const result = await modeloPartida.updateOne({ id: req.body.idPartida},  { $set: { dineroJugadores: partidaEncontrada.dineroJugadores }})
            
            if(result.modifiedCount == 1) {
                console.log(result);
                console.log("Se ha actualizado la partida correctamente");
                res.status(200).json("Se ha actualizado la partida correctamente"); 
            }else {
                //console.error(error);
                console.log(result);
                //TODO:Probar que si se quita este lo coge el otro
                res.status(500).json({ error: 'Error al actualizar la partida '});
            }
        }else{
            console.log("Partida Encontrada null");
            res.status(500).json({error: 'Error al encontrar la partida'});
        }
        
        
        //me pasan las coordenadas
        //miro que es
        // await modeloUser.find();
        // console.log('Usuario leido correctamente')
        // res.status(200).json({message: 'Usuario creado correctamente'})
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error al checkCasilla'});
    }finally {
        mongoose.disconnect();
        console.log("DisConnected to MongoDB Atlas")
    }

}

module.exports = {checkCasilla, tarjetaAleatoria, operativaCasilla};
