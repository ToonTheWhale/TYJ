import { NextFunction, Request, Response } from "express";

export function secureMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.session.user) {
        res.locals.user = req.session.user;
        res.locals.currentPokemon = req.session.currentPokemon;
        res.locals.user.currentPokemon = req.session.user.currentPokemon
        next();
    } else {
        res.redirect("/login");
    }
};