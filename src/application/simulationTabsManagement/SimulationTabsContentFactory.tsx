import React, { useState } from "react";
import { Physics } from "./tabs/physics/Physics";
import { Results } from "./tabs/results/Results";
import { Simulator } from "./tabs/simulator/Simulator";
import { Modeler } from "./tabs/modeler/Modeler";
import { useSelector } from "react-redux";
import { selectedMenuItemSelector } from "../../store/tabsAndMenuItemsSlice";



interface SimulationTabsContentFactoryProps {
}

export const SimulationTabsContentFactory: React.FC<
  SimulationTabsContentFactoryProps
> = () => {  
  const [selectedTabLeftPanel, setSelectedTabLeftPanel] = useState("Modeler");
  const menuItemSelected = useSelector(selectedMenuItemSelector)

  switch (menuItemSelected) {
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
