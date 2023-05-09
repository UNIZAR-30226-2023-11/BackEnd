const http = require('http');
// const server = http.createServer();
const server = http.createServer((req, res) => {
  if (req.url === 'toothless.nerks.net') {
    res.writeHead(301, { 'Location': 'monopoly.nerks.net' });
    res.end();
  } else if (req.url === 'monopoly.nerks.net') {
    res.write('This is the new page');
    res.end();
  } else {
    res.write('Hello, world!');
    res.end();
  }
});
const io = require('socket.io')(server);
const w = require('./winston')
const g = require('./mensajes')

var usersController = require('./controllers/usersController');
var partidaController = require('./controllers/partidaController');
var tiendaController = require('./controllers/tiendaController');
var asignaturasController = require('./controllers/asignaturasController');
var cartasController = require('./controllers/cartasController');
// Declara un objeto para guardar las conexiones
const clientes = {};

var num = 0;
io.on('connection', (socket) => {
  w.logger.verbose('Usuario conectado');
  w.logger.verbose('Numero de usuarios conectados ' + num);
  io.emit('mensaje', 'Bienvenido al servidor Socket.IO');
  num++;
  // Guarda la conexión en el objeto connections
  const name = socket.handshake.query.name;
  //clientes[socket.id] = socket;

  // // Guarda la conexión en el objeto clientes junto con el nombre de usuario
  clientes[socket.id] = {
    socket: socket,
    username: name,
    partidaActiva: 0 // aquí puedes inicializar el nombre de usuario con null
    //otherData: '...'
  };
  w.logger.verbose('Se ha conectado el usuario: ' + clientes[socket.id].socket.id + ' ' + clientes[socket.id].username);

  socket.on('login', async (data, ack) => {
    const socketId = data.socketId;
    w.logger.verbose('INICIO DE SESION ' + socketId);
    var login = await usersController.loginUser(data.username, data.password);

    if (login != 1 && login != 2) {
      w.logger.verbose('Usuario ha iniciado sesion correctamente\n', data.username);
      //io.to(socketId).emit('mensaje', 'Usuario ha iniciado sesion correctamente');
      clientes[socketId].username = data.username;
      clientes[socketId].socket = socketId;
      //ack('0 Ok');
    }
    var m = {
      cod: login,
      msg: g.generarMsg(login, "Credenciales incorrectas")
    }
    //ack(login + msg);
    ack(m);
  });

  socket.on('nombreInvitado', async (data, ack) => {
    const socketId = data.socketId;
    w.logger.verbose('Invitado ' + socketId);

    clientes[socketId].username = data.username;
    var m = {
      cod: 0,
      msg: g.generarMsg(0, "")
    }
    //ack(login + msg);
    ack(m);
  });

  socket.on('register', async (data, ack) => {
    w.logger.verbose('REGISTRO DE USUARIO');
    const socketId = data.socketId;
    var reg = await usersController.registerUser(data.username, data.password, data.confirm_password, data.email);

    if (reg != 1 && reg != 2) {
      w.logger.verbose('Usuario se ha registrado correctamente');
      io.to(socketId).emit('mensaje', 'Usuario se ha registrado correctamente');
      clientes[socketId].username = data.username;
      clientes[socketId].socket = socketId;
    }
    var m = {
      cod: reg,
      msg: g.generarMsg(reg, "")
    }
    //ack(login + msg);
    ack(m);
  });

  socket.on('deleteUser', async (data, ack) => {
    w.logger.verbose('Eliminacion de usuario');
    const socketId = data.socketId;
    var del = await usersController.deleteUser(clientes[socketId].username);

    if (del != 1 && del != 2) {
      w.logger.verbose('Usuario se ha eliminado correctamente');
      //ack('0 Ok');
      //io.to(socketId).emit('mensaje', 'Usuario se ha eliminado correctamente');
    }
    var m = {
      cod: del,
      msg: g.generarMsg(del, "")
    }
    ack(m);
  });

  socket.on('updateCorreo', async (data, ack) => {
    w.logger.verbose('Actualización del correo');
    const socketId = data.socketId;
    var up = await usersController.updateCorreo(clientes[socketId].username, data.email);
    if (up != 1 && up != 2) {
      w.logger.verbose('Usuario se ha actualizado el correo correctamente');
      //io.to(socketId).emit('mensaje', 'Usuario se ha actualizado el correo correctamente');
      //ack('0 Ok');
    }
    var m = {
      cod: up,
      msg: g.generarMsg(up, "")
    }
    ack(m);
  });

  socket.on('updatePassword', async (data, ack) => {
    w.logger.verbose('Actualización de contraseña');
    const socketId = data.socketId;
    var up = await usersController.updatePassword(clientes[socketId].username, data.password, data.confirm_password);

    if (up != 1 && up != 2) {
      w.logger.verbose('Usuario se ha actualizado la contraseña correctamente');
      //io.to(socketId).emit('mensaje', 'Usuario se ha actualizado el correo correctamente');

    }
    var m = {
      cod: up,
      msg: g.generarMsg(up, "")
    }
    ack(m);
  });

  //CORRECTA
  socket.on('updateUsername', async (data, ack) => {
    w.logger.verbose('Actualización del nombre de usuario');
    const socketId = data.socketId;
    var up = await usersController.updateUsername(clientes[socketId].username, data.newusername);
    if (up != 1 && up != 2) {
      w.logger.verbose('Actualizado nombre de usuario');
      io.emit('mensaje', "Actualizado nombre de usuario");
      clientes[socket.id].username = data.newusername;
      w.logger.error(clientes[socket.id].username);
      //ack('0 Ok');
    }
    var m = {
      cod: up,
      msg: g.generarMsg(up, "")
    }
    ack(m);
  });

  //CORRECTA
  socket.on('infoUsuario', async (data, ack) => {
    //FIXME: no devolver contraseña
    w.logger.verbose('Obtener el correo de un usuario');
    const socketId = data.socketId;
    var usuario = await usersController.infoUsuario(clientes[socketId].username);

    // var imagen = await usersController.devolverImagenPerfil(clientes[socketId].username);

    var msg;
    if (usuario != 1 && usuario != 2) {
      w.logger.verbose('Usuario obtenido:' + usuario);
      msg = usuario;
      usuario = 0;
    }
    var m = {
      cod: usuario,
      msg: g.generarMsg(usuario, msg)
    }
    ack(m);
  });


  // Prueba
  // socket.on('imagenPerfil', async (data, ack) => {
  //   w.logger.verbose('Obtener la imagen de perfil del usuario');
  //   const socketId = data.socketId;
  //   var imagen = await usersController.devolverImagenPerfil(clientes[socketId].username);
  //   var msg;
  //   if (imagen != 1 && imagen != 2) {
  //     w.logger.verbose('Imagen obtenida:' + imagen.toString());
  //     msg = imagen;
  //     imagen = 0;
  //   }
  //   w.logger.verbose(imagen);
  //   var m = {
  //     cod: imagen,
  //     msg: g.generarMsg(imagen, msg)
  //   }
  //   w.logger.verbose(m);
  //   ack(m);
  // });





  // ==============================================
  // FUNCIONES DE PARTIDA
  // ==============================================

  socket.on('crearPartida', async (data, ack) => {
    w.logger.verbose('Creación de una partida');
    const socketId = data.socketId;
    //var correo =   await usersController.devolverCorreo(data.username);
    var partida = await partidaController.crearPartida(clientes[socketId].username, 0, 2, false)
    var msg = "";
    if (partida != 1 && partida != 2) {
      w.logger.verbose('Partida creada correctamente');
      //io.emit('mensaje', correo);
      //ack('0 Ok' + correo)
      console.log(partida.id);
      msg = partida;
      clientes[socketId].partidaActiva = partida.id;
      socket.join(partida.id);

      partida = 0;
      w.logger.verbose("\n\tCliente socket: " + clientes[socketId].socket.id + "\n" +
        "\tCliente nombre: " + clientes[socketId].username + "\n" +
        "\tCliente partida: " + clientes[socketId].partidaActiva + "\n");
    }
    //w.logger.verbose(imagen);
    var m = {
      cod: partida,
      msg: g.generarMsg(partida, msg)
    }
    w.logger.verbose(m);
    ack(m);
  });


  socket.on('actualizarPartida', async (data, ack) => {
    w.logger.verbose('Creación de una partida');
    const socketId = data.socketId;
    var partida = await partidaController.actualizarPartida(clientes[socketId].partidaActiva, data.nJugadores, data.dineroInicial);
    var msg = "";
    if (partida != 1 && partida != 2) {
      w.logger.verbose('Partida actualizada correctamente');

      w.logger.verbose("\n\tCliente socket: " + clientes[socketId].socket.id + "\n" +
        "\tCliente nombre: " + clientes[socketId].username + "\n" +
        "\tCliente partida: " + clientes[socketId].partidaActiva + "\n");

      if (data.jugar) {
        io.to(clientes[socketId].partidaActiva).emit('comenzarPartida', clientes[socketId].username);

      }
    }
    //w.logger.verbose(imagen);
    //TODO: cuando jugar es true no dejas que mas users se unan y enviar mensajes a los demas de empezar partida
    var m = {
      cod: partida,
      msg: g.generarMsg(partida, msg)
    }
    w.logger.verbose(m);
    ack(m);
  });

  socket.on('unirJugador', async (data, ack) => {
    w.logger.verbose('Se une un jugador a una partida');
    const socketId = data.socketId;
    var partida = await partidaController.unirJugador(data.idPartida, clientes[socketId].username);

    var msg = "";
    if (partida != 1 && partida != 2) {
      w.logger.verbose('Se ha unido correctamente el jugador');
      //io.emit('mensaje', correo);
      //ack('0 Ok' + correo)
      // msg = partida;
      // partida = 0;
      clientes[socketId].partidaActiva = data.idPartida;
      socket.join(data.idPartida);

      var partida = await partidaController.infoPartida(data.idPartida);

      w.logger.debug('Lista jugadores: ' + partida.nombreJugadores);

      w.logger.debug("Sockets del jugador que se ha unido: " + socket.id)
      io.to(data.idPartida).emit('esperaJugadores', partida.nombreJugadores);

      const socketsGrupo = io.sockets.in(data.idPartida).sockets;
      w.logger.debug(`IDs de los sockets en el grupo ${data.idPartida}:`);

      for (const socketID in socketsGrupo) {
        w.logger.debug(socketID);
      }
      w.logger.verbose("\n\tCliente socket: " + clientes[socketId].socket.id + "\n" +
        "\tCliente nombre: " + clientes[socketId].username + "\n" +
        "\tCliente partida: " + clientes[socketId].partidaActiva + "\n");

      partida = 0;
    }
    //w.logger.verbose(imagen);
    var m = {
      cod: partida,
      msg: g.generarMsg(partida, msg)
    }
    w.logger.verbose(m);
    ack(m);
  });



  //TODO: HAY QUE GESTIONAR LA SALIDA DE LOS GRUPOS SOCKET.LEAVE


  socket.on('lanzarDados', async (data, ack) => {
    w.logger.verbose('Lanzamiento de dados');
    const socketId = data.socketId;
    // clientes[socketId].partidaActiva,
    var dados = await partidaController.lanzardados(clientes[socketId].partidaActiva, clientes[socketId].username);

    var msg = "";
    if (dados != 1 && dados != 2) {
      w.logger.verbose('Se han lanzado los dados correctamente');

      msg = dados;
      dados = 0;
      w.logger.debug('Dados: ' + dados);
    }
    //w.logger.verbose(imagen);
    var m = {
      cod: dados,
      msg: g.generarMsg(dados, msg)
    }
    w.logger.verbose(m);
    ack(m);
  });

  socket.on('siguienteTurno', async (data, ack) => {
    w.logger.verbose('Siguiente turno');
    const socketId = data.socketId;
    /**/
    var turno = await partidaController.siguienteTurno(clientes[socketId].partidaActiva);
    var msg = "";
    if (turno != 1 && turno != 2) {
      w.logger.verbose('Se ha realizado siguiente turno correctamente');

      msg = turno;
      w.logger.debug('Turno: ' + turno);

      io.to(data.idPartida).emit('turnoActual', turno);
      turno = 0;
    }
    var m = {
      cod: turno,
      msg: g.generarMsg(turno, msg)
    }
    w.logger.verbose(m);
    ack(m);

  });

  // socket.on('comenzarPartida', async (data, ack) => {
  //   w.logger.verbose('comenzarPartida');
  //   const socketId = data.socketId;
  //   var partida = clientes[socketId].partidaActiva;
  //   w.logger.debug("Partida activa: " + partida);

  //   Object.values(clientes).forEach(elemento => {
  //     if (elemento.partidaActiva === partida) {
  //       //enviamos a ese jugador el evento aJugar
  //       io.to(elemento.socket).emit('aJugar', elemento.username);
  //     }
  //   });

  // });


  // ==============================================
  // FUNCIONES DE ASIGNATURAS
  // ==============================================

  socket.on('infoAsignatura', async (data, ack) => {
    w.logger.verbose('Info Asignatura');
    var coordenadas = data.coordenadas;
    var asignatura = await asignaturasController.infoAsignatura(coordenadas);

    var msg = "";
    if (asignatura != 1 && asignatura != 2) {
      w.logger.verbose('Se ha obtenido la informacion de la asignatura');

      msg = asignatura;
      w.logger.debug('asignatura: ' + asignatura);
      asignatura = 0;
    }
    var m = {
      cod: asignatura,
      msg: g.generarMsg(asignatura, msg)
    }
    w.logger.verbose(m);
    ack(m);



  });

  socket.on('casilla', async (data, ack) => {
    w.logger.verbose('Casilla');
    const socketId = data.socketId;
    var coordenadas = data.coordenadas;

    var casilla = await asignaturasController.checkCasilla(clientes[socketId].username, coordenadas, clientes[socketId].partidaActiva)
    var msg = "";

    if (casilla === 5) {
      //TODO: CAMBIAR LISTAJUGADORES A INFOPARTIDA
      var partida = await partidaController.infoPartida(clientes[socketId].partidaActiva);
      msg = partida;
    }
    var m = {
      cod: casilla,
      msg: g.generarMsg(casilla, msg)
    }
    w.logger.verbose(m);
    ack(m);


  });

  socket.on('comprarCasilla', async (data, ack) => {
    w.logger.verbose('Metodo de comprar casilla');
    const socketId = data.socketId;
    const coordenadas = data.coordenadas;
    var msg = "";
    var comprada = await asignaturasController.comprarCasilla(clientes[socketId].username, coordenadas, clientes[socketId].partidaActiva);
    var m = {
      cod: comprada,
      msg: g.generarMsg(comprada, msg)
    }
    w.logger.verbose(m);
    ack(m);
  });

  socket.on('listaAsignaturasC', async (data, ack) => {
    w.logger.verbose('Lista de asignaturas compradas');
    const socketId = data.socketId;
    // clientes[socketId].partidaActiva = 32;
    var casillas = await asignaturasController.listaAsignaturasC(clientes[socketId].username, clientes[socketId].partidaActiva)
    var msg = "";
    if (casillas != 1) {
      msg = casillas;
      casillas = 0;
    }
    var m = {
      cod: casillas,
      msg: g.generarMsg(casillas, msg)
    }
    w.logger.verbose(m);
    ack(m);
  });

  socket.on('vender', async (data, ack) => {
    w.logger.verbose('Vender asignatura');
    const socketId = data.socketId;
    var coordenadas = data.coordenadas;
    clientes[socketId].partidaActiva = 32;

    //TODO: ACTUALIZAR LOS DINEROS DE TODOS LOS JUGADORES EMIT
    var vendida = await asignaturasController.vender(clientes[socketId].partidaActiva, clientes[socketId].username, coordenadas);
    var msg = "";
    var m = {
      cod: vendida,
      msg: g.generarMsg(vendida, msg)
    }
    w.logger.verbose(m);
    ack(m);

  });


  socket.on('bancarrota', async (data, ack) => {
    w.logger.verbose('Me declaro en bancarrota y me voy');
    const socketId = data.socketId;
    var coordenadas = data.coordenadas;
    clientes[socketId].partidaActiva = 32;
    var bancarrota = await partidaController.bancarrota(clientes[socketId].partidaActiva, clientes[socketId].username)
    var msg = "";
    var m = {
      cod: bancarrota,
      msg: g.generarMsg(bancarrota, "bancarrota")
    }
    w.logger.verbose(m);
    ack(m);

  });

  socket.on('aumentarCreditos', async(data, ack) => {
    w.logger.verbose('Aumetar creditos de asignaturas');
    const socketId = data.socketId;
    var coordenadas = data.coordenadas;
    clientes[socketId].partidaActiva = 36;

    var aumentada = await asignaturasController.aumentarCreditos(clientes[socketId].partidaActiva, clientes[socketId].username, coordenadas);
    var msg = "";
    var m = {
      cod: aumentada,
      msg: g.generarMsg(aumentada, msg)
    }
    w.logger.verbose(m);
    ack(m);


  });

  socket.on('infoPartida', async (data, ack) => {
    w.logger.verbose('Devolver info partida');
    const socketID = data.socketID;
    var partida = await partidaController.infoPartida(clientes[socketId].username);

    // var imagen = await usersController.devolverImagenPerfil(clientes[socketId].username);

    var msg;
    if (usuario != 1 && usuario != 2) {
      w.logger.verbose('Partida obtenida:' + partida);
      msg = partida;
      partida = 0;
    }
    var m = {
      cod: partida,
      msg: g.generarMsg(partida, msg)
    }
    ack(m);
  });

  // ==============================================
  // FUNCIONES DE CARTAS
  // ==============================================
  socket.on('suerte', async (data, ack) => {
    w.logger.verbose('Tarjeta aleatoria de suerte');
    const socketId = data.socketId;
    var tarjeta = await cartasController.tarjetaAleatoria('suerte', clientes[socketId].username, clientes[socketId].partidaActiva);
    var msg = "";
    if (tarjeta != 2) {
      msg = tarjeta;
      tarjeta = 0;
    }
    var m = {
      cod: tarjeta,
      msg: g.generarMsg(tarjeta, msg)
    }
    w.logger.verbose(m);
    ack(m);

  });

  socket.on('boletin', async (data, ack) => {
    w.logger.verbose('Tarjeta aleatoria de suerte');
    const socketId = data.socketId;
    var tarjeta = await cartasController.tarjetaAleatoria('boletin', clientes[socketId].username, clientes[socketId].partidaActiva);
    var msg = "";
    if (tarjeta != 2) {
      msg = tarjeta;
      tarjeta = 0;
    }
    var m = {
      cod: tarjeta,
      msg: g.generarMsg(tarjeta, msg)
    }
    w.logger.verbose(m);
    ack(m);

  });

  // ==============================================
  // FUNCIONES DE TIENDA
  // ==============================================
  socket.on('tienda', async (data, ack) => {
    w.logger.verbose('Tienda');
    var tienda = await tiendaController.devolverTienda();
    var msg = "";
    if (tienda != 1 && tienda != 2) {
      w.logger.verbose('Se ha realizado la obtencion de los productose');

      msg = tienda;
      w.logger.debug('tienda: ' + tienda);

      tienda = 0;
    }
    var m = {
      cod: tienda,
      msg: g.generarMsg(tienda, msg)
    }
    ack(m);
  });




  // Escucha el evento 'disconnect'
  socket.on('disconnect', () => {
    w.logger.verbose('Usuario desconectado');
    w.logger.verbose('Se ha desconectado el usuario: ' + clientes[socket.id].socket.id + ' ' + clientes[socket.id].username);

    // Elimina la conexión del objeto connections
    socket.leave(clientes[socket.id].partidaActiva);
    delete clientes[socket.id];
    num--;
    w.logger.verbose('Numero de usuarios conectados ' + num);

  });

});

server.listen(80, () => {
  w.logger.info('Servidor escuchando en el puerto 80');
});

// server.listen(3000, () => {
//   w.logger.info('Servidor escuchando en el puerto 80');
// });