import { Materials } from "./Materials";
import { CanvasBaseWithRedux } from "../../sharedElements/CanvasBaseWithRedux";
import { LeftPanel } from "../../sharedElements/LeftPanel";
import { Models } from "../../sharedElements/Models";
import { ModelOutliner } from "../../sharedElements/ModelOutliner";

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
      <CanvasBaseWithRedux section="Modeler" savedPortParameters={true}/>
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
