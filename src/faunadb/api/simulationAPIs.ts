import { Simulation } from "../../model/Simulation";
import faunadb from "faunadb"

export const getSimulationByName = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, name: string) => {
    const response = await faunaClient.query(
        faunaQuery.Select("data", faunaQuery.Get(faunaQuery.Match(faunaQuery.Index('simulation_by_name'), name)))
    )
        .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
        ));
    return response as Simulation

}