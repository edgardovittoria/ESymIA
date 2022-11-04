import {GiAtom, GiAtomicSlashes, GiCubeforce, GiPowerButton} from "react-icons/gi";
import {AiOutlineBarChart} from "react-icons/ai";
import React from "react";

const modelerTabTitle = <div className="flex">
    <div className="w-[25%]"><GiCubeforce color={'#00ae52'} style={{width: "25px", height: "25px"}}/></div>
    <div className="w-[65%]">Modeler</div>
</div>


const materialTabTitle = <div className="flex">
    <div className="w-[25%]"><GiAtomicSlashes color={'#00ae52'} style={{width: "25px", height: "25px"}}/></div>
    <div className="w-[65%]">Materials</div>
</div>

const physicsTabTitle = <div className="flex">
    <div className="w-[25%]"><GiAtom color={'#00ae52'} style={{width: "25px", height: "25px"}}/></div>
    <div className="w-[65%]">Physics</div>
</div>

const simulatorTabTitle = <div className="flex">
    <div className="w-[25%]"><GiAtomicSlashes color={'#00ae52'} style={{width: "25px", height: "25px"}}/></div>
    <div className="w-[65%]">Materials</div>
</div>

const resultsTabTitle = <div className="flex">
    <div className="w-[25%]"><AiOutlineBarChart color={'#00ae52'} style={{width: "25px", height: "25px"}}/></div>
    <div className="w-[65%]">Results</div>
</div>

export const tabTitles = [
    {
        key: 'Modeler',
        object: modelerTabTitle,
        icon: <GiCubeforce color={'#00ae52'} style={{width: "25px", height: "25px"}}/>
    },
    {
        key: 'Materials',
        object: materialTabTitle,
        icon: <GiAtomicSlashes color={'#00ae52'} style={{width: "25px", height: "25px"}}/>
    },
    {
        key: 'Physics',
        object: physicsTabTitle,
        icon: <GiAtom color={'#00ae52'} style={{width: "25px", height: "25px"}}/>
    },
    {
        key: 'Simulator',
        object: simulatorTabTitle,
        icon: <GiAtomicSlashes color={'#00ae52'} style={{width: "25px", height: "25px"}}/>
    },
    {
        key: 'Results',
        object: resultsTabTitle,
        icon: <AiOutlineBarChart color={'#00ae52'} style={{width: "25px", height: "25px"}}/>
    },
]