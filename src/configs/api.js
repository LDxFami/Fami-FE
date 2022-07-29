import axios from "axios";
import cookie from "react-cookies";

const apiUrl = "https://fami-be.herokuapp.com";
const app = axios.create({
  baseURL: apiUrl,
  headers: {
    "csrf-token": cookie.load("csrf-token"),
  },
});

export { apiUrl, app };
