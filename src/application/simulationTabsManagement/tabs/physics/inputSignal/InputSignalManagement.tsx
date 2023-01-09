import React from 'react';

interface InputSignalManagementProps {
}

export const InputSignalManagement: React.FC<InputSignalManagementProps> = (
    {
        children
    }
) => {
    return(
        <>
            <div className="flex absolute right-[2%] top-[650px] w-[22%] rounded-tl rounded-tr bg-white p-[10px] shadow-2xl border-b border-secondaryColor">
                <div className="col-6 text-start ps-0">
                    <h5 className="mb-0">Signals</h5>
                </div>
            </div>
            < div className="flex-col absolute right-[2%] top-[695px] w-[22%] rounded-tl rounded-tr bg-white p-[20px] shadow-2xl max-h-[200px] overflow-y-scroll overflow-x-hidden">
                {children}
            </div>
        </>
    )

}