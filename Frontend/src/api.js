import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

/** API Class.
 *
 * Static class tying together methods used to get/send to to the API.
 *
 */

class GBApi {
  // the token for interactive with the API will be stored here.
  static token;
  // Restored on page load so child components (e.g. ApptInfo) see it before
  // App's effect runs; production builds don't double-run effects like StrictMode dev does.
  static username = localStorage.getItem("username") || "";
  static user;

  static async request(endpoint, data = {}, method = "get") {
    console.debug("API Call:", endpoint, data, method);

    const url = `${BASE_URL}/${endpoint}`;
    const headers = { Authorization: `Bearer ${GBApi.token}`};
    const params = (method === "get")
        ? data
        : {};

    try {
      return (await axios({ url, method, data, params, headers })).data;
    } catch (err) {
      console.error("API Error:", err.response);
      let message = err.response.data.error.message;
      throw Array.isArray(message) ? message : [message];
    }
  }

  // Individual API routes

  /** Get user's availability. */

  static async getAvail(username) {
    let res = await this.request(`users/${username}/avail`);
    return res.userAvail;
  }

  /** Get user's availability matrix. */

  static async getAvailMat() {
    let res = await this.request(`users/${this.username}/avail/matrix`);
    console.log("HIT ROUTE???")
    return res.availMat;
  }

  /** Get details on a game by id. */
  static async getGame(id) {
    let res = await this.request(`games/${id}`);
    return res.game;
  }

  static fixAppt(appt){
    if(appt.player_1 != this.username) {
      appt.player_2 = appt.player_1;
      appt.player_1 = this.username;
    }
    return appt;
  }

  /** Get details on an appt by id. */
  static async getAppt(id) {
    let res = await this.request(`appts/${id}`);
    const appt = this.fixAppt(res.appt);
    return appt;
  }

  /** Get games list can incude query specifications nameLike*/
  static async getGames(query = {}) {
    let res = await this.request(`games`, query);
    return res.games;
  }

  /** Get Appointments list can incude query specifications completed, player_1, player_2*/
  static async getAppts(query = {}) {
    let res = await this.request(`appts`, query);

    res.appts.map(appt => {
      return this.fixAppt(appt);
    });

    return res.appts;
  }

   /** Get appt info **/
   static async getApptInfo(id) {
    let res = await this.request(`appts/${id}`);
    const appt = this.fixAppt(res.appt);
    return appt;
  }

  /** Cancel Appt **/
  static async cancelAppt(id) {
    let res = await this.request(`appts/${id}`, {complete : true, cancelled : true},'patch');
    return res;
  }


  static async registerUser() {
    let res = await this.request(`auth/steam`);
    return res;
  }
  

  /** Using username and password return a token to login **/
  static async loginUser() {
    let res = await this.request(`auth/steam`);
    return res.redirectUrl;
  }

  static async updateUser(userData, availMat) {
    let res = await this.request(`users/${this.username}`, userData, "patch");
    this.user = await this.getUser(this.username);
    return res.user;
  }

  static async getUser(username) {
    let res = await this.request(`users/${username}`);
    this.username = res.user.username;
    this.user = res.user;
    return res.user;
  }

  static async getUserImg(username) {
    let res = await this.request(`users/${username}`);
    return JSON.parse(res.user.avatar);
  }

  static async logout(){
    this.token = "";
    this.user = {};
    this.username = "";
  }

  static async refreshLogin(username) {
    this.username = username;
    console.log(username);
    let res = await this.request(`users/${username}`);
    return res.user;
  }

  static async createAppt(apptData) {
    let res = await this.request(`appts/`, apptData, "post");
    return res;
  }

  static async checkOnline(username, roomID, socket) {
    let users = [];
    socket.emit('join_room', { user : username, room : roomID});
    socket.on('chatroom_users', (data) => {
      users = data;
    });

    socket.emit('leave_room', { username, roomID, logoutTime:Date.now() });


    users.forEach((user) => {
      if(user.username === username) return true;
    });

    return false;

  }

}

export default GBApi;
// for now, put token ("testuser" / "password" on class)
/*JoblyApi.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZ" +
    "SI6InRlc3R1c2VyIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTU5ODE1OTI1OX0." +
    "FtrMwBQwe6Ue-glIFgz_Nf8XxRT2YecFCiSpYL0fCXc";*/
