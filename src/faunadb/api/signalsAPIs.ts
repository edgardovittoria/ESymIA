import { Signal } from "../../model/Port";
import faunadb from "faunadb"

export async function getSignals(faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query) {
    const response = await faunaClient.query(
        faunaQuery.Select("data",
            faunaQuery.Map(
                faunaQuery.Paginate(faunaQuery.Match(faunaQuery.Index("signals_all"))),
                faunaQuery.Lambda("signal", faunaQuery.Select("data", faunaQuery.Get(faunaQuery.Var("signal"))))
            )
        )
    )
        .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
        ));
    return response as Signal[]
}

export async function saveSignal(faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, newSignal: Signal) {
    await faunaClient.query((
        faunaQuery.Create(
            faunaQuery.Collection('Signals'),
            {
                data: {
                    ...newSignal
                }
            }
        )
    ))

}