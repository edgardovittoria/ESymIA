import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { menuItemsSelector, selectedMenuItemSelector, selectMenuItem } from '../store/tabsAndMenuItemsSlice';
import { PiCubeFocusDuotone } from "react-icons/pi";
import { FaReact } from "react-icons/fa6";
import { MdOutlineSettingsPower } from "react-icons/md";
import { TfiBarChart } from "react-icons/tfi";




interface MenuBarProps {
}

export const MenuBar: React.FC<MenuBarProps> = () => {
    const dispatch = useDispatch()
    const menuItems = useSelector(menuItemsSelector)
    const menuItemSelected = useSelector(selectedMenuItemSelector)
    return (
        <div className="flex justify-center">
            <ul className={`relative flex items-center bg-white px-4 py-2 w-[96%] rounded-xl`}>
                {(menuItems as string[]).map(item => <li key={item} className="flex flex-col justify-center items-center hover:cursor-pointer" onClick={() => dispatch(selectMenuItem(item))}>
                    {item === "Modeler" && <PiCubeFocusDuotone size={25} className={(menuItemSelected === item) ? 'text-[#4AC37E]' : 'text-gray-400'}/>}
                    {item === "Physics" && <FaReact size={25} className={(menuItemSelected === item) ? 'text-[#4AC37E]' : 'text-gray-400'}/>}
                    {item === "Simulator" && <MdOutlineSettingsPower size={25} className={(menuItemSelected === item) ? 'text-[#4AC37E]' : 'text-gray-400'}/>}
                    {item === "Results" && <TfiBarChart size={25} className={(menuItemSelected === item) ? 'text-[#4AC37E]' : 'text-gray-400'}/>}
                    {(item === "Overview" || item === "Projects" || item === "Simulations") ?
                        <span className={(menuItemSelected === item) ? 'text-black no-underline px-4 py-3 text-sm' : 'no-underline px-4 py-3 text-gray-400 text-sm'}
                        >{item}</span> :
                        <span className={(menuItemSelected === item) ? 'text-black no-underline px-4 text-[11px]' : 'no-underline px-4 text-gray-400 text-[11px]'}
                        >{item}</span>
                    }
                    {menuItemSelected === item && <hr className="w-2/3 border border-secondaryColor"/>}
                </li>)}
            </ul>
        </div>

    )
}

