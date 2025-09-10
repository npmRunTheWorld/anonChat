import AnoChatRoutes from "./features/routes/AnoChatRoutes";
import { ClientProvider } from "./store/providers/ClientProvider";
const App = () => {
  //state

  //function

  return (
    <>
      <ClientProvider>
        <AnoChatRoutes />
      </ClientProvider>
    </>
  );
};

export default App;
