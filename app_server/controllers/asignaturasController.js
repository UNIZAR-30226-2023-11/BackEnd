var config = require('../config/config');
//var modeloUser = require('../models/userModel');
var modeloFestividad = require('../models/festividadModel');
var modeloAsignatura = require('../models/asignaturaModel');

var modeloPartida = require('../models/partidaModel');
var modeloTarjetas = require('../models/tarjetasModel');
var modeloAsignaturasComprada = require('../models/asignaturasCompradasModel');
var modeloCasilla = require('../models/casillaModel');
var modeloImpuesto = require('../models/impuestoModel');

var ctrlPartida = require('../controllers/partidaController');


const  mongoose = require("mongoose");

async function actualizarPosicion(idPartida, coordenadas, jugador,res){
    console.log("METHOD actualizarPosicion");

    const partida = await ctrlPartida.findPartida(idPartida, res);
    
    console.log(partida);
    try {
        const posicion = partida.nombreJugadores.indexOf(jugador);
        partida.posicionJugadores[posicion] = coordenadas;
    
        await mongoose.connect(config.db.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB Atlas");
        
        const result = await modeloPartida.updateOne({ id: partida.id},  { $set: { posicionJugadores: partida.posicionJugadores }})
        
        if(result.modifiedCount == 1) {
            console.log(result);
            console.log("Se ha actualizado la partida correctamente al cambiar de posición");
            //res.status(200).json("Se ha actualizado correctamente al cambiar de posición"); 
        }

    }
    catch (error) {
        console.error(error);
        //res.status(500).json({ error: 'Error al actualizar la partida al cambiar la posicion'});
        
    }finally {
        mongoose.disconnect();
        console.log("Disconnected to MongoDB Atlas")

    }

}
/**
 * 
 * @param {*} partida Partida de tipo modeloPartida
 * @param {*} casilla Casilla de tipo modeloCasilla
 * @param {*} jugador Jugador que paga
 * @param {*} res 
 */
async function pagar(partida, dinero, jugador, res){
    console.log("METHOD PAGAR");

    console.log(partida);

    try {
        const posicion = partida.nombreJugadores.indexOf(jugador);
        partida.dineroJugadores[posicion] = partida.dineroJugadores[posicion] - dinero;
    
        await mongoose.connect(config.db.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB Atlas")
    
        const result = await modeloPartida.updateOne({ id: partida.id},  { $set: { dineroJugadores: partida.dineroJugadores }})
        
        if(result.modifiedCount == 1) {
            console.log(result);
            console.log("Se ha actualizado la partida correctamente al pagar");
            //res.status(200).json("Se ha actualizado la partida correctamente al pagar"); 
        }
        // else {
        //     console.error(error);
        //     res.status(500).json({ error: 'Error al actualizar la partida al pagar'});
        // } 
    }
    catch (error) {
        console.error(error);
        console.log("Error al actualizar la partida al pagar");
        //res.status(500).json({ error: 'Error al actualizar la partida al pagar'});
        
    }finally {
        mongoose.disconnect();
        console.log("Disconnected to MongoDB Atlas")

    }
}

/**
 * 
 * @param {*} partida Partida de tipo modeloPartida
 * @param {*} casilla Casilla de tipo modeloCasilla
 * @param {*} jugador Jugador que cobra
 * @param {*} res 
 */
async function cobrar(partida, dinero, jugador){

    try {
        const posicion = partida.nombreJugadores.indexOf(jugador);
        partida.dineroJugadores[posicion] = partida.dineroJugadores[posicion] + dinero;
    
        await mongoose.connect(config.db.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB Atlas")
    
        const result = await modeloPartida.updateOne({ id: partida.id},  { $set: { dineroJugadores: partida.dineroJugadores }})
        
        if(result.modifiedCount == 1) {
            console.log(result);
            console.log("Se ha actualizado la partida correctamente al cobrar");
            //res.status(200).json("Se ha actualizado la partida correctamente al cobrar"); 
        }else {
            
            console.error(error);
            //res.status(500).json({ error: 'Error al actualizar la partida al cobrar'});
        } 
    }
    catch (error) {
        console.error(error);
        console.log("Error al cobrar");
        //res.status(500).json({error: 'Error al cobrar'});
        
    }finally {
        mongoose.disconnect();
        console.log("Disconnected to MongoDB Atlas")

    }
}

/**
 * FUNCIONA
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
 * FUNCIONA
 * @param {*} coordenadas Coordenadas de la casilla donde ha caido el jugador 
 * @param {*} res 
 */
async function estaComprada(coordenadas){
    console.log("***METHOD Para saber si esta comprada");

    try {
        await mongoose.connect(config.db.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB Atlas")

        const casillaComprada = await modeloAsignaturasComprada.findOne({coordenadas: coordenadas}).exec();
        console.log(coordenadas);
        console.log(casillaComprada);

        if(casillaComprada != null){
            //Esa casilla esa comprada
            //res.status(200).json("La casilla esta comprada");
            console.log("La casilla esta comprada")
            return casillaComprada;
        }else{
            //Esa casilla no esta comprada
            //res.status(200).json("La casilla no esta comprada"); 
            console.log("La casilla no esta comprada")
            return null;
        }
     
      } catch (error) {
        console.log(error);
        console.log('Error al saber si la casilla esta comprada o no');

        //res.status(500).json({mensaje: 'Error al saber si la casilla esta comprada o no'});
      }finally {
        mongoose.disconnect();
        console.log("DisConnected to MongoDB Atlas")
    }
}

/**
 * 
 * @param {*} req.body.username Jugador que desea comprar la casilla
 * @param {*} req.body.coordenadas Corrdenadas de la casilla a comprar
 * @param {*} req.bosy.idPartida Identificador del número de la partida 
 * @param {*} res 
 */
async function comprarCasilla(req, res){
    
    //Le restamos el dinero que cuesta al usuario
    //Buscar la casilla y obtener el precio de compra
    const casilla = await findCasilla(req.body.coordenadas);
    if (casilla != null){
        //Existe la casilla
        const partida = await ctrlPartida.findPartida(req.body.idPartida, res);
        if(partida != null){
            //Restamos el dinero al jugador y actualizamos el dinero en la partida
            await pagar(partida, casilla.precioCompra, req.body.username, res);
            
            //Miramos el tipo de casilla que es A,F,I,X
            //La metemos en la tabla de casillas compradas
            var casillaComprada = null;
            if( casilla.tipo == "A"){
                 casillaComprada = await isAsignatura(req.body.coordenadas);
            }else if(casilla.tipo == "F"){
                 casillaComprada = await isFestividad(req.body.coordenadas);
            }else if(casilla.tipo == "I"){
                 casillaComprada = await isImpuesto(req.body.coordenadas);
            }
            
            const doc = new modeloAsignaturasComprada ({
                coordenadas: casillaComprada.coordenadas, 
                partida: req.body.idPartida,
                jugador: req.body.username,
                precio: casillaComprada.matricula
            });

            try {
                await mongoose.connect(config.db.uri, { useNewUrlParser: true, useUnifiedTopology: true });
                console.log("Connected to MongoDB Atlas")
        
                await doc.save();
                console.log('Documento guardado correctamente');
                res.status(201).json({message: 'Asignatura comprada insertada correctamente'});
            }catch (error) {
                console.error(error);
                res.status(500).json({error: 'Error al crear partida',  nombreJugadores: req.body.username, posicionJugadores: 1010, dineroJugadores: 0});
            }finally {
                mongoose.disconnect();
                console.log("DisConnected to MongoDB Atlas")
            }


        }else {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar la partida  al comprar una casilla'});
        }

    }else{
        res.status(404).json("La casilla no existe");
    }

    

}

/**
 * 
 * @param {*} req.body.username Nombre de usuario del jugador.
 * @param {*} req.body.coordenadas Coordenadas de la casilla donde ha caido el jugador 
 * @param {*} req.body.idPartida 
 * @param {*} res 
 */
async function checkCasilla(req, res){
    //ACTUALIZAMOS LA POSICION DEL JUGADOR

    await actualizarPosicion(req.body.idPartida, req.body.coordenadas, req.body.username,res);
    //MIramos si esta comprada
    const comprada = await estaComprada(req.body.coordenadas, res);
    if(comprada != null){
        const partida = await ctrlPartida.findPartida(req.body.idPartida, res);
        if(partida != null){
            console.log("El jugador", req.body.username, "esta en la casilla comprada tiene que pagar");
            console.log(comprada);
            //Si la casilla esta comprada habrá que quitarle dinero al jugador y añadirselo al propietario
            //hay que comprobar que no esta comprada por el propio jugador
            if(comprada.jugador != req.body.username){
                await pagar(partida, comprada.precio, req.body.username, res);
                await cobrar(partida, comprada.precio,comprada.jugador , res);
                
                res.status(200).json({message: 'Se ha pagado lo que se debia'});
            }else{
                console.log("Esta casilla es mia", req.body.username, req.body.coordenadas);
                res.status(200).json({message: 'Esta asignatura es mia no tengo que hacer nada'});

            }

        }else {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar la partida  al pagar la matricula'});
            console.log('Error al actualizar la partida  al pagar la matricula');
        }
        

    }else{
        console.log("El jugador", req.body.username, "no tiene que pagar Y PUEDE COMPRARLA");
        //Puede Comprarla
        res.status(200).json({message: 'Esta asignatura se puede comprar'});
    }
    //Si no esta comprada miramos si es una casilla que tiene que pagar o le dan dinero

}

/**
 * 
 * @param {*} coordenadas Coordenadas de la casilla a buscar
 * @returns Devuelve una casilla de tipo modeloAsignatura o null
 */
async function isAsignatura(coordenadas){
    console.log("*** METHOD FIND asignatura");

    try {
        await mongoose.connect(config.db.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB Atlas");
        
        const casillaEncontrada = await modeloAsignatura.findOne({coordenadas: coordenadas}).exec();
        console.log(coordenadas);
        console.log(casillaEncontrada);
        if(casillaEncontrada ){
            return casillaEncontrada;
        } else {
            console.log("Casilla no encontrada asignatura");
            return null;
        }
        
    }
    catch (error) {
        console.error(error);
        console.log('Error al encontrar la casilla asignatura');
        res.status(500).json({error: 'Error al encontrar la casilla asignatura'});
        return null;
    }finally {
        mongoose.disconnect();
        console.log("DisConnected to MongoDB Atlas")
    }
}

/**
 * 
 * @param {*} coordenadas Coordinadas de la casilla a buscar
 * @returns Devuelve una casilla de tipo modeloFestividad o null
 */
async function isFestividad(coordenadas){
    console.log("*** METHOD FIND festividad");
    try {
        await mongoose.connect(config.db.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB Atlas");
        
        const casillaEncontrada = await modeloFestividad.findOne({coordenadas: coordenadas}).exec();
        console.log(coordenadas);
        console.log(casillaEncontrada);
        if(casillaEncontrada ){
            return casillaEncontrada;
        } else {
            console.log("Casilla no encontrada festividad");
            return null;
        }
        
    }
    catch (error) {
        console.error(error);
        console.log('Error al encontrar la casilla asignatura');
        res.status(500).json({error: 'Error al encontrar la casilla asignatura'});
        return null;
    }finally {
        mongoose.disconnect();
        console.log("DisConnected to MongoDB Atlas")
    }
}

/**
 * 
 * @param {*} coordenadas Coordenadas de la casilla a buscar
 * @returns Devuelve una casilla de tipo modeloImpuesto o null
 */

async function isImpuesto(coordenadas){
    console.log("*** METHOD FIND impuesto");
    try {
        await mongoose.connect(config.db.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB Atlas");
        
        const casillaEncontrada = await modeloImpuesto.findOne({coordenadas: coordenadas}).exec();
        console.log(coordenadas);
        console.log(casillaEncontrada);
        if(casillaEncontrada ){
            return casillaEncontrada;
        } else {
            console.log("Casilla no encontrada impuesto");
            return null;
        }
        
    }
    catch (error) {
        console.error(error);
        console.log('Error al encontrar la casilla impuesto');
        res.status(500).json({error: 'Error al encontrar la casilla impuesto'});
        return null;
    }finally {
        mongoose.disconnect();
        console.log("DisConnected to MongoDB Atlas")
    }
}

/**
 * 
 * @param {*} coordenadas Coordenadas de la casilla a buscar
 * @returns Devuelve una casilla de tipo modeloCasilla o null
 */
async function findCasilla(coordenadas){
    console.log("*** METHOD Find partida");

    try {
        await mongoose.connect(config.db.uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB Atlas");
        const casillaEncontrada = await modeloCasilla.findOne({coordenadas: coordenadas}).exec();
        console.log(coordenadas);
        console.log(casillaEncontrada);
        if(casillaEncontrada ){
            return casillaEncontrada;
        } else {
            console.log("Casilla no encontrada");
            return null;
        }
        
    }
    catch (error) {
        console.error(error);
        console.log('Error al encontrar la casilla');
        res.status(500).json({error: 'Error al encontrar la casilla'});
        return null;
    }finally {
        mongoose.disconnect();
        console.log("DisConnected to MongoDB Atlas")
    }
}

module.exports = {checkCasilla, tarjetaAleatoria, comprarCasilla};
