import {useEffect, useState} from "react";
import {Signal} from "../../../../model/Port";
import {getSignals} from "../../../../faunadb/api/signalsAPIs";
import { useFaunaQuery } from "cad-library";

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