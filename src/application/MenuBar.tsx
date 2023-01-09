import React from 'react';

interface MenuBarProps {
    setMenuItem: Function,
    activeMenuItem: string,
    menuItems: string[]
}

export const MenuBar: React.FC<MenuBarProps> = ({menuItems, setMenuItem, activeMenuItem}) => {
    return (
        <div className="flex justify-center">
            <ul className={`relative flex items-center bg-white p-[20px] w-[96%] rounded-xl`}>
                {(menuItems as string[]).map(item => <li key={item} onClick={() => setMenuItem(item)}>
                    <a className={(activeMenuItem === item) ? 'text-black no-underline px-4' : 'no-underline px-4 text-gray-400'} aria-current="page"
                       href="/#">{item}</a>
                </li>)}
            </ul>
        </div>

    )
}

