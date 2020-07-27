import fetch from "jest-fetch-mock";

fetch.enableMocks();

const syncify = async (fn) => {
    try {
      const result = await fn();
      return () => { return result; };
    } catch (e) {
      return () => { throw e; };
    }
  };

  export default {
    syncify
  }