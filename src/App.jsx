import Widget from "./components/Widget";

const App = () => {
  return (
    <div className="min-h-screen bg-black">
      <h1 className="text-3xl text-center text-white min-h-[890px]">My App</h1>
      <Widget />
      <h1 className="text-3xl text-center text-white min-h-[2000px]">
        Hey there
      </h1>
    </div>
  );
};

export default App;
