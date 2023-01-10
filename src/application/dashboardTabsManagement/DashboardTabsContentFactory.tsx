import React, { useState } from "react";
import { Overview } from "./tabs/overview/Overview";
import { Simulations } from "./tabs/Simulations";
import { CreateNewProjectModal } from "../sharedModals/CreateNewProjectModal";
import { Projects } from "./tabs/projects/Projects";
import { useMenuItems } from "../../contexts/tabsAndMenuitemsHooks";

interface DashboardTabsContentFactoryProps {}

export const DashboardTabsContentFactory: React.FC<
  DashboardTabsContentFactoryProps
> = () => {
  const [showCreateNewProjectModal, setShowCreateNewProjectModal] =
    useState(false);
  const { menuItemSelected } = useMenuItems();

  switch (menuItemSelected) {
    case "Overview":
      return (
        <div className="container flex mx-auto pt-8">
          <div className="flex flex-wrap w-full mr-7 justify-between h-[650px]">
            <Overview setShowModal={setShowCreateNewProjectModal} />
          </div>
          {/* <RightPanel /> */}
          {showCreateNewProjectModal && (
            <CreateNewProjectModal setShow={setShowCreateNewProjectModal} />
          )}
        </div>
      );

    case "Projects":
      return (
        <div className="container flex mx-auto pt-8">
          <div className="flex flex-wrap w-full mr-7 justify-between h-[650px]">
            <Projects setShowModal={setShowCreateNewProjectModal} />
          </div>
          {/* <RightPanel /> */}
          {showCreateNewProjectModal && (
            <CreateNewProjectModal setShow={setShowCreateNewProjectModal} />
          )}
        </div>
      );
    case "Simulations":
      return (
        <div className="container flex mx-auto pt-8">
          <div className="flex flex-wrap w-full mr-7 justify-between h-[650px]">
            <Simulations />
          </div>
          {/* <RightPanel /> */}
        </div>
      );
    default:
      return <></>;
  }
};
