import {Materials} from "./Materials";
import {CanvasBaseWithRedux} from "../../sharedElements/CanvasBaseWithRedux";
import {LeftPanel} from "../../sharedElements/LeftPanel";
import {Models} from "../../sharedElements/Models";
import {ModelOutliner} from "../../sharedElements/ModelOutliner";
import StatusBar from "../../sharedElements/StatusBar";

interface ModelerProps {
    selectedTabLeftPanel: string;
    setSelectedTabLeftPanel: Function;
}

export const Modeler: React.FC<ModelerProps> = (
    {selectedTabLeftPanel, setSelectedTabLeftPanel}
) => {
    

    return (
        <div>
            <CanvasBaseWithRedux section="Modeler"/>
            <StatusBar/>
            <LeftPanel
                tabs={["Modeler", "Materials"]}
                selectedTab={selectedTabLeftPanel}
                setSelectedTab={setSelectedTabLeftPanel}
            >
                {selectedTabLeftPanel === "Materials" ? (
                    <Materials/>
                ) : (
                    <Models>
                        <ModelOutliner/>
                    </Models>
                )}
            </LeftPanel>

        </div>
    );
};
