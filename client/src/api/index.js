// client/src/api/index.js
// use your existing apiClient if you have one; otherwise use axios directly
import axios from "axios";

export const authService = {
  // ...leave other functions untouched...

  // INIT now uses GET and takes no arguments
  async initGoogleOAuth() {
    const { data } = await axios.get("/api/oauth/google/init");
    return data; // { authUrl }
  },

  // CONTINUE (for completeness)
  async continueGoogleOAuth(code) {
    const { data } = await axios.get("/api/oauth/google/continue", {
      params: { code },
      withCredentials: true,
    });
    return data; // { token, name, email }
  },
};


export default apiClient;
