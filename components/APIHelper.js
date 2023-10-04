import axios from "axios";

export const getApiDataProgressPayment = async (
  apiurl,
  method,
  data,
  token
) => {
  let authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  try {
    let response = await axios({
      method: method,
      url: apiurl,
      timeout: 30000,
      headers: authHeaders,
      data: data || {},
    });
    if (response?.data?.code == "authentication_failed") {
      return;
    }
    let responseStatus = response.status;
    const res = response?.data || {
      status: responseStatus === 200 ? true : responseStatus,
      response: response.data,
    };
    return res;
  } catch (error) {
    if (error.response) {
      let returnObj;
      if (error.response.status === 400) {
        returnObj = error?.response?.data;
      }
      if (error.response.status === 404) {
        returnObj = error?.response?.data;
      }
      if (error.response.status === 403) {
        if (!error.response.data.code) {
          return;
        }
      }
      if (
        error?.response?.data?.message ===
        "Your request was made with invalid credentials."
      ) {
        return;
      }
      return returnObj;
    }
    console.log("error----APIHelper--->", error);
  }
};
