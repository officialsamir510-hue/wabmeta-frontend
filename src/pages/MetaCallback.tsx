import { useEffect } from "react";
import axios from "axios";

const MetaCallback = () => {

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      // Backend ko code bhejo, backend isse token mein badlega
      axios.post("http://localhost:5000/api/meta/exchange-token", { code })
        .then(() => {
          alert("Connected Successfully!");
          window.close(); // Popup close karo
        })
        .catch((err) => console.error(err));
    }
  }, []);

  return <div>Connecting to Meta... Please wait.</div>;
};

export default MetaCallback;