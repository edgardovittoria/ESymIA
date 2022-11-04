import React, {ReactNode} from 'react';
interface ResultsContentProps {

}

export const ResultsContent: React.FC<ResultsContentProps> = (
    {
        children
    }
) => {

    const [leftPanel, lineChart] = children as ReactNode[]

    return (
        <div className="flex">
            <div className="w-[20%]">
                {leftPanel}
            </div>
            <div className="w-[78%] ">
                {lineChart}
            </div>
        </div>
    )

}