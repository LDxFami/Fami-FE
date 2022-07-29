import axios from "axios";
import cookie from "react-cookies";

const apiUrl = "http://fami-be.herokuapp.com";
const app = axios.create({
  baseURL: apiUrl,
  headers: {
    "csrf-token": cookie.load("csrf-token"),
  },
});

export { apiUrl, app };
