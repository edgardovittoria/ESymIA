import { Materials } from "./Materials";
import { ModelOutliner } from "../ModelOutliner";
import { Models } from "../Models";
import { CanvasBaseWithRedux } from "../CanvasBaseWithRedux";
import { LeftPanel } from "../LeftPanel";

interface ModelerProps {
  selectedTabLeftPanel: string;
  setSelectedTabLeftPanel: Function;
}

export const Modeler: React.FC<ModelerProps> = ({
  selectedTabLeftPanel,
  setSelectedTabLeftPanel,
}) => {
  return (
    <>
      <CanvasBaseWithRedux section="Modeler" />
      <LeftPanel
        tabs={["Modeler", "Materials"]}
        selectedTab={selectedTabLeftPanel}
        setSelectedTab={setSelectedTabLeftPanel}
      >
        {selectedTabLeftPanel === "Materials" ? (
          <Materials />
        ) : (
          <Models>
            <ModelOutliner />
          </Models>
        )}
      </LeftPanel>
    </>
  );
};
