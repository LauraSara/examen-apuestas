const { Router } = require('express');
const { User } = require('../db');
const { Apuesta } = require('../db');
const Sequelize = require('sequelize');
const router = Router();

// aca configuramos las rutas.
function checkLogin(req, res, next) {
  if (req.session.user == null) {
    req.flash('errors', "Tienes que estar logeado para entrar a esta parte del sistema.");
    return res.redirect('/login');
  }
  res.locals.user = req.session.user;
  next();
}

function checkAdmin(req, res, next) {
  if (req.session.user.rol != "ADMIN") {
    req.flash('errors', "No tienes permisos de Administrador. No puedes entrar a esta parte del sistema.");
    return res.redirect('/');
  }
  next();
}


router.get("/", [checkLogin], async (req, res) => {

  const errors = req.flash("errors");
  const mensajes = req.flash("mensajes");
  const apuestas = await Apuesta.findAll({
    include: [{ model: User }]
  });
  const user = await User.findAll({
    include: [{ model: Apuesta }]
  });

  console.log(apuestas);
  res.render("usuario.ejs", { errors, mensajes, apuestas, user })
});



router.post("/newApuesta", async (req, res) => {
  console.log("llegando a la ruta de creacion");
  const errors = req.flash("errors");
  const mensajes = req.flash("mensajes");
  const apuestas = await Apuesta.findAll({
    include: [{ model: User }]
  });
  const user = await User.findAll({
    include: [{ model: Apuesta }]
  });

  const { monto, producto } = req.body;
  const { id } = req.session.user;

  const maxApuesta = await Apuesta.findAll({
    include: [{ model: User }],
    attributes: [Sequelize.fn('max', Sequelize.col('monto'))],
    raw: true,
  });
  /*
    const apGris = maxApuesta.filter(x => x.producto == 1);
    const apAmarillo = maxApuesta.filter(x => x.producto == 2);
    const apRojo = maxApuesta.filter(x => x.producto == 3);
    
    console.log(apGris, apAmarillo, apRojo);
  */

  let newApuesta = await Apuesta.create({
    producto: producto,
    monto: monto,
    //usuario: req.body.usuario,
    UserId: id
  });
  /*
    if (maxApuesta > monto) {
      res.send("Debes ingresar un valor mayor")
    }
  */

  console.log(maxApuesta);
  req.flash("mensajes", "Nueva apuesta agregada");
  res.render("usuario.ejs", { errors, mensajes, apuestas, user, maxApuesta })
});

router.get("/finalizar", [checkLogin], async (req, res) => {

  const errors = req.flash("errors");
  const mensajes = req.flash("mensajes");
  const apuestas = await Apuesta.findAll({
    include: [{ model: User }]
  });

  const ganador = await Apuesta.findAll({
    include: [{ model: User }],
    order: [
      ['monto', 'DESC']
    ]
  });

  const aGris = ganador.filter(x => x.producto == 1);
  const aAmarillo = ganador.filter(x => x.producto == 2);
  const aRojo = ganador.filter(x => x.producto == 3);

  if (aGris.length == 0 || aAmarillo.length == 0 || aRojo.length == 0) {
    req.flash('errors', "Debe existir al menos una oferta para todos los productos");
    return res.redirect("/");
  }

  const user = await User.findAll({
    include: [{ model: Apuesta }]
  });

  res.render("ended.ejs", { errors, mensajes, apuestas, user, ganador })
});

router.get("/volver", async (req, res) => {
  const errors = req.flash("errors");
  const mensajes = req.flash("mensajes");
  const apuestas = await Apuesta.findAll({
    include: [{ model: User }]
  });
  const user = await User.findAll({
    include: [{ model: Apuesta }]
  });

  //const borrar = await Apuesta.destroy({ where: { id })
  Apuesta.destroy({
    where: {
    }
  });

  res.render("usuario.ejs", { errors, mensajes, apuestas, user })
});

module.exports = router;
