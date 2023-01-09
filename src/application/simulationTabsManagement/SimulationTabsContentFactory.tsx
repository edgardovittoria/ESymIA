import React, { useState } from "react";
import { Simulation } from "../../model/Simulation";
import { Physics } from "./tabs/physics/Physics";
import { Results } from "./tabs/results/Results";
import { Simulator } from "./tabs/simulator/Simulator";
import { Modeler } from "./tabs/modeler/Modeler";



interface SimulationTabsContentFactoryProps {
  menuItem: string;
  setMenuItem: Function;
  selectedSimulation: Simulation | undefined;
  setSelectedSimulation: Function;
}

export const SimulationTabsContentFactory: React.FC<
  SimulationTabsContentFactoryProps
> = ({ menuItem, setMenuItem, selectedSimulation, setSelectedSimulation }) => {  
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
          setSelectedSimulation={setSelectedSimulation}
        />
      );
    case "Results":
      return (
        <Results
          selectedTabLeftPanel={selectedTabLeftPanel}
          setSelectedTabLeftPanel={setSelectedTabLeftPanel}
          selectedSimulation={selectedSimulation}
          setSelectedSimulation={setSelectedSimulation}
        />
      );
    default:
      return <></>;
  }
};
