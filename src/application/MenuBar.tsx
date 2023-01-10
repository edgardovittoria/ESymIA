import React from 'react';
import { useMenuItems } from '../contexts/tabsAndMenuitemsHooks';

interface MenuBarProps {
}

export const MenuBar: React.FC<MenuBarProps> = () => {
    const {selectMenuItem, menuItems, menuItemSelected} = useMenuItems()
    return (
        <div className="flex justify-center">
            <ul className={`relative flex items-center bg-white p-[20px] w-[96%] rounded-xl`}>
                {(menuItems as string[]).map(item => <li key={item} onClick={() => selectMenuItem(item)}>
                    <a className={(menuItemSelected === item) ? 'text-black no-underline px-4' : 'no-underline px-4 text-gray-400'} aria-current="page"
                       href="/#">{item}</a>
                </li>)}
            </ul>
        </div>

    )
}

