import React, { useState } from "react";
import { Physics } from "./tabs/physics/Physics";
import { Results } from "./tabs/results/Results";
import { Simulator } from "./tabs/simulator/Simulator";
import { Modeler } from "./tabs/modeler/Modeler";



interface SimulationTabsContentFactoryProps {
  menuItem: string;
  setMenuItem: Function;
}

export const SimulationTabsContentFactory: React.FC<
  SimulationTabsContentFactoryProps
> = ({ menuItem, setMenuItem }) => {  
  const [selectedTabLeftPanel, setSelectedTabLeftPanel] = useState("Modeler");

  switch (menuItem) {
    case "Modeler":
      return (
        <Modeler
          selectedTabLeftPanel={selectedTabLeftPanel}
          setSelectedTabLeftPanel={setSelectedTabLeftPanel}
        />
      );
    case "Physics":
      return (
        <Physics
          selectedTabLeftPanel={selectedTabLeftPanel}
          setSelectedTabLeftPanel={setSelectedTabLeftPanel}
        />
      );
    case "Simulator":
      return (
        <Simulator
          selectedTabLeftPanel={selectedTabLeftPanel}
          setSelectedTabLeftPanel={setSelectedTabLeftPanel}
          setMenuItem={setMenuItem}
        />
      );
    case "Results":
      return (
        <Results
          selectedTabLeftPanel={selectedTabLeftPanel}
          setSelectedTabLeftPanel={setSelectedTabLeftPanel}
        />
      );
    default:
      return <></>;
  }
};
