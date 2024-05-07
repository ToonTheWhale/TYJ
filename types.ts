import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  id: number;
  username: string;
  email: string;
  password?: string;
  team: DetailedPokemon[];
  role: "ADMIN" | "USER";
  currentPokemon : number | undefined
}

export interface NonDetailedPokemon {
  name: string;
  id: number;
  url: string;
}

export interface DetailedPokemon {
  id: number;
  name: string;
  types: string[];
  image: string;
  height: number;
  weight: number;
  maxHP: number;
  defense: number;
  attack: number;
  nickname: string;
}

export interface FlashMessage {
  type: "error" | "success";
  message: string;
}