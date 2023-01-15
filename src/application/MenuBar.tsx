import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { menuItemsSelector, selectedMenuItemSelector, selectMenuItem } from '../store/tabsAndMenuItemsSlice';

interface MenuBarProps {
}

export const MenuBar: React.FC<MenuBarProps> = () => {
    const dispatch = useDispatch()
    const menuItems = useSelector(menuItemsSelector)
    const menuItemSelected = useSelector(selectedMenuItemSelector)
    return (
        <div className="flex justify-center">
            <ul className={`relative flex items-center bg-white p-[20px] w-[96%] rounded-xl`}>
                {(menuItems as string[]).map(item => <li key={item} onClick={() => dispatch(selectMenuItem(item))}>
                    <a className={(menuItemSelected === item) ? 'text-black no-underline px-4' : 'no-underline px-4 text-gray-400'} aria-current="page"
                       href="/#">{item}</a>
                </li>)}
            </ul>
        </div>

    )
}

