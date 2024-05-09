import express from "express";
import { secureMiddleware } from "../secureMiddleware";
import { User } from "../types";
import { login } from "../database";
import { playerPokemons, pokemons } from "..";

export function loginRouter() {
  const router = express.Router();

  router.get("/login", async (req, res) => {
    if (req.session.user) {
      res.redirect("/home");
    } else {
      res.render("login", { pokemons, message: false });
    }
  });

  router.post("/login", async (req, res) => {
    const username: string = req.body.username;
    const password: string = req.body.password;
    try {
      let user: User = await login(username, password);
      delete user.password;
      req.session.user = user;
      console.log(username, password);
      req.session.save(() => res.redirect("/home"));
    } catch (e: any) {
      // console.log(e);
      res.render("login", { pokemons, message: e });
    }
  });

  router.post("/logout", secureMiddleware, async (req, res) => {
    req.session.destroy((err) => {
      res.redirect("/login");
    });
  });

  return router;
}
