// ** import state management:
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { Presistor } from "../store";

const Providers = (props) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={Presistor}>
        {props.children}
      </PersistGate>
    </Provider>
  );
};

export default Providers;
