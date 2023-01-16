import {useEffect, useState} from "react";
import {getSignals} from "../../../../../faunadb/signalsAPIs";
import { useFaunaQuery } from "cad-library";
import { Signal } from "../../../../../model/esymiaModels";

export const useGetAvailableSignals = () => {
    const [availableSignals, setAvailableSignals] = useState<Signal[]>([]);
    const {execQuery} = useFaunaQuery()
    
    useEffect(() => {
        execQuery(getSignals).then(res => {
            setAvailableSignals(res)
        })
    }, []);

    return {
        availableSignals: availableSignals,
        setAvailableSignals: setAvailableSignals
    }
}