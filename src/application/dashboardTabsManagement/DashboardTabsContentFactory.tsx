import React, { useState } from "react";
import { Project } from "../../model/Project";
import { Overview } from "./tabs/overview/Overview";
import { Simulations } from "./tabs/Simulations";
import { CreateNewProjectModal } from "../sharedModals/CreateNewProjectModal";
import { Projects } from "./tabs/projects/Projects";

interface DashboardTabsContentFactoryProps {
  menuItem: string;
  projectsTab: Project[];
  setProjectsTab: Function;
  selectTab: Function;
  setSimulationCoreMenuItemSelected: Function;
  setSelectedSimulation: Function;
  setMenuItem: Function;
}

export const DashboardTabsContentFactory: React.FC<
  DashboardTabsContentFactoryProps
> = ({
  menuItem,
  projectsTab,
  setProjectsTab,
  selectTab,
  setSimulationCoreMenuItemSelected,
  setSelectedSimulation,
  setMenuItem,
}) => {
  const [showCreateNewProjectModal, setShowCreateNewProjectModal] =
    useState(false);

  switch (menuItem) {
    case "Overview":
      return (
        <div className="container flex mx-auto pt-8">
          <div className="flex flex-wrap w-full mr-7 justify-between h-[650px]">
            <Overview
              setShowModal={setShowCreateNewProjectModal}
              projectsTab={projectsTab}
              setProjectsTab={setProjectsTab}
              selectTab={selectTab}
              setMenuItem={setMenuItem}
              setSimulationCoreMenuItemSelected={
                setSimulationCoreMenuItemSelected
              }
              setSelectedSimulation={setSelectedSimulation}
            />
          </div>
          {/* <RightPanel /> */}
          {showCreateNewProjectModal && (
            <CreateNewProjectModal
              setShow={setShowCreateNewProjectModal}
              projectsTab={projectsTab}
              setProjectsTab={setProjectsTab}
              selectTab={selectTab}
            />
          )}
        </div>
      );

    case "Projects":
      return (
        <div className="container flex mx-auto pt-8">
          <div className="flex flex-wrap w-full mr-7 justify-between h-[650px]">
            <Projects
              setShowModal={setShowCreateNewProjectModal}
              projectsTab={projectsTab}
              setProjectsTab={setProjectsTab}
              selectTab={selectTab}
            />
          </div>
          {/* <RightPanel /> */}
          {showCreateNewProjectModal && (
            <CreateNewProjectModal
              setShow={setShowCreateNewProjectModal}
              projectsTab={projectsTab}
              setProjectsTab={setProjectsTab}
              selectTab={selectTab}
            />
          )}
        </div>
      );
    case "Simulations":
      return (
        <div className="container flex mx-auto pt-8">
          <div className="flex flex-wrap w-full mr-7 justify-between h-[650px]">
            <Simulations
              selectTab={selectTab}
              setSimulationCoreMenuItemSelected={
                setSimulationCoreMenuItemSelected
              }
              setSelectedSimulation={setSelectedSimulation}
              setProjectsTab={setProjectsTab}
              projectsTab={projectsTab}
            />
          </div>
          {/* <RightPanel /> */}
        </div>
      );
    default:
      return <></>;
  }
};
