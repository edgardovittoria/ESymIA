import React, {useState} from 'react';
import {ResultsContent} from "../simulationElements/components/resultsContent/ResultsContent";
import {Modeler} from "../simulationElements/shared/modeler/Modeler";
import {LeftPanel} from "../simulationElements/shared/dashBoard/leftPanel/LeftPanel";
import {RightPanelSimulation} from "../simulationElements/shared/dashBoard/rightPanelSimulation/RightPanelSimulation";
import {
    FactoryRightPanelContent
} from "../simulationElements/shared/dashBoard/rightPanelSimulation/factory/FactoryRightPanelContent";
import {Simulation} from "../../../../model/Simulation";
import {
    FactorySimulationDashboardContent
} from "../simulationElements/shared/dashBoard/leftPanel/factory/FactorySimulationDashboardContent";
import {SelectPorts} from "../simulationElements/shared/dashBoard/selectPorts/SelectPorts";
import {useDispatch, useSelector} from 'react-redux';
import {
    importModel,
    selectedComponentSelector,
    selectedProjectSelector, selectPort, setScreenshot,
    updatePortPosition
} from '../../../../store/projectSlice';
import {useGenerateMesh} from '../hooks/useGenerateMesh';
import {useRunSimulation} from '../hooks/useRunSimulation';
import {ComponentEntity} from 'cad-library';
import {getMaterialListFrom} from "../hooks/auxiliaryFunctions/auxiliaryFunctions";
import {ChartsList} from "../simulationElements/components/resultsContent/components/ChartsList";
import {
    ChartVisualizationMode
} from "../simulationElements/shared/dashBoard/chartVisualizationMode/ChartVisualizationMode";

interface TabsContentSimulationFactoryProps {
    menuItem: string,
    setMenuItem: Function
    selectedSimulation: Simulation | undefined,
    setSelectedSimulation: Function,
    setShowLoadFromDBModal: Function,
}

export const TabsContentSimulationFactory: React.FC<TabsContentSimulationFactoryProps> = (
    {
        menuItem, setMenuItem, selectedSimulation, setSelectedSimulation, setShowLoadFromDBModal
    }
) => {

    const dispatch = useDispatch()

    const [chartVisualizationMode, setChartVisualizationMode] = useState<'grid' | 'full'>("grid");

    // Variabile per modificare il tipo di scala dei grafici. Da usare per i due pulsanti da fare
    const [chartsScaleMode, setChartsScaleMode] = useState<'logarithmic' | 'linear'>('logarithmic')

    const selectedProject = useSelector(selectedProjectSelector)
    const selectedComponent = useSelector(selectedComponentSelector)
    let allMaterials = getMaterialListFrom(selectedProject?.model.components as ComponentEntity[])
    let materialsNames: string[] = []
    allMaterials.forEach(m => materialsNames.push(m.name))
    const [selectedPort, setSelectedPort] = useState((selectedProject?.ports[0]) ? selectedProject?.ports[0].name : 'undefined');
    const [quantumDimensions, setQuantumDimensions] = useState<[number, number, number]>([0.00000, 0.000000, 0.000000]);
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>(materialsNames);

    useGenerateMesh(selectedProject?.model.components as ComponentEntity[], quantumDimensions);

    const {newSimulation} = useRunSimulation(selectedProject);
    let simulation: Simulation
    if (newSimulation.name) {
        simulation = selectedProject?.simulations?.filter(s => s.name === newSimulation?.name)[0] as Simulation
    } else {
        if(selectedSimulation){
            simulation = selectedProject?.simulations?.filter(s => s.name === selectedSimulation?.name)[0] as Simulation
        }else{
            simulation = selectedProject?.simulations[0] as Simulation
        }

    }

    const [selectedTabLeftPanel, setSelectedTabLeftPanel] = useState("Modeler");


    switch (menuItem) {
        case 'Modeler':
            return (
                <>
                    <Modeler
                        importModel={importModel}
                        section="Modeler"
                        setShowLoadFromDBModal={setShowLoadFromDBModal}
                        selectPort={(name: string) => dispatch(selectPort(name))}
                        selectedProject={selectedProject}
                        setScreenshot={(imageBase64: string) => dispatch(setScreenshot(imageBase64))}
                        updatePortPosition={(obj: { type: 'first' | 'last', position: [number, number, number] }) => dispatch(updatePortPosition(obj))}
                        selectedMaterials={selectedMaterials}
                    />
                    <LeftPanel tabs={['Modeler', 'Materials']} selectedTab={selectedTabLeftPanel}
                               setSelectedTab={setSelectedTabLeftPanel} chartVisualizationMode={chartVisualizationMode}
                               setChartVisualizationMode={setChartVisualizationMode}
                    >
                        <FactorySimulationDashboardContent
                            selectedTab={selectedTabLeftPanel}
                            setSelectedSimulation={setSelectedSimulation}
                            selectedSimulation={selectedSimulation}
                            selectedMaterials={selectedMaterials}
                            setSelectedMaterials={setSelectedMaterials}
                            selectedPort={selectedPort}
                            setSelectedPort={setSelectedPort}
                        />
                    </LeftPanel>
                    {selectedComponent.length > 0 &&
                        <RightPanelSimulation>
                            <FactoryRightPanelContent
                                section="Modeler"
                                components={selectedProject?.model.components}
                                setMenuItem={setMenuItem}
                                quantumDimensions={quantumDimensions}
                                setQuantumDimensions={setQuantumDimensions}
                            />
                        </RightPanelSimulation>}
                </>
            )

        case 'Physics':
            return (
                <>
                    <Modeler
                        importModel={importModel}
                        section="Physics"
                        setShowLoadFromDBModal={setShowLoadFromDBModal}
                        selectPort={(name: string) => dispatch(selectPort(name))}
                        selectedProject={selectedProject}
                        setScreenshot={(imageBase64: string) => dispatch(setScreenshot(imageBase64))}
                        updatePortPosition={(obj: { type: 'first' | 'last', position: [number, number, number] }) => dispatch(updatePortPosition(obj))}
                        selectedMaterials={selectedMaterials}
                    />
                    <LeftPanel tabs={['Modeler', 'Physics']} selectedTab={selectedTabLeftPanel}
                               setSelectedTab={setSelectedTabLeftPanel} chartVisualizationMode={chartVisualizationMode}
                               setChartVisualizationMode={setChartVisualizationMode}
                    >
                        <FactorySimulationDashboardContent
                            selectedTab={selectedTabLeftPanel}
                            setSelectedSimulation={setSelectedSimulation}
                            selectedSimulation={selectedSimulation}
                            selectedMaterials={selectedMaterials}
                            setSelectedMaterials={setSelectedMaterials}
                            selectedPort={selectedPort}
                            setSelectedPort={setSelectedPort}
                        />
                    </LeftPanel>
                    {selectedProject?.model.components &&
                        <SelectPorts selectedProject={selectedProject}/>}
                    <RightPanelSimulation>
                        <FactoryRightPanelContent
                            section="Physics"
                            components={selectedProject?.model.components}
                            setMenuItem={setMenuItem}
                            quantumDimensions={quantumDimensions}
                            setQuantumDimensions={setQuantumDimensions}
                        />
                    </RightPanelSimulation>
                </>
            )
        case 'Simulator':
            return (
                <>
                    <Modeler
                        importModel={importModel}
                        section="Simulator"
                        setShowLoadFromDBModal={setShowLoadFromDBModal}
                        selectPort={(name: string) => dispatch(selectPort(name))}
                        selectedProject={selectedProject}
                        setScreenshot={(imageBase64: string) => dispatch(setScreenshot(imageBase64))}
                        updatePortPosition={(obj: { type: 'first' | 'last', position: [number, number, number] }) => dispatch(updatePortPosition(obj))}
                        selectedMaterials={selectedMaterials}
                    />
                    <LeftPanel tabs={['Modeler', 'Simulator']} selectedTab={selectedTabLeftPanel}
                               setSelectedTab={setSelectedTabLeftPanel} chartVisualizationMode={chartVisualizationMode}
                               setChartVisualizationMode={setChartVisualizationMode}
                    >
                        <FactorySimulationDashboardContent
                            selectedTab={selectedTabLeftPanel}
                            setSelectedSimulation={setSelectedSimulation}
                            selectedSimulation={selectedSimulation}
                            selectedMaterials={selectedMaterials}
                            setSelectedMaterials={setSelectedMaterials}
                            selectedPort={selectedPort}
                            setSelectedPort={setSelectedPort}
                        />
                    </LeftPanel>
                    <RightPanelSimulation>
                        <FactoryRightPanelContent
                            section="Simulator"
                            components={selectedProject?.model.components}
                            setMenuItem={setMenuItem}
                            quantumDimensions={quantumDimensions}
                            setQuantumDimensions={setQuantumDimensions}
                        />
                    </RightPanelSimulation>
                </>
            )
        case 'Results':
            return (
                <ResultsContent>
                    <LeftPanel tabs={['Modeler', 'Results']} selectedTab={selectedTabLeftPanel}
                               setSelectedTab={setSelectedTabLeftPanel} chartVisualizationMode={chartVisualizationMode}
                               setChartVisualizationMode={setChartVisualizationMode}
                    >
                        <FactorySimulationDashboardContent
                            selectedTab={selectedTabLeftPanel}
                            setSelectedSimulation={setSelectedSimulation}
                            selectedSimulation={selectedSimulation}
                            selectedMaterials={selectedMaterials}
                            setSelectedMaterials={setSelectedMaterials}
                            selectedPort={selectedPort}
                            setSelectedPort={setSelectedPort}
                        />
                    </LeftPanel>
                    {(selectedProject && chartVisualizationMode === 'full' && selectedProject.simulations.length > 0) ?
                        <>
                            {selectedTabLeftPanel === "Results" && <ChartVisualizationMode chartVisualizationMode={chartVisualizationMode} setChartVisualizationMode={setChartVisualizationMode} chartsScaleMode={chartsScaleMode} setChartsScaleMode={setChartsScaleMode}/>}
                            <div className="overflow-scroll grid grid-cols-1 gap-4 max-h-[800px]">
                                <ChartsList simulation={simulation} project={selectedProject} scaleMode={chartsScaleMode}/>
                            </div>
                        </>
                         :
                        <>
                            {selectedTabLeftPanel === "Results" && <ChartVisualizationMode chartVisualizationMode={chartVisualizationMode} setChartVisualizationMode={setChartVisualizationMode} chartsScaleMode={chartsScaleMode} setChartsScaleMode={setChartsScaleMode}/>}
                            <div className="grid grid-cols-2 gap-4 overflow-scroll max-h-[800px]">
                                <ChartsList simulation={simulation} project={selectedProject} scaleMode={chartsScaleMode}/>
                            </div>
                        </>

                    }
                </ResultsContent>
            )
        default:
            return <></>
    }

}